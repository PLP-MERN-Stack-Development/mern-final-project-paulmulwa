import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMapPin, 
  FiShield, 
  FiCheckCircle, 
  FiUsers,
  FiLock,
  FiFileText,
  FiEye,
  FiClock,
  FiBell,
  FiDatabase,
  FiAward,
  FiTarget,
  FiTrendingUp
} from 'react-icons/fi';
import PublicLayout from '../../components/PublicLayout';
import './About.css';
import './AboutModern.css';

const About = () => {
  return (
    <PublicLayout>
      {/* Overview Section */}
      <section className="about-hero modern">
        <div className="container">
          <div className="about-hero-content">
            <div className="hero-badge">
              <FiTarget size={16} />
              <span>About Us</span>
            </div>
            <h1 className="page-title modern">About Ardhisasa Lite</h1>
            <p className="page-subtitle modern">
              A comprehensive digital land registry system modernizing Kenya's land management 
              through secure, transparent, and efficient digital workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section mission-section modern">
        <div className="container">
          <div className="content-grid modern">
            <div className="content-text">
              <div className="section-badge">
                <FiAward size={16} />
                <span>Our Mission</span>
              </div>
              <h2 className="content-title modern">Digitizing Kenya's Land Registry</h2>
              <p className="content-description modern">
                Ardhisasa Lite is designed to digitize and modernize Kenya's land registry system, 
                providing a secure platform that aligns with the country's administrative structure—from 
                county level down to ward level.
              </p>
              <p className="content-description modern">
                Built on Kenya's hierarchical administrative system (County → Sub-County → Constituency → Ward), 
                our platform ensures accurate land ownership verification and seamless transfer processes.
              </p>
              <div className="feature-highlights modern">
                <div className="highlight-item modern">
                  <div className="highlight-icon-wrapper">
                    <FiCheckCircle className="highlight-icon" />
                  </div>
                  <span>Based on official Kenyan administrative structure</span>
                </div>
                <div className="highlight-item modern">
                  <div className="highlight-icon-wrapper">
                    <FiCheckCircle className="highlight-icon" />
                  </div>
                  <span>Secure digital workflows with multi-level approval</span>
                </div>
                <div className="highlight-item modern">
                  <div className="highlight-icon-wrapper">
                    <FiCheckCircle className="highlight-icon" />
                  </div>
                  <span>Aligned with National Land Commission standards</span>
                </div>
              </div>
            </div>
            <div className="content-visual modern">
              <div className="visual-card modern">
                <div className="visual-icon">
                  <FiMapPin size={60} />
                </div>
                <div className="visual-stats">
                  <div className="visual-stat modern">
                    <div className="visual-number">47</div>
                    <div className="visual-label">Counties</div>
                  </div>
                  <div className="visual-stat modern">
                    <div className="visual-number">290</div>
                    <div className="visual-label">Sub-Counties</div>
                  </div>
                  <div className="visual-stat modern">
                    <div className="visual-number">1,450</div>
                    <div className="visual-label">Wards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section process-section modern">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">
              <FiTrendingUp size={16} />
              <span>Process</span>
            </div>
            <h2 className="section-title modern">How the System Works</h2>
            <p className="section-subtitle modern">
              A streamlined digital process from verification to ownership transfer
            </p>
          </div>
          <div className="process-grid modern">
            <div className="process-card modern">
              <div className="process-number modern">1</div>
              <div className="process-icon modern">
                <FiFileText size={32} />
              </div>
              <h3>Automated Verification</h3>
              <p>
                System automatically verifies land ownership using official county-level records 
                and cross-references with national databases.
              </p>
            </div>
            <div className="process-card modern">
              <div className="process-number modern">2</div>
              <div className="process-icon modern">
                <FiUsers size={32} />
              </div>
              <h3>Multi-Level Review</h3>
              <p>
                County Admins verify documents and ownership details, followed by National Land 
                Commission (NLC) Administrator final approval.
              </p>
            </div>
            <div className="process-card modern">
              <div className="process-number modern">3</div>
              <div className="process-icon modern">
                <FiCheckCircle size={32} />
              </div>
              <h3>Real-Time Approvals</h3>
              <p>
                Digital approval workflow with instant status updates at each stage, eliminating 
                delays and manual paperwork.
              </p>
            </div>
            <div className="process-card modern">
              <div className="process-number modern">4</div>
              <div className="process-icon modern">
                <FiBell size={32} />
              </div>
              <h3>Automated Notifications</h3>
              <p>
                All parties receive instant notifications via real-time alerts for every action, 
                ensuring complete transparency.
              </p>
            </div>
            <div className="process-card modern">
              <div className="process-number modern">5</div>
              <div className="process-icon modern">
                <FiShield size={32} />
              </div>
              <h3>Document Validation</h3>
              <p>
                Secure document upload system with admin verification of ownership documents, 
                identity verification, and parcel details.
              </p>
            </div>
            <div className="process-card modern">
              <div className="process-number modern">6</div>
              <div className="process-icon modern">
                <FiDatabase size={32} />
              </div>
              <h3>Complete Audit Trail</h3>
              <p>
                Every action is logged with timestamps and user details, creating an immutable 
                history for compliance and dispute resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section benefits-section modern">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">
              <FiAward size={16} />
              <span>Benefits</span>
            </div>
            <h2 className="section-title modern">System Benefits</h2>
            <p className="section-subtitle modern">
              Transforming land management for all stakeholders
            </p>
          </div>
          <div className="benefits-grid modern">
            <div className="benefit-card modern blue">
              <div className="benefit-icon">
                <FiEye size={32} />
              </div>
              <h3>Complete Transparency</h3>
              <p>
                Every transaction is traceable with full visibility into ownership history, 
                transfer status, and approval stages.
              </p>
            </div>
            <div className="benefit-card modern green">
              <div className="benefit-icon">
                <FiShield size={32} />
              </div>
              <h3>Fraud Prevention</h3>
              <p>
                Multi-level verification, document validation, and identity checks prevent 
                fraudulent land transactions and ownership claims.
              </p>
            </div>
            <div className="benefit-card modern purple">
              <div className="benefit-icon">
                <FiCheckCircle size={32} />
              </div>
              <h3>Verified Ownership</h3>
              <p>
                Cross-verification with official records ensures only legitimate landowners 
                can initiate transfers or modifications.
              </p>
            </div>
            <div className="benefit-card modern orange">
              <div className="benefit-icon">
                <FiFileText size={32} />
              </div>
              <h3>Digital Title Deeds</h3>
              <p>
                Auto-generated PDF title deeds with official formatting, complete parcel 
                information, and downloadable certificates.
              </p>
            </div>
            <div className="benefit-card modern teal">
              <div className="benefit-icon">
                <FiClock size={32} />
              </div>
              <h3>Faster Processing</h3>
              <p>
                Digital workflows eliminate manual paperwork, reducing transfer processing 
                time from weeks to days.
              </p>
            </div>
            <div className="benefit-card modern indigo">
              <div className="benefit-icon">
                <FiDatabase size={32} />
              </div>
              <h3>Real Estate Digitization</h3>
              <p>
                Complete digitization of land records enables modern real estate transactions 
                and property market growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="section security-section modern">
        <div className="container">
          <div className="security-content modern">
            <div className="security-header modern">
              <div className="section-badge">
                <FiShield size={20} />
                <span>Security</span>
              </div>
              <div className="security-icon-large">
                <FiLock size={48} />
              </div>
              <h2 className="section-title">Security Measures</h2>
              <p className="section-subtitle">
                Enterprise-grade security protecting your land ownership data
              </p>
            </div>
            <div className="security-features modern">
              <div className="security-feature modern">
                <FiLock className="feature-icon" />
                <div>
                  <h4>JWT Authentication</h4>
                  <p>Industry-standard JSON Web Tokens with secure session management and automatic token refresh</p>
                </div>
              </div>
              <div className="security-feature modern">
                <FiShield className="feature-icon" />
                <div>
                  <h4>Role-Based Access Control</h4>
                  <p>Four distinct user roles (Buyer, Seller, County Admin, NLC Admin) with granular permissions</p>
                </div>
              </div>
              <div className="security-feature modern">
                <FiDatabase className="feature-icon" />
                <div>
                  <h4>Complete Transfer History</h4>
                  <p>Immutable audit logs tracking every ownership change, approval action, and system event</p>
                </div>
              </div>
              <div className="security-feature modern">
                <FiEye className="feature-icon" />
                <div>
                  <h4>Audit Logging</h4>
                  <p>Comprehensive activity logs with timestamps, IP addresses, and user details for compliance</p>
                </div>
              </div>
              <div className="security-feature">
                <FiCheckCircle className="feature-icon" />
                <div>
                  <h4>Protected Routes</h4>
                  <p>All sensitive operations require authentication and appropriate authorization levels</p>
                </div>
              </div>
              <div className="security-feature">
                <FiLock className="feature-icon" />
                <div>
                  <h4>Data Encryption</h4>
                  <p>End-to-end encryption for data in transit and at rest, with secure password hashing (bcrypt)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Experience the Future of Land Management</h2>
            <p>Join the digital transformation of Kenya's land registry</p>
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
