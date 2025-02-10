import "./styles.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function verify(e) {
    e.preventDefault();
    try {
      let response = await fetch(
        `http://localhost:5000/verifying?username=${username}&password=${password}`
      );
      if (response.ok) {
        alert("Login Successfull !!!");
        navigate("/home", {
          state: { username: username },
        });
      } else {
        let errorData = await response.json();
        alert(errorData.error || "Invalid credentials.");
      }
    } catch (error) {
      alert("An error occurred while verifying credentials.");
    }
  }

  return (
    <div className="login-body">
      <div className="login-container">
        <form onSubmit={verify}>
          <div>
            <label className="login-label">USERNAME :</label>
            <input
              className="login-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="login-label">PASSWORD :</label>
            <input
              type="password"
              className="login-input"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-input">
            Submit
          </button>
        </form>
        <div className="already">
          <div className="alreadylogin">
            <label>New user ?</label>
            <button
              className="alreadyinput"
              onClick={() => {
                navigate("./signup");
              }}
            >
              Sign-Up
            </button>
          </div>
          <div className="alreadylogin">
            Forgot Password ?
            <button
              className="alreadyinput"
              onClick={() => {
                navigate("./fop");
              }}
            >
              change password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
