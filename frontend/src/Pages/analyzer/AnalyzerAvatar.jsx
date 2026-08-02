import React from "react";
import "./AnalyzerAvatar.css";
import avatarImg from "../../assets/ai-war-veteran-avatar.png";

export default function AnalyzerAvatar({ statusText }) {
  return (
    <div className="analyzer-avatar glitch-active">
      
      {/* AI Core Glow */}
      <div className="avatar-core-glow" aria-hidden="true"></div>

      {/* Avatar Image */}
      <img
        src={avatarImg}
        alt="AI War Veteran Analyzer Avatar"
        className="avatar-image"
      />

      {/* Smoke Effects */}
      <div className="avatar-smoke smoke-1" aria-hidden="true"></div>
      <div className="avatar-smoke smoke-2" aria-hidden="true"></div>
      <div className="avatar-smoke smoke-3" aria-hidden="true"></div>

      {/* Status Overlay */}
      <div className="avatar-overlay">
        <p className="avatar-status">{statusText || "Analyzing..."}</p>
      </div>
    </div>
  );
}
