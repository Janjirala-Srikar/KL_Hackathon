const pool = require("../config/database");

// ==========================================
// SAVE MAIN MEDICAL REPORT
// ==========================================
const saveMedicalReport = async (
  userId,
  fileName,
  extractedText,
  structuredData,
  explanation
) => {
  const [result] = await pool.execute(
    `INSERT INTO medical_reports 
    (user_id, file_name, extracted_text, structured_data, explanation, created_at) 
    VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      fileName,
      extractedText,
      JSON.stringify(structuredData),
      JSON.stringify(explanation),
    ]
  );

  return result;
};

// ==========================================
// SAVE EACH INDIVIDUAL TEST VALUE
// ==========================================
const saveMedicalTestValue = async (
  userId,
  reportId,
  testName,
  value,
  unit,
  referenceRange
) => {
  const [result] = await pool.execute(
    `INSERT INTO medical_test_values
    (user_id, report_id, test_name, value, unit, reference_range, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [userId, reportId, testName, value, unit, referenceRange]
  );

  return result;
};

// ==========================================
// SAVE EMBEDDING (medical reports)
// ==========================================
const saveEmbedding = async (
  userId,
  reportId,
  summaryText,
  embeddingArray
) => {
  const [result] = await pool.execute(
    `INSERT INTO medical_embeddings
    (user_id, report_id, summary_text, embedding)
    VALUES (?, ?, ?, ?)`,
    [
      userId,
      reportId,
      summaryText,
      JSON.stringify(embeddingArray),
    ]
  );

  return result;
};

// ==========================================
// GET ALL EMBEDDINGS FOR USER (RAG)
// ==========================================
const getUserEmbeddings = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT id, report_id, summary_text, embedding
     FROM medical_embeddings
     WHERE user_id = ?`,
    [userId]
  );

  return rows;
};

// ==========================================
// CHAT HISTORY - TAG BASED GROUPING
// ==========================================

// Save chat with tags
const saveChatHistory = async (
  userId,
  groupId,
  question,
  answer,
  embedding,
  tags
) => {
  const [result] = await pool.execute(
    `INSERT INTO chat_history
     (user_id, group_id, question, answer, embedding, tags, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      groupId,
      question,
      answer,
      JSON.stringify(embedding),
      JSON.stringify(tags),
    ]
  );

  return result;
};

// 🔥 UPDATED — Only select needed fields
const getUserQuestions = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT group_id, tags
     FROM chat_history
     WHERE user_id = ?`,
    [userId]
  );

  return rows;
};

// Get conversation history for specific group
const getGroupHistory = async (userId, groupId) => {
  const [rows] = await pool.execute(
    `SELECT question, answer
     FROM chat_history
     WHERE user_id = ? AND group_id = ?
     ORDER BY created_at ASC`,
    [userId, groupId]
  );

  return rows;
};

// 🔥 Optional: Get all distinct groups for user
const getUserGroups = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT DISTINCT group_id
     FROM chat_history
     WHERE user_id = ?`,
    [userId]
  );

  return rows;
};

// 🔥 Optional: Delete empty group safeguard
const deleteGroupIfEmpty = async (userId, groupId) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count
     FROM chat_history
     WHERE user_id = ? AND group_id = ?`,
    [userId, groupId]
  );

  if (rows[0].count === 0) {
    await pool.execute(
      `DELETE FROM chat_history
       WHERE user_id = ? AND group_id = ?`,
      [userId, groupId]
    );
  }
};

// ==========================================
// GET ALL REPORTS FOR USER
// ==========================================
const getMedicalReportsByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM medical_reports 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

// ==========================================
// GET SINGLE REPORT
// ==========================================
const getMedicalReportById = async (reportId, userId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM medical_reports 
     WHERE id = ? AND user_id = ?`,
    [reportId, userId]
  );

  return rows[0];
};

// ==========================================
// GET HISTORY OF SPECIFIC TEST
// ==========================================
const getTestHistoryByName = async (userId, testName) => {
  const [rows] = await pool.execute(
    `SELECT value, unit, created_at
     FROM medical_test_values
     WHERE user_id = ?
     AND test_name = ?
     ORDER BY created_at ASC`,
    [userId, testName]
  );

  return rows;
};

// ==========================================
// GET ALL TEST HISTORY
// ==========================================
const getAllTestHistory = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT test_name, value, unit, created_at
     FROM medical_test_values
     WHERE user_id = ?
     ORDER BY test_name, created_at ASC`,
    [userId]
  );

  return rows;
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  saveMedicalReport,
  saveMedicalTestValue,
  saveEmbedding,
  getUserEmbeddings,
  saveChatHistory,
  getUserQuestions,
  getGroupHistory,
  getUserGroups,
  deleteGroupIfEmpty,
  getMedicalReportsByUserId,
  getMedicalReportById,
  getTestHistoryByName,
  getAllTestHistory,
};