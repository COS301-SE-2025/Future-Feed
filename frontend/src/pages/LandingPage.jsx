import React from "react";
import futureFeedLogo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/google logo.webp";
import ffCropped from "../assets/FF cropped.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="container">
        <img src={futureFeedLogo} alt="Future Feed Logo" className="logo" />
        
        <div className="card">
            <h2>Join the family</h2>

            <Link to="/construction">
            <button className="btn google-btn">
                <img src={googleLogo} alt="Google" id="btn-logo"/>
                Continue with Google
            </button>
            </Link>

            <div className="divider">
                <span>Or just</span>
            </div>

            <Link to="/construction">
                <button className="btn icon-btn">
                    <img src={ffCropped} alt="Create Icon" id="ff-logo"/>
                    Create new Future Feed Account
                </button>
            </Link>

            
            <div className="divider">
                <span>Already have an account?</span>
            </div>
            

            <Link to="/login">
                <button className="btn icon-btn">
                    <img src={ffCropped} alt="Login Icon" id="ff-logo"/>
                    Log into an existing Future Feed Account
                </button>
            </Link>

            <p className="footer-text">A world's worth of posts, your way.</p>
            <p className="footer-credit">@ 2025, <em>Syntex Squad</em></p>
        </div>
    </div>
  );
};

export default LandingPage;
