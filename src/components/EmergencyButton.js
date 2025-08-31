import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { MdEmergency, MdPhone, MdLocationOn } from 'react-icons/md';

const EmergencyButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-fixed);
`;

const EmergencyButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${props => props.isActive 
    ? '0 0 30px rgba(239, 68, 68, 0.6)' 
    : 'var(--shadow-lg)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  position: relative;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.isActive 
      ? '0 0 40px rgba(239, 68, 68, 0.8)' 
      : '0 0 25px rgba(245, 158, 11, 0.6)'};
  }
  
  &:focus {
    outline: 3px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const PulseRing = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid ${props => props.isActive ? '#ef4444' : '#f59e0b'};
  border-radius: 50%;
  opacity: 0;
`;

const EmergencyPanel = styled(motion.div)`
  position: absolute;
  bottom: 100px;
  right: 0;
  width: 300px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-4);
  border: 2px solid var(--accent-red);
  
  @media (max-width: 768px) {
    width: 280px;
    right: -50px;
  }
`;

const EmergencyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  color: var(--accent-red);
  font-weight: 600;
  font-size: var(--font-size-lg);
`;

const EmergencyActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const EmergencyAction = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: ${props => props.variant === 'critical' 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'var(--gray-50)'};
  color: ${props => props.variant === 'critical' ? 'white' : 'var(--gray-900)'};
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
`;

const ActionIcon = styled.div`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionText = styled.div`
  flex: 1;
  text-align: left;
`;

const ActionNumber = styled.div`
  font-weight: 600;
  font-size: var(--font-size-base);
`;

const EmergencyButtonComponent = ({ isActive, onClick }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Handle emergency button click
  const handleEmergencyClick = () => {
    setIsPressed(true);
    onClick();
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 200);
  };

  // Handle emergency actions
  const handleEmergencyAction = (action) => {
    switch (action) {
      case 'call_108':
        window.open('tel:108', '_self');
        break;
      case 'call_102':
        window.open('tel:102', '_self');
        break;
      case 'find_hospitals':
        // Open maps or hospital finder
        window.open('https://maps.google.com/maps?q=hospitals+near+me', '_blank');
        break;
      case 'emergency_contacts':
        // Show emergency contacts
        console.log('Show emergency contacts');
        break;
      default:
        break;
    }
    
    setShowPanel(false);
  };

  return (
    <EmergencyButtonContainer>
      {/* Emergency Button */}
      <EmergencyButton
        isActive={isActive}
        onClick={handleEmergencyClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isPressed ? { scale: [1, 0.9, 1] } : {}}
        transition={{ duration: 0.2 }}
        aria-label="Emergency help"
      >
        <MdEmergency />
        
        {/* Pulsing ring animation */}
        <AnimatePresence>
          {isActive && (
            <PulseRing
              isActive={isActive}
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </EmergencyButton>

      {/* Emergency Panel */}
      <AnimatePresence>
        {showPanel && (
          <EmergencyPanel
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
          >
            <EmergencyHeader>
              <MdEmergency />
              Emergency Help
            </EmergencyHeader>
            
            <EmergencyActions>
              <EmergencyAction
                variant="critical"
                onClick={() => handleEmergencyAction('call_108')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>
                  <MdPhone />
                </ActionIcon>
                <ActionText>Emergency Services</ActionText>
                <ActionNumber>108</ActionNumber>
              </EmergencyAction>
              
              <EmergencyAction
                variant="critical"
                onClick={() => handleEmergencyAction('call_102')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>
                  <MdPhone />
                </ActionIcon>
                <ActionText>Ambulance</ActionText>
                <ActionNumber>102</ActionNumber>
              </EmergencyAction>
              
              <EmergencyAction
                onClick={() => handleEmergencyAction('find_hospitals')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>
                  <MdLocationOn />
                </ActionIcon>
                <ActionText>Find Nearby Hospitals</ActionText>
              </EmergencyAction>
              
              <EmergencyAction
                onClick={() => handleEmergencyAction('emergency_contacts')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>
                  <MdEmergency />
                </ActionIcon>
                <ActionText>All Emergency Contacts</ActionText>
              </EmergencyAction>
            </EmergencyActions>
          </EmergencyPanel>
        )}
      </AnimatePresence>
    </EmergencyButtonContainer>
  );
};

export default EmergencyButtonComponent;
