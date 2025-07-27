import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className="footer-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  );
};

export default ThemeToggle;