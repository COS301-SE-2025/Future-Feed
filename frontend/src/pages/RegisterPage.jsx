import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import React, { useState } from "react";
import "./css/Register.css";
import logo from "../assets/Future feed transparent-Photoroom.png";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePic: null,
    displayName: "",
    username: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "profilePic") {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    

    try {
      const payload = {
        displayName: formData.displayName,
        username: formData.username,
        dob: formData.dob,
        email: formData.email,
        password: formData.password,
      };

      const response = await registerUser(payload);
      console.log("Registration response:", response);
      alert("Registration successful!");
      navigate("/login"); // Change this to your actual home route
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert("Registration failed. Please check your inputs and try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="logo-container">
        <img src={logo} className="logo" alt="Future Feed Logo" />
      </div>

      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="profilePic">Profile Picture</label>
          <input type="file" id="profilePic" accept="image/*" onChange={handleChange} />

          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            placeholder="Enter your display name"
            required
            value={formData.displayName}
            onChange={handleChange}
          />

          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username (without @)"
            required
            value={formData.username}
            onChange={handleChange}
          />

          <label htmlFor="dob">Date of Birth</label>
          <input type="date" id="dob" required value={formData.dob} onChange={handleChange} />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter a password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div className="log-reg">
            <button type="submit"> Register </button>
            <span className="reg-text">
              Already have an account? <Link to="/login">Login here</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
