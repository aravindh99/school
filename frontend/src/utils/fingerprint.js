// Generate a simple browser fingerprint for anonymous voting
export const generateFingerprint = () => {
  // Check if fingerprint already exists in localStorage
  let fingerprint = localStorage.getItem('userFingerprint');
  
  if (!fingerprint) {
    // Create a simple fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint_data = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint_data.length; i++) {
      const char = fingerprint_data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    fingerprint = Math.abs(hash).toString(36) + Date.now().toString(36);
    localStorage.setItem('userFingerprint', fingerprint);
  }
  
  return fingerprint;
};