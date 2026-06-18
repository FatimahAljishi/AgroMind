import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HistoryPage.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading history:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="history-page">
      <Navbar />

      <main className="history-card">
        <h1>Scan History</h1>

        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No scans yet.</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div
                className="history-item"
                key={item.diagnosis_id}
                onClick={() => navigate(`/history/${item.diagnosis_id}`)}
              >
                <h3>
                  {item.crop} — {item.disease_name}
                </h3>

                <p>
                  <strong>Severity:</strong> {item.severity}
                </p>

                <p>
                  <strong>Status:</strong> {item.status}
                </p>

                <p>
                  <strong>Confidence:</strong> {item.confidence}
                </p>

                <small>{new Date(item.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;
