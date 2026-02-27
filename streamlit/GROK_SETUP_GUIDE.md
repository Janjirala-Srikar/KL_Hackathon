# 🤖 Grok AI Health Recommendations Integration

## Overview

This guide helps you set up and use the AI-powered health recommendations feature in your Health Trends Streamlit dashboard. The recommendation engine uses **Grok** (powered by X.AI) to provide personalized health improvement suggestions based on abnormal biomarkers.

## Prerequisites

- Streamlit dashboard running
- X.AI API key (get one from [x.ai](https://x.ai) or [console.x.ai](https://console.x.ai))
- Internet connection

## Setup Instructions

### 1. Get Your X.AI API Key

1. Visit [console.x.ai](https://console.x.ai)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (keep it secure!)

### 2. Configure Streamlit Secrets

Streamlit securely manages API keys through the `secrets.toml` file.

**Option A: Using `.streamlit/secrets.toml` (Recommended for local development)**

1. Create/open the file: `.streamlit/secrets.toml` in your project root
2. Add your API key:

```toml
GROK_API_KEY = "your-api-key-here"
```

3. Save and restart your Streamlit app

**Option B: Streamlit Cloud Deployment**

1. Go to your Streamlit Cloud app settings
2. Navigate to "Secrets"
3. Add the same GROK_API_KEY with your API key value

### 3. Verify Installation

- Run the Streamlit app
- Navigate to the "All Biomarkers" tab
- You should see a "💡 Get Recommendations" button at the bottom
- Click it to get AI-powered recommendations for abnormal biomarkers

## Features

### What the Recommendations Include:

✅ **Key Health Insights** - Understanding what abnormal values mean
✅ **Lifestyle Recommendations** - Diet, exercise, sleep, and stress management tips  
✅ **Dietary Changes** - Specific foods and supplements to consider
✅ **When to See a Doctor** - Guidelines for professional medical consultation
✅ **Personalized Advice** - Tailored specifically to YOUR biomarker abnormalities

### How It Works:

1. **Filter Abnormal Biomarkers** - Only displays recommendations for out-of-range values
2. **AI Analysis** - Grok analyzes the context of each abnormality
3. **Contextual Recommendations** - Takes into account:
   - Direction of abnormality (too high/low)
   - Rate of change (% change trend)
   - Your specific biomarkers and values
   - Reference ranges

## Usage

### Getting Recommendations:

1. **Navigate to the "All Biomarkers" tab**
2. **Review your filtered biomarkers** if desired
3. **Click the "💡 Get Recommendations" button**
4. **Wait** for Grok to analyze your data (10-20 seconds typically)
5. **Read and apply** the AI-generated recommendations

### Interpreting Results:

- 🟢 **Green (Normal Range)**: All values within healthy ranges
- 🔴 **Red (Above Range)**: Values higher than recommended
- 🟡 **Yellow (Below Range)**: Values lower than recommended
- ↑ **Increased**: Biomarker went up from previous test
- ↓ **Decreased**: Biomarker went down from previous test
- → **Stable**: Biomarker remained relatively unchanged

## API Limits & Costs

### X.AI Grok API Pricing:
- Check current pricing at [x.ai/pricing](https://x.ai/pricing)
- Typically costs per token (input + output)
- First few requests often have free credits

### Rate Limits:
- Default: Several requests per minute
- Check your X.AI console for your specific limits
- If you hit limits, wait a few minutes before retrying

## Troubleshooting

### "Grok API key not configured"
- ✅ Add `GROK_API_KEY` to `.streamlit/secrets.toml`
- ✅ Restart your Streamlit app after adding secrets

### "Invalid Grok API key"
- ✅ Verify your key is correct and active at [console.x.ai](https://console.x.ai)
- ✅ Check for accidental spaces or formatting issues

### "Rate limit exceeded"
- ✅ Wait a few minutes before requesting recommendations again
- ✅ Check your X.AI console for current usage
- ✅ Consider upgrading your plan for higher limits

### "Cannot connect to Grok API"
- ✅ Check your internet connection
- ✅ Verify API endpoint is accessible
- ✅ Try again in a few moments (possible temporary outage)

### "Received empty response from Grok"
- ✅ This is rare; try clicking the button again
- ✅ Check your internet connection
- ✅ Verify the Grok API is operational

## Example Health Recommendations

Here's what you might see for abnormal biomarkers:

```
KEY INSIGHTS:
• Your cholesterol is elevated, indicating need for dietary adjustment
• Blood glucose is high, suggesting metabolic stress
• Inflammation markers are elevated across multiple tests

PRACTICAL RECOMMENDATIONS:

1. DIET CHANGES (Priority 1)
   - Increase fiber intake to 25-30g daily (oats, berries, vegetables)
   - Reduce refined carbohydrates and processed foods
   - Add omega-3 rich foods (salmon, walnuts, flaxseed)
   - Limit saturated fats to <7% of daily calories

2. EXERCISE (Priority 2)
   - 150 minutes moderate cardio per week (brisk walking, cycling)
   - 2x strength training per week
   - Daily 10-minute walks after meals to manage blood glucose

3. SUPPLEMENTS TO CONSIDER
   - Vitamin D3 (1000-2000 IU daily) if deficient
   - Omega-3 fish oil (1000mg EPA+DHA daily)
   - Consult doctor before starting any supplements

4. STRESS & SLEEP
   - Aim for 7-9 hours of quality sleep
   - Reduce screen time 1 hour before bed
   - Practice 10 minutes of daily meditation or deep breathing

WHEN TO CONSULT YOUR DOCTOR:
- If cholesterol remains high after 3 months of lifestyle changes
- If blood glucose symptoms worsen (excessive thirst, fatigue)
- If energy levels don't improve within 2 weeks
```

## File Structure

```
streamlit/
├── health_trends_streamlit.py    # Main dashboard (modified)
├── grok_recommendations.py       # NEW: Grok integration
├── requirements.txt              # Python dependencies
└── GROK_SETUP_GUIDE.md          # This file
```

## Key Functions in `grok_recommendations.py`

### `get_grok_recommendations(abnormal_biomarkers, api_key=None)`
Calls Grok API with abnormal biomarkers and returns personalized recommendations.

### `format_biomarkers_for_prompt(biomarkers)`
Formats biomarker data into a readable prompt for Grok.

### `display_recommendations(abnormal_biomarkers, api_key=None)`
Displays recommendations in the Streamlit UI with proper styling.

## Security Notes

🔒 **Never commit your API key to version control!**

1. Add `.streamlit/secrets.toml` to `.gitignore`:
```
.streamlit/secrets.toml
```

2. Use environment variables for production:
```python
import os
api_key = os.getenv("GROK_API_KEY")
```

3. For team sharing, use Streamlit Cloud secrets management

## Feedback & Improvements

If you want to customize the recommendations:

1. **Modify the prompt** in `get_grok_recommendations()` to ask different questions
2. **Adjust temperature** (0.0-1.0) for more/less creative responses
3. **Change max_tokens** for longer/shorter responses
4. **Add follow-up questions** based on user feedback

## Next Steps

1. ✅ Get your X.AI API key
2. ✅ Add it to `.streamlit/secrets.toml`
3. ✅ Restart Streamlit
4. ✅ Click "💡 Get Recommendations" to test
5. ✅ Enjoy AI-powered health insights!

## Support

For issues with:
- **X.AI/Grok**: Visit [x.ai support](https://x.ai)
- **Streamlit**: Check [docs.streamlit.io](https://docs.streamlit.io)
- **This Integration**: Review the code in `grok_recommendations.py`

---

**Last Updated**: February 2026  
**Status**: ✅ Fully Integrated
