import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiX, FiPhone, FiMapPin, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { MdEmergency, MdLocalHospital, MdPhone, MdLocationOn } from 'react-icons/md';

const EmergencyModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(239, 68, 68, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
`;

const EmergencyContainer = styled(motion.div)`
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
  border: 3px solid var(--accent-red);
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
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

const EmergencyHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-6);
`;

const EmergencyIcon = styled.div`
  font-size: 3rem;
  color: var(--accent-red);
  margin-bottom: var(--spacing-3);
`;

const EmergencyTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--accent-red);
  margin-bottom: var(--spacing-2);
`;

const EmergencySubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--gray-600);
  margin: 0;
`;

const EmergencySection = styled.div`
  margin-bottom: var(--spacing-6);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const EmergencyActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
`;

const EmergencyAction = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: ${props => props.variant === 'critical' 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'var(--gray-50)'};
  color: ${props => props.variant === 'critical' ? 'white' : 'var(--gray-900)'};
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: all var(--transition-normal);
  text-align: left;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
`;

const ActionIcon = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-1);
`;

const ActionDescription = styled.div`
  font-size: var(--font-size-sm);
  opacity: 0.8;
`;

const ActionNumber = styled.div`
  font-weight: 700;
  font-size: var(--font-size-lg);
`;

const HospitalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const HospitalItem = styled(motion.div)`
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-100);
    border-color: var(--primary-blue);
    transform: translateY(-1px);
  }
`;

const HospitalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
`;

const HospitalIcon = styled.div`
  font-size: 1.5rem;
  color: var(--accent-green);
`;

const HospitalName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  font-size: var(--font-size-base);
`;

const HospitalDetails = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  line-height: 1.5;
`;

const EmergencyProtocols = styled.div`
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
`;

const ProtocolTitle = styled.h4`
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--accent-red);
  margin-bottom: var(--spacing-2);
`;

const ProtocolList = styled.ul`
  margin: 0;
  padding-left: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  line-height: 1.6;
`;

const ProtocolItem = styled.li`
  margin-bottom: var(--spacing-1);
`;

const EmergencyModal = ({ onClose, isEmergencyMode }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Emergency contact numbers
  const emergencyContacts = [
    {
      id: 'emergency',
      title: 'Emergency Services',
      description: 'Immediate emergency response',
      number: '108',
      variant: 'critical',
      icon: <MdEmergency />
    },
    {
      id: 'ambulance',
      title: 'Ambulance',
      description: 'Medical transport',
      number: '102',
      variant: 'critical',
      icon: <MdPhone />
    },
    {
      id: 'police',
      title: 'Police',
      description: 'Law enforcement',
      number: '100',
      variant: 'normal',
      icon: <FiPhone />
    },
    {
      id: 'fire',
      title: 'Fire Department',
      description: 'Fire and rescue',
      number: '101',
      variant: 'normal',
      icon: <FiPhone />
    }
  ];

  // Nearby hospitals
  const nearbyHospitals = [
    {
      id: 1,
      name: 'Apollo Hospitals',
      address: '154/11, Bannerghatta Road, Bangalore',
      phone: '+91-80-2630-4050',
      distance: '2.3 km',
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurology'],
      emergency: true
    },
    {
      id: 2,
      name: 'Fortis Hospital',
      address: '154/9, Bannerghatta Road, Bangalore',
      phone: '+91-80-6621-4444',
      distance: '3.1 km',
      specialties: ['Emergency Care', 'Surgery', 'ICU'],
      emergency: true
    },
    {
      id: 3,
      name: 'Manipal Hospital',
      address: '98, HAL Airport Road, Bangalore',
      phone: '+91-80-2502-4444',
      distance: '4.7 km',
      specialties: ['Emergency Medicine', 'Critical Care', 'Trauma'],
      emergency: true
    }
  ];

  // Handle emergency action
  const handleEmergencyAction = (action) => {
    switch (action.id) {
      case 'emergency':
        window.open('tel:108', '_self');
        break;
      case 'ambulance':
        window.open('tel:102', '_self');
        break;
      case 'police':
        window.open('tel:100', '_self');
        break;
      case 'fire':
        window.open('tel:101', '_self');
        break;
      default:
        break;
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    // Open maps with hospital location
    const address = encodeURIComponent(hospital.address);
    window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
  };

  return (
    <AnimatePresence>
      <EmergencyModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmergencyContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
        >
          <CloseButton
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </CloseButton>

          <EmergencyHeader>
            <EmergencyIcon>
              <MdEmergency />
            </EmergencyIcon>
            <EmergencyTitle>
              {isEmergencyMode ? 'CRITICAL EMERGENCY' : 'Emergency Help'}
            </EmergencyTitle>
            <EmergencySubtitle>
              {isEmergencyMode 
                ? 'Immediate medical attention required'
                : 'Quick access to emergency services'
              }
            </EmergencySubtitle>
          </EmergencyHeader>

          <EmergencySection>
            <SectionTitle>
              <FiAlertTriangle />
              Emergency Contacts
            </SectionTitle>
            <EmergencyActions>
              {emergencyContacts.map((contact) => (
                <EmergencyAction
                  key={contact.id}
                  variant={contact.variant}
                  onClick={() => handleEmergencyAction(contact)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon>
                    {contact.icon}
                  </ActionIcon>
                  <ActionContent>
                    <ActionTitle>{contact.title}</ActionTitle>
                    <ActionDescription>{contact.description}</ActionDescription>
                  </ActionContent>
                  <ActionNumber>{contact.number}</ActionNumber>
                </EmergencyAction>
              ))}
            </EmergencyActions>
          </EmergencySection>

          <EmergencySection>
            <SectionTitle>
              <MdLocalHospital />
              Nearby Hospitals
            </SectionTitle>
            <HospitalList>
              {nearbyHospitals.map((hospital) => (
                <HospitalItem
                  key={hospital.id}
                  onClick={() => handleHospitalSelect(hospital)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HospitalHeader>
                    <HospitalIcon>
                      <MdLocationOn />
                    </HospitalIcon>
                    <HospitalName>{hospital.name}</HospitalName>
                  </HospitalHeader>
                  <HospitalDetails>
                    <div>{hospital.address}</div>
                    <div>Phone: {hospital.phone}</div>
                    <div>Distance: {hospital.distance}</div>
                    <div>Specialties: {hospital.specialties.join(', ')}</div>
                  </HospitalDetails>
                </HospitalItem>
              ))}
            </HospitalList>
          </EmergencySection>

          <EmergencyProtocols>
            <ProtocolTitle>Emergency Protocols</ProtocolTitle>
            <ProtocolList>
              <ProtocolItem>Stay calm and assess the situation</ProtocolItem>
              <ProtocolItem>Call emergency services immediately (108)</ProtocolItem>
              <ProtocolItem>Do not move seriously injured persons</ProtocolItem>
              <ProtocolItem>Apply first aid if trained to do so</ProtocolItem>
              <ProtocolItem>Keep the person warm and comfortable</ProtocolItem>
              <ProtocolItem>Monitor breathing and consciousness</ProtocolItem>
            </ProtocolList>
          </EmergencyProtocols>
        </EmergencyContainer>
      </EmergencyModalOverlay>
    </AnimatePresence>
  );
};

export default EmergencyModal;
