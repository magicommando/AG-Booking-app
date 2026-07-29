import ServiceCard from "./Services/ServiceCard";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const featuredServices = [
    {
      name: "General Inspection",
      description: "Full mechanical and safety inspection.",
      price: 45
    },
    {
      name: "Cleaning & Maintenance",
      description: "Deep clean, lubrication, and reliability check.",
      price: 60
    },
    {
      name: "Trigger Work",
      description: "Trigger smoothing, polishing, and tuning.",
      price: 75
    }
  ];

  return (
    <div className="landing-container">

      <header className="landing-header">
        <h1 className="brand-title">AG Gunsmithing</h1>
        <nav className="landing-nav">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2>Precision. Expertise. AI‑Enhanced Gunsmithing.</h2>
          <p>
            Book appointments, track repairs, and use advanced AI diagnostics to
            identify firearm issues faster and more accurately.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">Get Started</Link>
            <Link to="/login" className="secondary-btn">Login</Link>
          </div>
        </div>
      </section>

      <section className="landing-services">
        <h3>Featured Services</h3>

        <div className="landing-service-grid">
          {featuredServices.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              onSelect={() => navigate("/booking/service")}
            />
          ))}
        </div>
      </section>

      <section className="features-section">
        <h3>What We Offer</h3>

        <div className="features-grid">
          <div className="feature-card">
            <h4>AI Firearm Diagnostics</h4>
            <p>
              Upload photos or describe issues — our AI helps identify common
              problems and suggests repair paths.
            </p>
          </div>

          <div className="feature-card">
            <h4>Appointment Scheduling</h4>
            <p>
              Book gunsmithing services with real‑time availability and instant
              confirmations.
            </p>
          </div>

          <div className="feature-card">
            <h4>Inventory Tracking</h4>
            <p>
              AI‑powered inventory scanning helps you manage parts, tools, and
              supplies efficiently.
            </p>
          </div>

          <div className="feature-card">
            <h4>WorkOrder Automation</h4>
            <p>
              AI auto‑fills diagnostics, parts, labor time, and recommendations
              into your work orders.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 AG Gunsmithing — Precision Meets Innovation</p>
      </footer>
    </div>
  );
}
