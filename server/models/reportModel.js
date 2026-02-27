const pool = require("../config/database");

const saveMedicalReport = async (userId, fileName, extractedText, structuredData, explanation) => {
  const [result] = await pool.execute(
    "INSERT INTO medical_reports (user_id, file_name, extracted_text, structured_data, explanation, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [userId, fileName, extractedText, JSON.stringify(structuredData), JSON.stringify(explanation)]
  );
  return result;
};

const getMedicalReportsByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM medical_reports WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

const getMedicalReportById = async (reportId, userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM medical_reports WHERE id = ? AND user_id = ?",
    [reportId, userId]
  );
  return rows[0];
};

module.exports = {
  saveMedicalReport,
  getMedicalReportsByUserId,
  getMedicalReportById
};
