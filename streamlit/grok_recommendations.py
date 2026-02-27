"""
GROQ AI HEALTH RECOMMENDATIONS
Integrated with Streamlit for personalized health improvement suggestions
"""

import requests
import json
import streamlit as st

GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS_ENDPOINT = "https://api.groq.com/openai/v1/models"
# Try models in order of preference
GROQ_MODELS = [
    "mixtral-8x7b-32768",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3-70b-8192",
    "llama2-70b-4096",
    "gemma2-9b-it"
]

def get_available_models(api_key):
    """
    Fetch list of available models from Groq API.
    
    Returns:
        list: Available model IDs or empty list if fetch fails
    """
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        response = requests.get(
            GROQ_MODELS_ENDPOINT,
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if "data" in result:
                models = [m.get("id") for m in result["data"] if m.get("id")]
                return models
        return []
    except:
        return []

def get_groq_recommendations(abnormal_biomarkers, api_key=None):
    """
    Fetch health improvement recommendations from Groq based on abnormal biomarkers.
    
    Args:
        abnormal_biomarkers: List of dicts with abnormal biomarker data
        api_key: Groq API key (if None, tries to get from Streamlit secrets)
    
    Returns:
        str: Personalized health recommendations from Groq
    """
    if api_key is None:
        try:
            api_key = st.secrets.get("GROQ_API_KEY") or st.secrets.get("GROQ_API_KEY")
        except:
            return "⚠️ Groq API key not configured. Add GROQ_API_KEY to Streamlit secrets."
    
    if not api_key or api_key.strip() == "your-groq-api-key-here":
        return "⚠️ Groq API key is not set. Please add your real API key to Streamlit secrets (.streamlit/secrets.toml)."
    
    # Build prompt with abnormal biomarkers
    biomarker_summary = format_biomarkers_for_prompt(abnormal_biomarkers)
    
    prompt = f"""You are a health advisor assistant. Based on the following abnormal lab biomarker results, 
provide practical, evidence-based health improvement recommendations.

ABNORMAL BIOMARKERS:
{biomarker_summary}

Please provide:
1. 2-3 key insights about what these abnormal values indicate
2. 5-7 practical lifestyle recommendations tailored to these results (diet, exercise, sleep, stress)
3. When to consult a healthcare professional
4. Important supplements or dietary changes to consider (if applicable)

Keep recommendations concise but actionable. Format with clear headings."""
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Try to get available models from API
        available_models = get_available_models(api_key)
        models_to_try = available_models if available_models else GROQ_MODELS
        
        # Try each model until one works
        for model in models_to_try:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            response = requests.post(
                GROQ_API_ENDPOINT,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            # If model found, use this response
            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    return "⚠️ Received empty response from Groq API."
            
            # If model not found, try next one
            elif response.status_code == 400:
                resp_text = response.text
                if "Model not found" in resp_text or "model_not_found" in resp_text.lower():
                    continue
                else:
                    return f"❌ Groq API error: {resp_text[:300]}"
            
            # Auth issues - stop trying
            elif response.status_code == 401:
                return "❌ Invalid Groq API key. Please verify your API key at console.groq.com"
            elif response.status_code == 403:
                return "❌ Permission denied. Check your API key permissions."
            elif response.status_code == 429:
                return "⏸️ Groq API rate limit exceeded. Please try again later."
            elif response.status_code >= 500:
                continue  # Try next model for server errors
        
        # If all models failed, provide helpful message
        error_msg = "❌ Could not reach any Groq models. Possible causes:\n"
        if available_models:
            error_msg += f"• Tried available models: {', '.join(available_models[:5])}\n"
        else:
            error_msg += f"• Tried fallback models: {', '.join(GROQ_MODELS)}\n"
        error_msg += "• Check if your Groq account has API access enabled\n"
        error_msg += "• Verify your API key is correct at https://console.groq.com"
        return error_msg
    
    except requests.exceptions.Timeout:
        return "⏱️ Groq API request timed out. Please try again."
    except requests.exceptions.ConnectionError:
        return "🔌 Cannot connect to Groq API. Check your internet connection."
    except Exception as e:
        return f"❌ Error fetching recommendations: {str(e)}"


def format_biomarkers_for_prompt(biomarkers):
    """Format biomarker data for the Grok prompt."""
    formatted = []
    for bm in biomarkers:
        current = bm.get("curr", "N/A")
        reference = bm.get("ref", "N/A")
        unit = bm.get("unit", "")
        status = bm.get("status", "unknown").upper()
        percent_change = bm.get("pct", 0)
        test_name = bm.get("test_name", "Unknown Test")
        
        line = (
            f"- {test_name}: {current} {unit} ({status})\n"
            f"  Reference: {reference}\n"
            f"  Change: {percent_change:+.1f}% from previous test"
        )
        formatted.append(line)
    
    return "\n".join(formatted)


def display_recommendations(abnormal_biomarkers, api_key=None, compact=False):
    """
    Display recommendations in Streamlit with proper styling.
    
    Args:
        abnormal_biomarkers: List of abnormal biomarker dicts
        api_key: Groq API key
        compact: If True, use compact styling for side panel
    """
    if not abnormal_biomarkers:
        st.info("✅ All biomarkers are within normal ranges!")
        return
    
    if compact:
        # Compact version for right-side panel
        st.markdown("""
        <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;
                    letter-spacing:.05em;font-weight:600;margin-bottom:.8rem">
            Abnormal Biomarkers
        </div>
        """, unsafe_allow_html=True)
        
        # Show abnormal biomarkers summary
        for bm in abnormal_biomarkers[:5]:
            status_color = {"high": "#fb7185", "low": "#fbbf24", "normal": "#4ade80"}.get(bm.get("status"), "#9ca3af")
            st.markdown(f"""
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,0.08);
                        font-size:.75rem">
                <div style="flex:1">
                    <div style="color:var(--text);font-weight:500">{bm.get('short', 'Unknown')}</div>
                    <div style="color:var(--muted);font-size:.7rem;margin-top:.2rem">{bm.get('curr',0)} {bm.get('unit','')}</div>
                </div>
                <div style="color:{status_color};font-weight:600;font-size:.7rem">
                    {bm.get('status', 'unknown').upper()}
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        if len(abnormal_biomarkers) > 5:
            st.markdown(f"""
            <div style="color:var(--muted);font-size:.7rem;text-align:center;
                        padding:.5rem;margin-top:.3rem;border-top:1px solid rgba(255,255,255,0.08)">
                +{len(abnormal_biomarkers)-5} more biomarkers
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("""
        <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;
                    letter-spacing:.05em;font-weight:600;margin-bottom:.8rem;margin-top:1rem">
            AI Recommendations
        </div>
        """, unsafe_allow_html=True)
        
        with st.spinner("🧠 Groq is analyzing..."):
            recommendations = get_groq_recommendations(abnormal_biomarkers, api_key)
        
        st.markdown("""
        <div style="background:rgba(45,212,191,0.06);border-left:2px solid #2dd4bf;padding:.9rem;
                    border-radius:4px;font-size:.8rem;line-height:1.5;color:var(--text)">
        """, unsafe_allow_html=True)
        
        st.markdown(recommendations)
        
        st.markdown("</div>", unsafe_allow_html=True)
        
        st.markdown("""
        <div style="font-size:.65rem;color:var(--muted);margin-top:.7rem;font-style:italic;
                    line-height:1.4;border-top:1px solid rgba(255,255,255,0.08);padding-top:.7rem">
        ⚕️ <strong>Disclaimer:</strong> These recommendations are for informational purposes only. Always consult with a healthcare professional.
        </div>
        """, unsafe_allow_html=True)
    
    else:
        # Full version for main content area
        st.markdown("---")
        st.markdown('<div class="chart-card">', unsafe_allow_html=True)
        st.markdown("""
        <div class="sec-head">🤖 AI-Powered Health Recommendations</div>
        <div class="sec-sub">Personalized insights from Groq based on your abnormal biomarkers</div>
        """, unsafe_allow_html=True)
        
        with st.spinner("🧠 Groq is analyzing your biomarkers..."):
            recommendations = get_groq_recommendations(abnormal_biomarkers, api_key)
        
        st.markdown("""
        <div style="background:rgba(45,212,191,0.08);border-left:3px solid #2dd4bf;padding:1.2rem;
                    border-radius:6px;margin:1rem 0;font-size:.95rem;line-height:1.6">
        """, unsafe_allow_html=True)
        
        st.markdown(recommendations)
        
        st.markdown("</div>", unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown("""
        <div style="font-size:.75rem;color:var(--muted);margin-top:.8rem;font-style:italic">
        ⚕️ Disclaimer: These recommendations are for informational purposes only. 
        Always consult with a qualified healthcare professional before making significant changes to your health regimen.
        </div>
        """, unsafe_allow_html=True)
