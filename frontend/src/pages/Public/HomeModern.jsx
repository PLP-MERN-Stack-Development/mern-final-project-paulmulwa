import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { 
  CheckCircle, Shield, FileText, Users, Bell, 
  TrendingUp, Lock, Zap, Award, Globe, ArrowRight,
  Search, RefreshCw, Download
} from 'lucide-react';
import './HomeModern.css';

const HomeModern = () => {
  const features = [
    {
      icon: <Shield size={32} />,
      title: 'Digital Land Verification',
      description: 'Instantly verify land ownership with blockchain-backed security and government authentication'
    },
    {
      icon: <RefreshCw size={32} />,
      title: 'Secure Land Transfers',
      description: 'Transfer land ownership safely with multi-level approval from County and NLC administrators'
    },
    {
      icon: <Bell size={32} />,
      title: 'Instant Notifications',
      description: 'Real-time alerts for all land activities, transfers, and administrative actions'
    },
    {
      icon: <Users size={32} />,
      title: 'County Oversight',
      description: 'Transparent county-level administration with fraud detection and prevention systems'
    },
    {
      icon: <FileText size={32} />,
      title: 'Automatic Title Deeds',
      description: 'Generate official PDF title deeds instantly with complete ownership and transfer history'
    },
    {
      icon: <Lock size={32} />,
      title: 'Fraud Prevention',
      description: 'Advanced security measures to detect and prevent fraudulent land transactions'
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

  const steps = [
    {
      number: '01',
      title: 'Search Land Parcel',
      description: 'Find any registered land parcel by title number, LR number, or location'
    },
    {
      number: '02',
      title: 'Verify Ownership',
      description: 'Confirm authentic ownership with digital certificates and transfer history'
    },
    {
      number: '03',
      title: 'Initiate Transfer',
      description: 'Start secure transfer process with buyer details and required documentation'
    },
    {
      number: '04',
      title: 'Get Title Deed',
      description: 'Receive official PDF title deed with complete ownership records'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="modern-hero">
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-badge">
            <Globe size={16} />
            <span>Kenya's Digital Land Registry</span>
          </div>
          
          <h1 className="hero-heading">
            Digital Land Registry<br />Made Simple
          </h1>
          
          <p className="hero-text">
            Secure, transparent, and efficient land management system designed for modern Kenya. 
            Experience seamless land registration, instant ownership transfers, and digital title deed generation.
          </p>
          
          <div className="hero-actions">
            <Link to="/login" className="btn-modern btn-primary">
              <Zap size={18} />
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-modern btn-outline">
              Learn More
            </Link>
          </div>
          
          <div className="hero-stats-grid">
            <div className="stat-card">
              <div className="stat-value">10,000+</div>
              <div className="stat-label">Parcels Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">5,000+</div>
              <div className="stat-label">Successful Transfers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">47</div>
              <div className="stat-label">Counties Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="modern-features">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Award size={16} />
              <span>Features</span>
            </div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Powerful features designed to make land management simple, secure, and transparent
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
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

      {/* How It Works */}
      <section className="modern-steps">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <TrendingUp size={16} />
              <span>Process</span>
            </div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple, secure process from search to title deed
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Checklist */}
      <section className="modern-checklist">
        <div className="section-container">
          <div className="checklist-content">
            <div className="checklist-text">
              <div className="section-badge">
                <CheckCircle size={16} />
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
                    <CheckCircle size={20} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="modern-cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-text">
              Join thousands of Kenyans managing their land digitally
            </p>
            <Link to="/login" className="btn-modern btn-cta">
              <Zap size={18} />
              Login Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomeModern;
