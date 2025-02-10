import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Enterotp({ mail }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const validate = (e) => {
    let otpValue = e.target.value.replace(/\D/g, "");
    if (otpValue.length > 6) {
      otpValue = otpValue.slice(0, 6);
    }
    setOtp(otpValue);
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const resp = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail, otp }),
      });

      if (resp.ok) {
        console.log("OTP verified successfully");
        navigate("/changepass", { state: { email: mail, otpVerified: true } });
      } else {
        const errorData = await resp.json();
        console.error("Invalid OTP:", errorData.message);
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification", error);
      setError("Network error: Unable to verify OTP.");
    }
  };

  return (
    <form onSubmit={verify}>
      <p>OTP has been sent to {mail}</p>
      <label className="login-label">Enter OTP</label>
      <input
        className="login-input"
        value={otp}
        onChange={validate}
        type="text"
        maxLength="6"
        required
      />
      <button className="login-input" type="submit">
        Verify
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

export default Enterotp;
