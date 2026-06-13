import "./LandingPage.css";
import { PiPlant, PiImage, PiCamera } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  async function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    localStorage.setItem("cropImage", imageUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("API RESULT:", data);

      localStorage.setItem("diagnosisResult", JSON.stringify(data));

      navigate("/diagnosis");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="phone">
      <section className="hero">
        <div className="logo-circle">
          <PiPlant />
        </div>

        <h1>What's wrong with your crop?</h1>

        <p>
          Take a photo or upload one.
          <br />
          AI will diagnose it in seconds.
        </p>
      </section>

      <main className="content">
        <label className="upload-card">
          <PiImage className="upload-icon" />
          <h3>Upload a crop photo</h3>
          <p>JPG or PNG · Tap to browse</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
        </label>

        <div className="button-row">
          <button className="action-btn">
            <PiCamera />
            Take a photo now
          </button>

          <button className="action-btn">
            <PiImage />
            Choose from gallery
          </button>
        </div>
      </main>

      <div className="home-indicator"></div>
    </div>
  );
}

export default LandingPage;
