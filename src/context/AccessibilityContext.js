import React, { createContext, useContext, useState, useEffect } from 'react';

const initialSettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  voiceEnabled: true,
  fontSize: 'medium',
  colorBlindness: 'none',
  screenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
  autoPlay: false,
  soundEffects: true,
  hapticFeedback: false
};

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('sevak_accessibility_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...initialSettings, ...parsedSettings });
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sevak_accessibility_settings', JSON.stringify(settings));
    
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (newSettings) => {
    const root = document.documentElement;
    
    if (newSettings.highContrast) {
      root.style.setProperty('--gray-100', '#000000');
      root.style.setProperty('--gray-900', '#ffffff');
      root.style.setProperty('--primary-blue', '#0000ff');
      root.style.setProperty('--accent-red', '#ff0000');
    } else {
      root.style.setProperty('--gray-100', '#f3f4f6');
      root.style.setProperty('--gray-900', '#111827');
      root.style.setProperty('--primary-blue', '#2563eb');
      root.style.setProperty('--accent-red', '#ef4444');
    }
    
    if (newSettings.largeText) {
      root.style.setProperty('--font-size-base', '1.2rem');
      root.style.setProperty('--font-size-lg', '1.4rem');
      root.style.setProperty('--font-size-xl', '1.6rem');
    } else {
      root.style.setProperty('--font-size-base', '1rem');
      root.style.setProperty('--font-size-lg', '1.125rem');
      root.style.setProperty('--font-size-xl', '1.25rem');
    }
    
    if (newSettings.reducedMotion) {
      root.style.setProperty('--transition-fast', '0.01ms');
      root.style.setProperty('--transition-normal', '0.01ms');
      root.style.setProperty('--transition-slow', '0.01ms');
    } else {
      root.style.setProperty('--transition-fast', '150ms ease-in-out');
      root.style.setProperty('--transition-normal', '250ms ease-in-out');
      root.style.setProperty('--transition-slow', '350ms ease-in-out');
    }
    
    applyColorBlindnessFilter(newSettings.colorBlindness);
    
    if (newSettings.focusIndicators) {
      root.style.setProperty('--focus-outline', '2px solid var(--primary-blue)');
    } else {
      root.style.setProperty('--focus-outline', 'none');
    }
  };

  const applyColorBlindnessFilter = (type) => {
    const root = document.documentElement;
    
    switch (type) {
      case 'protanopia':
        root.style.filter = 'url(#protanopia)';
        break;
      case 'deuteranopia':
        root.style.filter = 'url(#deuteranopia)';
        break;
      case 'tritanopia':
        root.style.filter = 'url(#tritanopia)';
        break;
      default:
        root.style.filter = 'none';
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetSettings = () => {
    setSettings(initialSettings);
  };

  const getFontSize = () => {
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      xlarge: '1.25rem'
    };
    return sizes[settings.fontSize] || sizes.medium;
  };

  const shouldReduceMotion = () => {
    return settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const shouldUseHighContrast = () => {
    return settings.highContrast || window.matchMedia('(prefers-contrast: high)').matches;
  };

  const speakText = (text, options = {}) => {
    if (!settings.voiceEnabled || !('speechSynthesis' in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';
    
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const playSoundEffect = (type) => {
    if (!settings.soundEffects) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'notification':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
        break;
      default:
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const provideHapticFeedback = (type = 'light') => {
    if (!settings.hapticFeedback || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      error: [100, 50, 100],
      success: [20, 10, 20]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
  };

  const value = {
    settings,
    
    updateSetting,
    toggleSetting,
    resetSettings,
    
    getFontSize,
    shouldReduceMotion,
    shouldUseHighContrast,
    speakText,
    stopSpeaking,
    playSoundEffect,
    provideHapticFeedback
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
