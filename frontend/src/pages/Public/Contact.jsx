import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiMessageCircle, FiHelpCircle, FiUsers } from 'react-icons/fi';
import PublicLayout from '../../components/PublicLayout';
import './Contact.css';
import './ContactModern.css';

const Contact = () => {
  return (
    <PublicLayout>
      <section className="contact-hero modern">
        <div className="container">
          <div className="hero-badge">
            <FiMessageCircle size={20} />
            <span>Contact Us</span>
          </div>
          <h1 className="page-title modern">We're Here to Help</h1>
          <p className="page-subtitle modern">
            Get in touch with our team for support, inquiries, or assistance 
            with the Ardhisasa Lite system
          </p>
        </div>
      </section>

      <section className="section modern">
        <div className="container">
          <div className="contact-grid modern">
            {/* Contact Information */}
            <div className="contact-info modern">
              <div className="section-badge green">
                <FiPhone size={20} />
                <span>Reach Out</span>
              </div>
              <h2 className="modern">Get In Touch</h2>
              <p className="modern">
                For support, inquiries, or assistance with land registration and transfers,
                our dedicated team is here to help you navigate the Ardhisasa Lite system.
              </p>
              
              <div className="contact-cards modern">
                <div className="contact-card modern phone">
                  <div className="contact-icon modern">
                    <FiPhone size={24} />
                  </div>
                  <h4>Phone</h4>
                  <p>+254 700 000 000</p>
                  <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
                </div>

                <div className="contact-card modern email">
                  <div className="contact-icon modern">
                    <FiMail size={24} />
                  </div>
                  <h4>Email</h4>
                  <p>info@ardhisasa.go.ke</p>
                  <p>support@ardhisasa.go.ke</p>
                </div>

                <div className="contact-card modern location">
                  <div className="contact-icon modern">
                    <FiMapPin size={24} />
                  </div>
                  <h4>Office Address</h4>
                  <p>Ardhi House, Nairobi</p>
                  <p>Ministry of Lands and Physical Planning</p>
                </div>
              </div>

              <div className="gov-links modern">
                <div className="section-badge blue">
                  <FiUsers size={20} />
                  <span>Government Links</span>
                </div>
                <h4>Related Ministries</h4>
                <ul className="modern">
                  <li className="modern">
                    <a href="https://lands.go.ke" target="_blank" rel="noopener noreferrer">
                      Ministry of Lands and Physical Planning
                    </a>
                  </li>
                  <li className="modern">
                    <a href="https://nlc.go.ke" target="_blank" rel="noopener noreferrer">
                      National Land Commission
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form Placeholder */}
            <div className="contact-form-section modern">
              <div className="form-container modern">
                <div className="section-badge purple">
                  <FiHelpCircle size={20} />
                  <span>Support</span>
                </div>
                <h3 className="modern">Send Us a Message</h3>
                <p className="modern">
                  For general inquiries, please use the contact information provided or 
                  visit your nearest county land office for in-person assistance.
                </p>
                
                <div className="notice-box modern technical">
                  <div className="notice-icon modern">
                    <FiHelpCircle size={28} />
                  </div>
                  <div className="notice-content modern">
                    <h4>Technical Support</h4>
                    <p>
                      If you're experiencing technical issues with the system, please contact
                      your County Administrator or email support@ardhisasa.go.ke with your
                      account details and a description of the issue.
                    </p>
                  </div>
                </div>

                <div className="notice-box modern county">
                  <div className="notice-icon modern">
                    <FiMapPin size={28} />
                  </div>
                  <div className="notice-content modern">
                    <h4>County Offices</h4>
                    <p>
                      For county-specific inquiries, please contact your local County Land Office.
                      Each of Kenya's 47 counties has a dedicated land office to assist with
                      registration and verification matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
