import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import './PublicLayout.css';

const PublicLayout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="public-layout">
      {/* Navigation Bar */}
      <nav className="public-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <FiMapPin className="brand-icon" />
            <span className="brand-name">Ardhisasa Lite</span>
          </div>
          <div className="navbar-links">
            <Link 
              to="/home" 
              className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              About Us
            </Link>
            <Link 
              to="/services" 
              className={`nav-link ${isActive('/services') ? 'active' : ''}`}
            >
              Services
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            >
              Contact
            </Link>
          </div>
          <div className="navbar-actions">
            <Link to="/login" className="btn-login">
              Sign In
            </Link>
            <Link to="/register" className="btn-register">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="public-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-brand">
                <FiMapPin className="footer-brand-icon" />
                <span className="footer-brand-name">Ardhisasa Lite</span>
              </div>
              <p className="footer-description">
                Modernizing Kenya's land registry system through secure, 
                transparent, and efficient digital workflows.
              </p>
              <div className="footer-contact">
                <div className="contact-item">
                  <FiPhone />
                  <span>+254 700 000 000</span>
                </div>
                <div className="contact-item">
                  <FiMail />
                  <span>info@ardhisasa.go.ke</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4 className="footer-title">Services</h4>
              <ul className="footer-links">
                <li><Link to="/services">Land Verification</Link></li>
                <li><Link to="/services">Parcel Management</Link></li>
                <li><Link to="/services">Land Transfers</Link></li>
                <li><Link to="/services">Digital Title Deeds</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Data Protection</a></li>
                <li><a href="#">Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="copyright">
              © {new Date().getFullYear()} Ardhisasa Lite. All rights reserved. 
              Republic of Kenya - Ministry of Lands and Physical Planning
            </p>
            <div className="footer-gov-links">
              <a href="https://lands.go.ke" target="_blank" rel="noopener noreferrer">
                Ministry of Lands
              </a>
              <span className="separator">|</span>
              <a href="https://nlc.go.ke" target="_blank" rel="noopener noreferrer">
                National Land Commission
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
