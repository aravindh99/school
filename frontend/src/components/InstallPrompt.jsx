import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome's default install prompt
            e.preventDefault();
            // Store the event for later use
            setDeferredPrompt(e);
            // Show our custom prompt after 3 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        const handleAppInstalled = () => {
            // Hide prompt when app is installed
            setShowPrompt(false);
            setDeferredPrompt(null);
            // Clear any dismissal records since app is installed
            localStorage.removeItem('installPromptDismissed');
            localStorage.removeItem('installPromptLastShown');
        };

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return; // Already installed, don't show prompt
        }

        // Check if dismissed today
        const dismissedUntil = localStorage.getItem('installPromptDismissed');
        if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
            return; // Still dismissed
        }

        // Check if already shown today
        const lastShown = localStorage.getItem('installPromptLastShown');
        const today = new Date().toDateString();
        const lastShownDate = lastShown ? new Date(parseInt(lastShown)).toDateString() : null;
        
        if (lastShownDate === today) {
            return; // Already shown today
        }

        // Store the event listener
        const promptHandler = (e) => {
            handleBeforeInstallPrompt(e);
            // Mark as shown today
            localStorage.setItem('installPromptLastShown', Date.now().toString());
        };

        window.addEventListener('beforeinstallprompt', promptHandler);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', promptHandler);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        // Clean up
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal until end of today
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
        localStorage.setItem('installPromptDismissed', tomorrow.getTime().toString());
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="install-prompt">
            <div className="install-prompt-content">
                <div className="install-prompt-icon">📱</div>
                <div className="install-prompt-text">
                    <strong>Install SchoolScoop</strong>
                    <span>Get the app experience in 1 second!</span>
                </div>
                <div className="install-prompt-actions">
                    <button onClick={handleInstall} className="install-btn">
                        Install
                    </button>
                    <button onClick={handleDismiss} className="dismiss-btn">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;