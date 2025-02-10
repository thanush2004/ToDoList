import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Enterotp from "./Enterotp";

function Fop() {
  let navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function generate(e) {
    e.preventDefault();
    setError("");
    try {
      const resp = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail }),
      });
      if (resp.ok) {
        console.log("OTP sent successfully");
        setSent(true);
      } else {
        const error = await resp.json();
        console.error("Error:", error.message);
        setError("Failed to send OTP: " + error.message);
      }
    } catch (error) {
      console.error("Unable to fetch:", error);
      setError("Network error: Unable to reach the server.");
    }
  }

  return (
    <div className="login-body">
      <div className="login-container">
        <form onSubmit={generate}>
          <label className="login-label">Enter your Mail</label>
          <input
            className="login-input"
            placeholder="Enter your email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            type="email"
            required
          />
          <button className="login-input" type="submit">
            Proceed
          </button>
          <button className="login-input" onClick={() => navigate("/")}>
            BACK
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {sent && <Enterotp mail={mail} />}
      </div>
    </div>
  );
}

export default Fop;
