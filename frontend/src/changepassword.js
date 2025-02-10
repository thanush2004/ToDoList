import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Changepass() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otpVerified = location.state?.otpVerified;

  const [newpass, setNewpass] = useState("");
  const [repass, setRepass] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!email || !otpVerified) {
      console.error("Email not provided or OTP not verified. Redirecting...");
      navigate("/");
    }
  }, [email, otpVerified, navigate]);

  const evaluation = async (e) => {
    console.log(email, newpass);
    e.preventDefault();
    if (newpass === repass) {
      try {
        const res = await fetch(
          `http://localhost:5000/update?password=${newpass}&email=${email}`
        );

        if (res.ok) {
          alert("User updated successfully");
          navigate("/");
        } else {
          alert("Unable to update user");
        }
      } catch (error) {
        console.error("Error during password update:", error);
      }
    } else {
      setConfirm("Passwords do not match");
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2>Change Password</h2>
        <form onSubmit={evaluation}>
          <label className="login-label">Enter New Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Enter new password"
            onChange={(e) => setNewpass(e.target.value)}
            required
          />
          <label className="login-label">Re-enter New Password</label>
          <input
            type="password"
            className="login-input"
            placeholder="Re-enter new password"
            onChange={(e) => setRepass(e.target.value)}
            required
          />
          <button className="login-input" type="submit">
            Proceed
          </button>
          <p>Click to update password for {email}</p>
          {confirm && <AlertDisplay message={confirm} />}
        </form>
      </div>
    </div>
  );
}

export const AlertDisplay = ({ message }) => {
  return (
    <div style={{ color: "red", marginTop: "10px" }}>
      <h4>{message}</h4>
    </div>
  );
};

export default Changepass;
