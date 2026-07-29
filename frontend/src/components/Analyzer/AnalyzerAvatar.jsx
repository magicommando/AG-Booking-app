import "./AnalyzerAvatar.css";
import avatarImg from "../../assets/logo.png";

export default function AnalyzerAvatar({ text }) {
  return (
    <div className="avatar-container">
      <div className="avatar-frame">
        <img src={avatarImg} alt="AI Monkey Veteran" className="avatar-img" />
        <div className="avatar-smoke smoke1"></div>
        <div className="avatar-smoke smoke2"></div>
        <div className="avatar-overlay"></div>
      </div>

      <div className="avatar-dialog">
        <p className="avatar-text">{text}</p>
      </div>
    </div>
  );
}
