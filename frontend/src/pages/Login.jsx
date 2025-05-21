import React from "react";
import "./css/Login.css";
import logo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/Google transparent.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="login-container">
      <img src={logo} className="logo" alt="Future Feed Logo" />
      <div className="login-box">
        <h2>Login</h2>

        <Link to="/construction" className="Construction-link">
            <div className="google-login">
            Continue with: 
            <img src={googleLogo} alt="Google Login" className="Glogo"/>
            </div>
        </Link>

        <form>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" required />

          <div className="forgot">
            <Link to="/construction" className="Construction-link">
                Forgot password?
            </Link>
          </div>

          <div className="log_reg">
            <button type="submit"><span className="login_text">Login</span></button>
            <p className="register">
              Don’t have an account? <Link to="/construction" className="reg">Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
