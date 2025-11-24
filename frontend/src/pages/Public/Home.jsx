import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMapPin, 
  FiShield, 
  FiCheckCircle, 
  FiFileText, 
  FiUsers,
  FiArrowRight,
  FiLock,
  FiClock,
  FiBell,
  FiRefreshCw,
  FiZap,
  FiGlobe,
  FiAward,
  FiTrendingUp
} from 'react-icons/fi';
import PublicLayout from '../../components/PublicLayout';
import './Home.css';
import './HomeModern.css';

const Home = () => {
  const features = [
    {
      icon: <FiShield size={32} />,
      title: 'Digital Land Verification',
      description: 'Instantly verify land ownership with blockchain-backed security and government authentication',
      color: 'blue'
    },
    {
      icon: <FiRefreshCw size={32} />,
      title: 'Secure Land Transfers',
      description: 'Transfer land ownership safely with multi-level approval from County and NLC administrators',
      color: 'green'
    },
    {
      icon: <FiBell size={32} />,
      title: 'Instant Notifications',
      description: 'Real-time alerts for all land activities, transfers, and administrative actions',
      color: 'orange'
    },
    {
      icon: <FiUsers size={32} />,
      title: 'County Oversight',
      description: 'Transparent county-level administration with fraud detection and prevention systems',
      color: 'purple'
    },
    {
      icon: <FiFileText size={32} />,
      title: 'Automatic Title Deeds',
      description: 'Generate official PDF title deeds instantly with complete ownership and transfer history',
      color: 'blue'
    },
    {
      icon: <FiLock size={32} />,
      title: 'Fraud Prevention',
      description: 'Advanced security measures to detect and prevent fraudulent land transactions',
      color: 'red'
    },
    {
      icon: <FiMapPin size={32} />,
      title: 'Geospatial Mapping',
      description: 'Interactive maps with precise GPS coordinates and boundary visualization for all parcels',
      color: 'green'
    },
    {
      icon: <FiCheckCircle size={32} />,
      title: 'Multi-Level Approvals',
      description: 'Streamlined approval workflow from parcel owners to County and NLC administrators',
      color: 'blue'
    }
  ];

  const requirements = [
    'Secure JWT Authentication',
    'Real-Time Socket.io Updates',
    'County-Level Data Accuracy',
    'Multi-Layer Fraud Prevention',
    'Verified Government Records',
    'Automated PDF Generation'
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="hero-section modern">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <FiGlobe size={16} />
                <span>Kenya's Digital Land Registry</span>
              </div>
              <h1 className="hero-title modern">
                Digital Land Registry<br/>Made Simple
              </h1>
              <p className="hero-subtitle modern">
                Secure, transparent, and efficient land management system designed for modern Kenya. 
                Experience seamless land registration, instant ownership transfers, and digital title deed generation.
              </p>
              <div className="hero-buttons">
                <Link to="/login" className="btn btn-primary btn-lg modern">
                  <FiZap size={18} />
                  Get Started
                  <FiArrowRight size={18} />
                </Link>
                <Link to="/about" className="btn btn-secondary btn-lg modern">
                  Learn More
                </Link>
              </div>
              <div className="hero-stats modern">
                <div className="stat-item">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Parcels Registered</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5,000+</div>
                  <div className="stat-label">Successful Transfers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">47</div>
                  <div className="stat-label">Counties Covered</div>
                </div>
              </div>
            </div>
            <div className="hero-illustration modern">
              <div className="illustration-shape shape-1"></div>
              <div className="illustration-shape shape-2"></div>
              <div className="illustration-shape shape-3"></div>
              <div className="illustration-icons">
                <div className="icon-stack">
                  <div className="floating-icon icon-1">
                    <FiMapPin size={80} />
                  </div>
                  <div className="floating-icon icon-2">
                    <FiShield size={64} />
                  </div>
                  <div className="floating-icon icon-3">
                    <FiFileText size={56} />
                  </div>
                  <div className="floating-icon icon-4">
                    <FiCheckCircle size={48} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section modern">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">
              <FiAward size={16} />
              <span>Features</span>
            </div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Powerful features designed to make land management simple, secure, and transparent
            </p>
          </div>
          <div className="features-grid modern">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card modern ${feature.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Checklist */}
      <section className="section checklist-section modern">
        <div className="container">
          <div className="checklist-content">
            <div className="checklist-text">
              <div className="section-badge">
                <FiCheckCircle size={16} />
                <span>Security</span>
              </div>
              <h2 className="section-title">Built on Trust</h2>
              <p className="section-subtitle">
                Our platform meets the highest standards of security and reliability
              </p>
            </div>
            <div className="checklist-items">
              {requirements.map((item, index) => (
                <div key={index} className="checklist-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="check-icon">
                    <FiCheckCircle size={20} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="section services-preview modern">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">
              <FiTrendingUp size={16} />
              <span>Services</span>
            </div>
            <h2 className="section-title">Comprehensive Solutions</h2>
            <p className="section-subtitle">
              End-to-end digital land management services
            </p>
          </div>
          <div className="services-grid modern">
            <div className="service-card modern green">
              <div className="service-icon">
                <FiCheckCircle size={40} />
              </div>
              <h3>Land Ownership Verification</h3>
              <p>
                Instantly verify land ownership using official county-level records. 
                Search by county, subcounty, constituency, and ward for accurate results.
              </p>
              <Link to="/services" className="service-link">
                Learn More <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="service-card modern blue">
              <div className="service-icon">
                <FiFileText size={40} />
              </div>
              <h3>Digital Title Deeds</h3>
              <p>
                Generate, view, and download official digital title deeds with complete 
                parcel information, owner details, and government authentication.
              </p>
              <Link to="/services" className="service-link">
                Learn More <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="service-card modern purple">
              <div className="service-icon">
                <FiUsers size={40} />
              </div>
              <h3>Land Transfer Management</h3>
              <p>
                Complete digital workflow for land transfers with County Admin verification 
                and NLC approval. Track progress in real-time.
              </p>
              <Link to="/services" className="service-link">
                Learn More <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="service-card modern orange">
              <div className="service-icon">
                <FiLock size={40} />
              </div>
              <h3>Document & Identity Verification</h3>
              <p>
                Secure document upload and verification system. Admins verify ownership 
                documents and buyer/seller identities for complete transparency.
              </p>
              <Link to="/services" className="service-link">
                Learn More <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section modern">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of Kenyans managing their land ownership digitally
            </p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-lg modern">
                <FiZap size={18} />
                Login Now
                <FiArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline-white btn-lg modern">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
