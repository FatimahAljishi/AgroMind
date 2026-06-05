import "./DiagnosisPage.css";
import { PiPlant, PiArrowLeft, PiShareNetwork } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

function DiagnosisPage() {
  const navigate = useNavigate();
  const imageUrl = localStorage.getItem("cropImage");
  const diagnosisResult = JSON.parse(localStorage.getItem("diagnosisResult"));

  return (
    <div className="diagnosis-page">
      <nav className="nav-bar">
        <PiArrowLeft />
        <h1>Plant Diagnosis</h1>
        <PiShareNetwork />
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
            <strong>{diagnosisResult?.crop}</strong>
          </div>

          <div>
            <span>GROWTH STAGE</span>
            <strong>{diagnosisResult?.growth_stage}</strong>
          </div>
        </section>

        <section className="result-card">
          <p className="eyebrow">DIAGNOSIS RESULT</p>

          <div className="result-header">
            <h2>{diagnosisResult?.disease_name}</h2>
            <span className="confidence">{diagnosisResult?.confidence}</span>
          </div>

          <div className="tags">
            <span>{diagnosisResult?.disease_type}</span>
            <span>{diagnosisResult?.spread_rate}</span>
          </div>

          <p className="description">{diagnosisResult?.explanation}</p>

          <h3>SYMPTOMS DETECTED</h3>

          <ul>
            <li>{diagnosisResult?.symptoms?.[0]}</li>
            <li>{diagnosisResult?.symptoms?.[1]}</li>
            <li>{diagnosisResult?.symptoms?.[2]}</li>
          </ul>

          <div className="severity">
            <span>Severity</span>
            <div className="severity-bar">
              <div></div>
            </div>
            <strong>{diagnosisResult?.severity}</strong>
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
