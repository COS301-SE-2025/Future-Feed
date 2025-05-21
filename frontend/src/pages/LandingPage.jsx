import React from "react";
import futureFeedLogo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/google logo.webp";
import ffCropped from "../assets/FF cropped.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div class="container">
        <img src={futureFeedLogo} alt="Future Feed Logo" class="logo" />
        
        <div class="card">
            <h2>Join the family</h2>

            <button class="btn google-btn">
                <img src={googleLogo} alt="Google" id="btn-logo"/>
                Continue with Google
            </button>

            <div class="divider">
                <span>Or just</span>
            </div>
        
            <button class="btn icon-btn">
                <img src={ffCropped} alt="Create Icon" id="ff-logo"/>
                Create new Future Feed Account
            </button>

            <div class="divider">
                <span>Already have an account?</span>
            </div>

            <Link to="/login">
                <button class="btn icon-btn">
                    <img src={ffCropped} alt="Login Icon" id="ff-logo"/>
                    Log into an existing Future Feed Account
                </button>
            </Link>

            <p class="footer-text">A world's worth of posts, your way.</p>
            <p class="footer-credit">@ 2025, <em>Syntex Squad</em></p>
        </div>
    </div>
  );
};

export default LandingPage;
