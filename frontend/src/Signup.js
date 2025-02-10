import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [user, setUser] = useState("");
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");

  let navigate = useNavigate();
  async function adding(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/addingUser", {
        method: "POST", // Use POST method instead of GET
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify({
          user: user,
          mail: mail,
          pass: pass,
        }), // Send the data in the request body
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        setUser("");
        setMail("");
        setPass("");
        navigate("/");
      } else {
        alert(result.error || "Failed to register.");
      }
    } catch (error) {
      alert("An error occurred while registering the user.");
    }
  }

  return (
    <div className="login-body">
      <div className="login-container">
        <form onSubmit={adding}>
          <div>
            <label className="login-label">Username</label>
            <input
              className="login-input"
              placeholder="Enter your username"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="login-label">Email</label>
            <input
              className="login-input"
              placeholder="Enter your email"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="login-label">Password</label>
            <input
              className="login-input"
              placeholder="Enter your password"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-input">
            Register
          </button>
        </form>
        <div className="login-label">
          Already have an account? <a href="/">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
