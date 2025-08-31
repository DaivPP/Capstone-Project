import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import styled from 'styled-components';
import { FiCopy, FiVolume2, FiHeart, FiShare2, FiChevronDown } from 'react-icons/fi';
import { MdInfo, MdLocalHospital, MdWarning } from 'react-icons/md';

const MessageContainer = styled(motion.div)`
  display: flex;
  justify-content: ${props => props.type === 'user' ? 'flex-end' : 'flex-start'};
  margin-bottom: var(--spacing-4);
`;

const MessageWrapper = styled.div`
  max-width: 70%;
  position: relative;
`;

const MessageBubble = styled(motion.div)`
  background: ${props => props.type === 'user' 
    ? 'var(--gradient-primary)' 
    : 'white'};
  color: ${props => props.type === 'user' ? 'white' : 'var(--gray-900)'};
  padding: var(--spacing-4);
  border-radius: ${props => props.type === 'user' 
    ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)' 
    : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)'};
  box-shadow: var(--shadow-md);
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
  
  ${props => props.isEmergency && `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: 2px solid #fecaca;
  `}
  
  ${props => props.confidence && props.confidence < 0.7 && `
    border-left: 4px solid var(--accent-yellow);
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  opacity: 0.8;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: ${props => props.type === 'user' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'var(--primary-blue)'};
  color: white;
  margin-right: var(--spacing-2);
`;

const Timestamp = styled.span`
  font-size: var(--font-size-xs);
  opacity: 0.7;
`;

const ConfidenceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  
  .confidence-bar {
    width: 60px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-full);
    overflow: hidden;
    
    .fill {
      height: 100%;
      background: ${props => {
        if (props.confidence >= 0.8) return '#10b981';
        if (props.confidence >= 0.6) return '#f59e0b';
        return '#ef4444';
      }};
      transition: width 0.3s ease;
    }
  }
`;

const SuggestionsContainer = styled(motion.div)`
  margin-top: var(--spacing-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
`;

const SuggestionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2) var(--spacing-3);
  color: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const MessageActions = styled.div`
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
  opacity: 0;
  transition: opacity var(--transition-normal);
  
  ${MessageWrapper}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const EmergencyWarning = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
  color: var(--accent-red);
  
  .icon {
    font-size: 1.2rem;
  }
  
  .text {
    font-size: var(--font-size-sm);
    font-weight: 500;
  }
`;

const HospitalInfo = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
  
  .header {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-2);
    color: var(--accent-green);
    font-weight: 600;
  }
  
  .details {
    font-size: var(--font-size-sm);
    color: var(--gray-700);
  }
`;

const MessageBubbleComponent = ({ message, index, onSuggestionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const { type, content, timestamp, confidence, suggestions, isEmergency, hospitalInfo } = message;

  // Animation on mount
  useEffect(() => {
    if (!hasAnimated) {
      const tl = gsap.timeline();
      
      tl.fromTo(`#message-${message.id}`, 
        { 
          opacity: 0, 
          y: type === 'user' ? 20 : -20,
          scale: 0.8 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: 'back.out(1.7)' 
        }
      );
      
      setHasAnimated(true);
    }
  }, [message.id, type, hasAnimated]);

  // Handle copy message
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.text);
      // Show success toast
      console.log('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Handle speak message
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle share message
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sevak Medical Chat',
          text: content.text,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MessageContainer
      type={type}
      initial={{ opacity: 0, y: type === 'user' ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <MessageWrapper>
        <MessageBubble
          id={`message-${message.id}`}
          type={type}
          isEmergency={isEmergency}
          confidence={confidence}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Message Header */}
          <MessageHeader>
            <Avatar type={type}>
              {type === 'user' ? '👤' : '🤖'}
            </Avatar>
            <span>{type === 'user' ? 'You' : 'Sevak'}</span>
            <Timestamp>{formatTime(timestamp)}</Timestamp>
          </MessageHeader>

          {/* Message Content */}
          <div style={{ fontSize: 'var(--font-size-base)' }}>
            {content.text}
          </div>

          {/* Confidence Indicator (for bot messages) */}
          {type === 'bot' && confidence && (
            <ConfidenceIndicator confidence={confidence}>
                              <MdInfo />
              <span>Confidence: {Math.round(confidence * 100)}%</span>
              <div className="confidence-bar">
                <div 
                  className="fill" 
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </ConfidenceIndicator>
          )}

          {/* Emergency Warning */}
          {isEmergency && (
            <EmergencyWarning>
              <MdWarning className="icon" />
              <div className="text">
                <strong>Emergency Detected!</strong> Please seek immediate medical attention.
              </div>
            </EmergencyWarning>
          )}

          {/* Hospital Information */}
          {hospitalInfo && (
            <HospitalInfo>
              <div className="header">
                <MdLocalHospital />
                <span>Nearby Hospital</span>
              </div>
              <div className="details">
                <div><strong>{hospitalInfo.name}</strong></div>
                <div>{hospitalInfo.address}</div>
                <div>Phone: {hospitalInfo.phone}</div>
                <div>Distance: {hospitalInfo.distance}</div>
              </div>
            </HospitalInfo>
          )}

          {/* Message Actions */}
          <MessageActions>
            <ActionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              aria-label="Copy message"
            >
              <FiCopy />
            </ActionButton>
            
            <ActionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeak}
              aria-label="Speak message"
            >
              <FiVolume2 />
            </ActionButton>
            
            <ActionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              aria-label="Share message"
            >
              <FiShare2 />
            </ActionButton>
          </MessageActions>
        </MessageBubble>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <SuggestionsContainer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {suggestions.map((suggestion, idx) => (
              <SuggestionButton
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              >
                {suggestion}
              </SuggestionButton>
            ))}
          </SuggestionsContainer>
        )}
      </MessageWrapper>
    </MessageContainer>
  );
};

export default MessageBubbleComponent;
