// ==========================================
// utils/embedding.js (FIXED FOR NODE v20)
// ==========================================

// We cannot use require() because transformers is ESM.
// So we load it dynamically.

let env, AutoTokenizer, AutoModel;

async function loadTransformers() {
  if (env && AutoTokenizer && AutoModel) return;

  const transformers = await import("@xenova/transformers");

  env = transformers.env;
  AutoTokenizer = transformers.AutoTokenizer;
  AutoModel = transformers.AutoModel;

  env.allowLocalModels = true;
  env.allowRemoteModels = true;
}

let model = null;
let tokenizer = null;

// ==========================================
// INITIALIZE MODEL (Lazy Load)
// ==========================================
async function initializeModel() {
  if (model && tokenizer) return;

  await loadTransformers(); // 👈 Important fix

  console.log("🔄 Loading MiniLM embedding model...");

  tokenizer = await AutoTokenizer.from_pretrained(
    "Xenova/all-MiniLM-L6-v2"
  );

  model = await AutoModel.from_pretrained(
    "Xenova/all-MiniLM-L6-v2"
  );

  console.log("✅ MiniLM loaded successfully!");
}

// ==========================================
// CORRECT MEAN POOLING (Batch Safe)
// ==========================================
function meanPooling(lastHiddenState, attentionMask) {
  const [batchSize, seqLength, hiddenSize] = lastHiddenState.dims;
  const data = lastHiddenState.data;

  const meanPooled = new Array(hiddenSize).fill(0);
  let validTokens = 0;

  for (let i = 0; i < seqLength; i++) {
    const maskValue =
      attentionMask && attentionMask.data
        ? attentionMask.data[i]
        : attentionMask?.[i];

    if (maskValue === 0) continue;

    validTokens++;

    for (let j = 0; j < hiddenSize; j++) {
      const index = i * hiddenSize + j;
      meanPooled[j] += data[index];
    }
  }

  if (validTokens > 0) {
    for (let i = 0; i < hiddenSize; i++) {
      meanPooled[i] /= validTokens;
    }
  }

  return meanPooled;
}

// ==========================================
// NORMALIZE VECTOR (Unit Length)
// ==========================================
function normalizeVector(vec) {
  const magnitude = Math.sqrt(
    vec.reduce((sum, v) => sum + v * v, 0)
  );

  if (magnitude === 0) return vec;

  return vec.map((v) => v / magnitude);
}

// ==========================================
// COSINE SIMILARITY
// ==========================================
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  for (let i = 0; i < vecA.length; i++) {
    normA += vecA[i] * vecA[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==========================================
// MAIN EMBEDDING FUNCTION
// ==========================================
async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text for embedding");
    }

    const trimmed = text.trim().slice(0, 512);

    await initializeModel();

    const encoded = tokenizer(trimmed, {
      padding: true,
      truncation: true,
      return_tensors: "pt",
    });

    const output = await model(encoded);

    const pooled = meanPooling(
      output.last_hidden_state,
      encoded.attention_mask
    );

    const normalized = normalizeVector(pooled);

    console.log("Embedding length:", normalized.length);

    return normalized;
  } catch (error) {
    console.error("❌ Local Embedding Error:", error.message);
    throw error;
  }
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  generateEmbedding,
  cosineSimilarity,
  normalizeVector,
};