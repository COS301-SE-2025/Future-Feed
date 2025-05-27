import "./css/Login.css";
import logo from "../assets/Future feed transparent-Photoroom.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="forgot-container">
      <img src={logo} className="logo" alt="Future Feed Logo" />
      <div className="forgot-box">
        <h2>Forgot Password</h2>

        <form>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required />

        <button type="submit"><span className="login_text">Reset password</span></button>
        </form>
      </div>
    </div>
  );
};

export default Login;
