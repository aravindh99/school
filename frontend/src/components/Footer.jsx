import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import HelpModal from './HelpModal';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const getBackUrl = () => {
    const path = location.pathname;

    if (path === '/') return null; // Home page, no back button
    if (path === '/admin') return null; // Admin page, no back button
    if (path.includes('/admin/school/')) {
      // From admin school view, go back to admin panel
      return '/admin';
    }
    if (path.includes('/create')) {
      // From create page, go back to class or school
      const parts = path.split('/');
      if (parts.includes('class')) {
        const schoolId = parts[2];
        const classNumber = parts[4];
        return `/school/${schoolId}/class/${classNumber}`;
      } else {
        const schoolId = parts[2];
        return `/school/${schoolId}`;
      }
    }
    if (path.includes('/class/')) {
      // From class page, go back to school
      const schoolId = path.split('/')[2];
      return `/school/${schoolId}`;
    }
    if (path.includes('/school/')) {
      // From school page, go back to home
      return '/';
    }

    return '/'; // Default to home
  };

  const backUrl = getBackUrl();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <div className="footer">
        <div className="footer-content">
          {backUrl && (
            <button
              onClick={() => navigate(backUrl)}
              className="footer-back-btn"
            >
              Back
            </button>
          )}
          {isHomePage && (
            <button
              onClick={() => setShowHelp(true)}
              className="footer-help-btn"
            >
              Help
            </button>
          )}
          <div className="footer-spacer"></div>
          {isHomePage && (
            <button
              onClick={() => {
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile) {
                  // Mobile: Open UPI app
                  const upiLink = "upi://pay?pa=autumnleaf@ybl&pn=SchoolScoop&am=50&cu=INR&tn=Support%20for%20more%20features";
                  window.location.href = upiLink;
                } else {
                  // Desktop: Show UPI ID to copy
                  alert("UPI ID: autumnleaf@ybl\n\nPlease use any UPI app on your phone to send support. Thank you! 💚");
                }
              }}
              className="footer-support-btn"
              title="Support for more features"
            >
              Support
            </button>
          )}
          <div className="footer-spacer"></div>
          <ThemeToggle />
        </div>
      </div>

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};

export default Footer;