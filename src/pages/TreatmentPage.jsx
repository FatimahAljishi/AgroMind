import "./TreatmentPage.css";
import { PiArrowLeft, PiShareNetwork } from "react-icons/pi";

function TreatmentPage() {
  const diagnosis = JSON.parse(localStorage.getItem("diagnosisResult"));
  return (
    <div className="treatment-page">
      <nav className="treatment-nav">
        <PiArrowLeft />
        <h1>Treatment guide</h1>
        <PiShareNetwork />
      </nav>

      <div className="treatment-dots">
        <span></span>
        <span className="active"></span>
        <span></span>
      </div>

      <main className="treatment-content">
        <section className="disease-summary">
          <p>
            {diagnosis?.crop} · {diagnosis?.disease_type}
          </p>
          <h2>{diagnosis?.disease_name}</h2>
        </section>

        <section className="when-section">
          <div>
            <p>START TREATMENT</p>
            <strong>Within 24 hrs</strong>
          </div>

          <div>
            <p>BEST TIME OF DAY</p>
            <strong>Early morning</strong>
          </div>
        </section>

        <h3 className="section-title">TREATMENT STEPS</h3>

        <section className="steps-list">
          {diagnosis?.treatment?.map((step, index) => (
            <article className="step-card" key={index}>
              <span className="step-number">{index + 1}</span>

              <div>
                <p>{step}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default TreatmentPage;
