import { useState, useRef } from "react";
import axios from "axios";
import "../Styles/Upload.css";

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const Upload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (incoming) => {
    setError("");
    setResult(null);

    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      setError("Only .pdf files are supported.");
      return;
    }
    setFile(incoming);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // IMPORTANT: matches backend

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // backend returns data array
      const processed = res.data?.data?.[0];
      setResult(processed);

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to process PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="upload-page">
      <div className="upload-page-inner">

        <h1>Medical Lab Report Intelligence</h1>

        {/* Upload Section */}
        {!result && (
          <div className="upload-section">

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {!file ? (
              <button onClick={() => inputRef.current.click()}>
                Upload PDF
              </button>
            ) : (
              <div>
                <p><strong>{file.name}</strong></p>
                <p>{formatBytes(file.size)}</p>

                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Processing..." : "Generate Report"}
                </button>
              </div>
            )}

            {error && <p className="error">{error}</p>}
          </div>
        )}

        {/* RESULT DISPLAY SECTION */}
        {result && (
          <div className="result-section">

            <h2>Patient Details</h2>
            <div className="patient-info">
              <p><strong>Name:</strong> {result.structured_data?.patient_name}</p>
              <p><strong>Age:</strong> {result.structured_data?.age}</p>
              <p><strong>Gender:</strong> {result.structured_data?.gender}</p>
            </div>

            <h2>Test Results</h2>
            <table className="test-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {result.structured_data?.tests?.map((test, index) => (
                  <tr key={index}>
                    <td>{test.test_name}</td>
                    <td>{test.value || "-"}</td>
                    <td>{test.unit || "-"}</td>
                    <td>{test.reference_range || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>AI Explanation</h2>

            <div className="explanation-block">
              <h3>English</h3>
              <p>{result.explanation?.english}</p>
            </div>

            <div className="explanation-block">
              <h3>Telugu</h3>
              <p>{result.explanation?.telugu}</p>
            </div>

            <div className="explanation-block">
              <h3>Hindi</h3>
              <p>{result.explanation?.hindi}</p>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Upload Another File
            </button>

          </div>
        )}

      </div>
    </main>
  );
};

export default Upload;