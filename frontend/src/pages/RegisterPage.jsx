import { Link } from "react-router-dom";
import "./css/Register.css";
import logo from "../assets/Future feed transparent-Photoroom.png";

function RegisterPage() {
  return (
    <div className="register-container">
      <div className="logo-container">
        <img src={logo} className="logo" alt="Future Feed Logo" />
      </div>

      <div className="register-box">
        <h2>Register</h2>
        <form>
          <label htmlFor="profilePic">Profile Picture</label>
          <input type="file" id="profilePic" accept="image/*"/>

          <label htmlFor="displayName">Display Name</label>
          <input type="text" id="displayName" placeholder="Enter your display name" required autoComplete="name"/>

          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter your username (without @)" required autoComplete="off"/>

          <label htmlFor="bio">Bio</label>
          <textarea id="bio" rows="4" placeholder="Tell us about yourself..." />

          <label htmlFor="dob">Date of Birth</label>
          <input type="date" id="dob" required/>

          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required autoComplete="email"/>

          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter a password" required autoComplete="new-password"/>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" placeholder="Confirm your password" required autoComplete="new-password"/>

          <div className="log-reg">
            <button type="submit"> Register </button>
            <span className="reg-text">Already have an account? <Link to="/login">Login here</Link></span>
          </div>
        </form>

        <div className="log-reg">
            
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
