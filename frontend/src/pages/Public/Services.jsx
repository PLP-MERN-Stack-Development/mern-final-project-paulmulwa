import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiFileText, 
  FiShield,
  FiUsers,
  FiMapPin,
  FiArrowRight,
  FiLock,
  FiEye,
  FiBell,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiAward,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';
import PublicLayout from '../../components/PublicLayout';
import './Services.css';
import './ServicesModern.css';

const Services = () => {
  return (
    <PublicLayout>
      {/* Services Hero */}
      <section className="services-hero modern">
        <div className="container">
          <div className="services-hero-content modern">
            <div className="hero-badge">
              <FiZap size={20} />
              <span>Our Services</span>
            </div>
            <h1 className="page-title modern">Comprehensive Land Management Solutions</h1>
            <p className="page-subtitle modern">
              Secure, transparent, and efficient digital land transactions 
              across all 47 counties of Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Service 1: Land Ownership Verification */}
      <section className="section service-detail modern">
        <div className="container">
          <div className="service-content modern">
            <div className="section-badge blue">
              <FiSearch size={20} />
              <span>Verification</span>
            </div>
            <div className="service-icon-wrapper modern blue">
              <FiSearch size={40} />
            </div>
            <h2 className="service-title modern">Land Ownership Verification</h2>
            <p className="service-intro modern">
              Our automated verification system cross-references multiple official databases 
              to ensure accurate land ownership records.
            </p>
            <div className="service-features modern">
              <div className="feature-item modern">
                <FiCheckCircle className="feature-check" />
                <div>
                  <h4>Official County Records</h4>
                  <p>Verification against county-level land registries for each of Kenya's 47 counties</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiCheckCircle className="feature-check" />
                <div>
                  <h4>National Database Cross-Check</h4>
                  <p>Integration with National Land Commission databases for comprehensive verification</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiCheckCircle className="feature-check" />
                <div>
                  <h4>Identity Validation</h4>
                  <p>National ID and KRA PIN verification to confirm landowner identity</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiCheckCircle className="feature-check" />
                <div>
                  <h4>Location-Based Verification</h4>
                  <p>Administrative hierarchy validation (County → Sub-County → Constituency → Ward)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 2: Parcel Management */}
      <section className="section service-detail modern alt-bg">
        <div className="container">
          <div className="service-content modern">
            <div className="section-badge green">
              <FiMapPin size={20} />
              <span>Parcel Management</span>
            </div>
            <div className="service-icon-wrapper modern green">
              <FiMapPin size={40} />
            </div>
            <h2 className="service-title modern">Comprehensive Parcel Management</h2>
            <p className="service-intro modern">
              Complete digital management of land parcels with detailed metadata, 
              documentation, and real-time status tracking.
            </p>
            <div className="service-features modern">
              <div className="feature-item modern">
                <FiFileText className="feature-check" />
                <div>
                  <h4>Parcel Registration</h4>
                  <p>Digital registration with parcel number, size, location, land use, and title deed details</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiMapPin className="feature-check" />
                <div>
                  <h4>Location Details</h4>
                  <p>Full address information including county, sub-county, constituency, and ward</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiShield className="feature-check" />
                <div>
                  <h4>Document Management</h4>
                  <p>Secure storage and verification of ownership documents, title deeds, and supporting files</p>
                </div>
              </div>
              <div className="feature-item modern">
                <FiEye className="feature-check" />
                <div>
                  <h4>Status Tracking</h4>
                  <p>Real-time status updates (Pending, Verified, Rejected) with detailed remarks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 3: Land Transfer Workflow */}
      <section className="section service-detail modern">
        <div className="container">
          <div className="service-content modern">
            <div className="section-badge purple">
              <FiRefreshCw size={20} />
              <span>Transfer Workflow</span>
            </div>
            <div className="service-icon-wrapper modern purple">
              <FiRefreshCw size={40} />
            </div>
            <h2 className="service-title modern">Complete Land Transfer Workflow</h2>
            <p className="service-intro modern">
              End-to-end digital land transfer process with multi-level verification, 
              automated approvals, and complete transparency.
            </p>

            {/* Transfer Steps */}
            <div className="transfer-workflow modern">
              <div className="workflow-step modern">
                <div className="step-number modern">1</div>
                <div className="step-content modern">
                  <h4>Transfer Initiation</h4>
                  <p>
                    <strong>Seller initiates transfer</strong> by selecting a verified land parcel 
                    and entering buyer details (National ID, KRA PIN, contact information).
                  </p>
                  <div className="step-detail modern">
                    <FiUsers /> System validates buyer identity and checks for existing records
                  </div>
                </div>
              </div>

              <div className="workflow-step modern">
                <div className="step-number modern">2</div>
                <div className="step-content modern">
                  <h4>Buyer Acceptance</h4>
                  <p>
                    <strong>Buyer receives notification</strong> and reviews transfer details including 
                    parcel information, location, size, and seller details.
                  </p>
                  <div className="step-detail modern">
                    <FiBell /> Real-time alert sent via system notification
                  </div>
                </div>
              </div>

              <div className="workflow-step modern">
                <div className="step-number modern">3</div>
                <div className="step-content modern">
                  <h4>County Admin Review</h4>
                  <p>
                    <strong>County Administrator verifies</strong> all documentation, ownership records, 
                    and compliance with county land regulations.
                  </p>
                  <div className="step-detail modern">
                    <FiShield /> Multi-point verification including document authenticity and parcel status
                  </div>
                </div>
              </div>

              <div className="workflow-step modern">
                <div className="step-number modern">4</div>
                <div className="step-content modern">
                  <h4>NLC Administrator Approval</h4>
                  <p>
                    <strong>National Land Commission Administrator</strong> provides final approval 
                    after comprehensive review of all previous stages.
                  </p>
                  <div className="step-detail modern">
                    <FiCheckCircle /> Final authorization from highest administrative level
                  </div>
                </div>
              </div>

              <div className="workflow-step modern">
                <div className="step-number modern">5</div>
                <div className="step-content modern">
                  <h4>Ownership Transfer Completion</h4>
                  <p>
                    <strong>System automatically updates</strong> ownership records, generates new title 
                    deed, and notifies all parties.
                  </p>
                  <div className="step-detail modern">
                    <FiRefreshCw /> Complete audit trail created with timestamp and user details
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Features */}
            <div className="transfer-features modern">
              <h3>Transfer Process Features</h3>
              <div className="features-grid modern">
                <div className="feature-box modern">
                  <FiBell />
                  <span>Real-time notifications at every stage</span>
                </div>
                <div className="feature-box modern">
                  <FiLock />
                  <span>Secure authentication for all actions</span>
                </div>
                <div className="feature-box modern">
                  <FiEye />
                  <span>Complete visibility into transfer status</span>
                </div>
                <div className="feature-box modern">
                  <FiFileText />
                  <span>Digital document verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 4: Digital Title Deeds */}
      <section className="section service-detail modern alt-bg">
        <div className="container">
          <div className="service-content modern">
            <div className="section-badge orange">
              <FiDownload size={20} />
              <span>Digital Titles</span>
            </div>
            <div className="service-icon-wrapper modern orange">
              <FiDownload size={40} />
            </div>
            <h2 className="service-title modern">Digital Title Deed Generation</h2>
            <p className="service-intro modern">
              Auto-generated, official-format PDF title deeds with complete parcel information 
              and government-standard formatting.
            </p>
            <div className="title-deed-features modern">
              <div className="deed-preview modern">
                <div className="deed-sample modern">
                  <div className="deed-header">
                    <div className="coat-of-arms">🦁</div>
                    <h5>REPUBLIC OF KENYA</h5>
                    <p>Ministry of Lands and Physical Planning</p>
                  </div>
                  <div className="deed-content">
                    <div className="deed-section">
                      <strong>CERTIFICATE OF TITLE</strong>
                      <p>Official Land Registry Document</p>
                    </div>
                    <div className="deed-info">
                      <div className="deed-row">
                        <span>Parcel Number:</span>
                        <span>XXXX/YYYY/ZZZZ</span>
                      </div>
                      <div className="deed-row">
                        <span>Land Size:</span>
                        <span>XX.XX acres</span>
                      </div>
                      <div className="deed-row">
                        <span>Owner Name:</span>
                        <span>Full Legal Name</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="deed-description modern">
                <h4>Title Deed Includes:</h4>
                <ul className="deed-list modern">
                  <li><FiCheckCircle /> Official Republic of Kenya header with coat of arms</li>
                  <li><FiCheckCircle /> Complete parcel identification (parcel number, size, land use)</li>
                  <li><FiCheckCircle /> Full owner information (name, National ID, KRA PIN)</li>
                  <li><FiCheckCircle /> Detailed location (county, sub-county, constituency, ward, address)</li>
                  <li><FiCheckCircle /> Title deed number and registration date</li>
                  <li><FiCheckCircle /> LR (Land Registry) number for official records</li>
                  <li><FiCheckCircle /> Download and view capabilities</li>
                  <li><FiCheckCircle /> Transfer history with previous owners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 5: Admin Tools */}
      <section className="section service-detail modern">
        <div className="container">
          <div className="service-content modern">
            <div className="section-badge teal">
              <FiUsers size={20} />
              <span>Admin Tools</span>
            </div>
            <div className="service-icon-wrapper modern teal">
              <FiUsers size={40} />
            </div>
            <h2 className="service-title modern">Administrator Tools & Dashboards</h2>
            <p className="service-intro modern">
              Powerful administrative interfaces for County Admins and NLC Administrators 
              to manage verification, approvals, and system oversight.
            </p>
            <div className="admin-tools modern">
              <div className="admin-section modern">
                <h4>County Administrator Dashboard</h4>
                <div className="tool-list modern">
                  <div className="tool-item modern">
                    <FiFileText />
                    <div>
                      <strong>Parcel Verification</strong>
                      <p>Review and verify land parcel registrations with document validation</p>
                    </div>
                  </div>
                  <div className="tool-item modern">
                    <FiRefreshCw />
                    <div>
                      <strong>Transfer Review</strong>
                      <p>Approve or reject land transfer requests with detailed remarks</p>
                    </div>
                  </div>
                  <div className="tool-item modern">
                    <FiUsers />
                    <div>
                      <strong>User Management</strong>
                      <p>View county-specific users and their parcel ownership details</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-section modern">
                <h4>NLC Administrator Dashboard</h4>
                <div className="tool-list modern">
                  <div className="tool-item modern">
                    <FiShield />
                    <div>
                      <strong>National Oversight</strong>
                      <p>Final approval authority for all land transfers across Kenya</p>
                    </div>
                  </div>
                  <div className="tool-item modern">
                    <FiEye />
                    <div>
                      <strong>System-Wide Monitoring</strong>
                      <p>View all parcels, transfers, and user activity nationwide</p>
                    </div>
                  </div>
                  <div className="tool-item modern">
                    <FiLock />
                    <div>
                      <strong>Audit & Compliance</strong>
                      <p>Access complete audit logs and transfer histories for compliance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section services-cta modern">
        <div className="container">
          <div className="cta-box modern">
            <div className="section-badge">
              <FiAward size={20} />
              <span>Get Started</span>
            </div>
            <h2>Ready to Experience Modern Land Management?</h2>
            <p>Join thousands of Kenyans using Ardhisasa Lite for secure, transparent land transactions</p>
            <div className="cta-buttons modern">
              <Link to="/register" className="btn btn-primary btn-lg modern">
                Create Account
                <FiArrowRight />
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg modern">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Services;
