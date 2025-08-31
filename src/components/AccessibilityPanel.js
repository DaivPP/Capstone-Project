import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiSettings, FiX, FiEye, FiVolume2, FiSmartphone, FiMonitor } from 'react-icons/fi';
import { MdAccessibility, MdHighQuality, MdTextFields, MdColorLens } from 'react-icons/md';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilityPanelContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
  
  &.open {
    transform: translateX(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PanelHeader = styled.div`
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-100);
    color: var(--gray-700);
  }
`;

const PanelContent = styled.div`
  padding: var(--spacing-4);
`;

const SettingSection = styled.div`
  margin-bottom: var(--spacing-6);
`;

const SectionTitle = styled.h4`
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const SettingItem = styled.div`
  margin-bottom: var(--spacing-4);
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-50);
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingName = styled.div`
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: var(--spacing-1);
`;

const SettingDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-600);
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${props => props.active ? 'var(--primary-blue)' : 'var(--gray-300)'};
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }
`;

const Select = styled.select`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: white;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-normal);
  
  &:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RangeSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--gray-200);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-blue);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-blue);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-sm);
  }
`;

const RangeValue = styled.div`
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  margin-top: var(--spacing-2);
`;

const ResetButton = styled(motion.button)`
  width: 100%;
  padding: var(--spacing-3);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--gray-700);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-200);
    transform: translateY(-1px);
  }
`;

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, toggleSetting, resetSettings } = useAccessibility();
  const [fontSize, setFontSize] = useState(settings.fontSize);

  // Handle toggle setting
  const handleToggle = (key) => {
    toggleSetting(key);
  };

  // Handle select change
  const handleSelectChange = (key, value) => {
    updateSetting(key, value);
  };

  // Handle range change
  const handleRangeChange = (key, value) => {
    updateSetting(key, value);
  };

  // Handle reset
  const handleReset = () => {
    resetSettings();
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          background: 'var(--primary-blue)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 'var(--z-sticky)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdAccessibility />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
        <AccessibilityPanelContainer
          className={isOpen ? 'open' : ''}
          initial={{ x: 350 }}
          animate={{ x: 0 }}
          exit={{ x: 350 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <PanelHeader>
            <PanelTitle>
              <MdAccessibility />
              Accessibility
            </PanelTitle>
            <CloseButton
              onClick={() => setIsOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX />
            </CloseButton>
          </PanelHeader>

          <PanelContent>
            {/* Visual Settings */}
            <SettingSection>
              <SectionTitle>
                <FiEye />
                Visual Settings
              </SectionTitle>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('highContrast')}>
                  <SettingInfo>
                    <SettingName>High Contrast</SettingName>
                    <SettingDescription>Increase contrast for better visibility</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.highContrast} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('largeText')}>
                  <SettingInfo>
                    <SettingName>Large Text</SettingName>
                    <SettingDescription>Increase text size for better readability</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.largeText} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel>
                  <SettingInfo>
                    <SettingName>Font Size</SettingName>
                    <SettingDescription>Adjust text size</SettingDescription>
                  </SettingInfo>
                  <Select
                    value={settings.fontSize}
                    onChange={(e) => handleSelectChange('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </Select>
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel>
                  <SettingInfo>
                    <SettingName>Color Blindness</SettingName>
                    <SettingDescription>Adjust colors for color vision deficiency</SettingDescription>
                  </SettingInfo>
                  <Select
                    value={settings.colorBlindness}
                    onChange={(e) => handleSelectChange('colorBlindness', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-Blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                  </Select>
                </SettingLabel>
              </SettingItem>
            </SettingSection>

            {/* Motion Settings */}
            <SettingSection>
              <SectionTitle>
                <FiMonitor />
                Motion & Animation
              </SectionTitle>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('reducedMotion')}>
                  <SettingInfo>
                    <SettingName>Reduced Motion</SettingName>
                    <SettingDescription>Minimize animations and transitions</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.reducedMotion} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('focusIndicators')}>
                  <SettingInfo>
                    <SettingName>Focus Indicators</SettingName>
                    <SettingDescription>Show focus outlines for keyboard navigation</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.focusIndicators} />
                </SettingLabel>
              </SettingItem>
            </SettingSection>

            {/* Audio Settings */}
            <SettingSection>
              <SectionTitle>
                <FiVolume2 />
                Audio & Voice
              </SectionTitle>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('voiceEnabled')}>
                  <SettingInfo>
                    <SettingName>Voice Assistant</SettingName>
                    <SettingDescription>Enable text-to-speech and voice commands</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.voiceEnabled} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('soundEffects')}>
                  <SettingInfo>
                    <SettingName>Sound Effects</SettingName>
                    <SettingDescription>Play audio feedback for interactions</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.soundEffects} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('autoPlay')}>
                  <SettingInfo>
                    <SettingName>Auto-Play Audio</SettingName>
                    <SettingDescription>Automatically play audio messages</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.autoPlay} />
                </SettingLabel>
              </SettingItem>
            </SettingSection>

            {/* Interaction Settings */}
            <SettingSection>
              <SectionTitle>
                <FiSmartphone />
                Interaction
              </SectionTitle>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('keyboardNavigation')}>
                  <SettingInfo>
                    <SettingName>Keyboard Navigation</SettingName>
                    <SettingDescription>Enable full keyboard navigation support</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.keyboardNavigation} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('hapticFeedback')}>
                  <SettingInfo>
                    <SettingName>Haptic Feedback</SettingName>
                    <SettingDescription>Vibrate device for interactions (mobile)</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.hapticFeedback} />
                </SettingLabel>
              </SettingItem>

              <SettingItem>
                <SettingLabel onClick={() => handleToggle('screenReader')}>
                  <SettingInfo>
                    <SettingName>Screen Reader Support</SettingName>
                    <SettingDescription>Optimize for screen reader software</SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch active={settings.screenReader} />
                </SettingLabel>
              </SettingItem>
            </SettingSection>

            {/* Reset Button */}
            <ResetButton
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset to Default Settings
            </ResetButton>
          </PanelContent>
        </AccessibilityPanelContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityPanel;
