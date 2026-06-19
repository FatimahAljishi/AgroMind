import "./DiagnosisPage.css";
import { PiPlant, PiArrowLeft, PiShareNetwork } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

function DiagnosisPage() {
  const diagnosis = JSON.parse(localStorage.getItem("diagnosisResult"));
  const navigate = useNavigate();
  const imageUrl = localStorage.getItem("cropImage");

  return (
    <div className="diagnosis-page">
      <nav className="nav-bar">
        <PiArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <h1>Plant Diagnosis</h1>
      </nav>

      <div className="progress-dots">
        <span className="active"></span>
        <span></span>
        <span></span>
      </div>

      <main className="diagnosis-content">
        <section className="photo-card">
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded crop" className="crop-preview" />
          ) : (
            <>
              <PiPlant />
              <p>Crop photo</p>
            </>
          )}
        </section>

        <section className="info-grid">
          <div>
            <span>CROP TYPE</span>
            <strong>{diagnosis?.crop}</strong>
          </div>

          <div>
            <span>GROWTH STAGE</span>
            <strong>{diagnosis?.growth_stage}</strong>
          </div>
        </section>

        <section className="result-card">
          <p className="eyebrow">DIAGNOSIS RESULT</p>

          <div className="result-header">
            <h2>{diagnosis?.disease_name}</h2>
            <span className="confidence">{diagnosis?.confidence}</span>
          </div>

          <div className="tags">
            <span>{diagnosis?.disease_type}</span>
            <span>{diagnosis?.spread_rate}</span>
          </div>

          <p className="description">{diagnosis?.explanation}</p>
          <h3>SYMPTOMS DETECTED</h3>

          <ul>
            {diagnosis?.symptoms?.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
          <div className="severity">
            <span>Severity</span>
            <div className="severity-bar">
              <div></div>
            </div>
            <strong>{diagnosis?.severity}</strong>
          </div>
        </section>

        <button
          className="primary-action"
          onClick={() => navigate("/treatment")}
        >
          View treatment guide ↗
        </button>

        <button
          className="secondary-action"
          onClick={() => navigate("/products")}
        >
          Skip to products ↗
        </button>
      </main>
    </div>
  );
}

export default DiagnosisPage;
