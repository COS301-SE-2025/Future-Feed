import React, { useState } from "react";
import "./css/Forgot.css";
import logo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/Google transparent.png";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api"; // Assuming you have a loginUser function in your API module

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ username, password });
      console.log("Login response:", response);
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
      <img src={logo} className="logo" alt="Future Feed Logo" />
      <div className="login-box">
        <h2>Login</h2>

        <Link to="/construction" className="Construction-link">
          <div className="google-login">
            Continue with:
            <img src={googleLogo} alt="Google Login" className="Glogo" />
          </div>
        </Link>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="username"
            id="username"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <div className="forgot">
            <Link to="/forgotpassword" className="Construction-link">
              Forgot password?
            </Link>
          </div>

          <div className="log_reg">
            <button type="submit">
              <span className="login_text">Login</span>
            </button>
            <p className="register">
              Don’t have an account?{" "}
              <Link to="/register" className="reg">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
