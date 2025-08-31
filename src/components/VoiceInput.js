import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiMic, FiMicOff, FiX, FiVolume2 } from 'react-icons/fi';
import { startSpeechRecognition, stopSpeechRecognition } from '../utils/speechRecognition';

const VoiceModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
`;

const VoiceContainer = styled(motion.div)`
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  position: relative;
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

const MicButton = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.isRecording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-6);
  cursor: pointer;
  box-shadow: ${props => props.isRecording 
    ? '0 0 40px rgba(239, 68, 68, 0.6)' 
    : 'var(--shadow-lg)'};
  position: relative;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: scale(1.05);
  }
`;

const MicIcon = styled.div`
  font-size: 2.5rem;
  color: white;
`;

const PulseRing = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  opacity: 0;
`;

const StatusText = styled.div`
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-4);
  color: ${props => props.isRecording ? 'var(--accent-red)' : 'var(--gray-700)'};
`;

const TranscriptContainer = styled.div`
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
  min-height: 80px;
  text-align: left;
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--gray-700);
  
  ${props => props.isRecording && `
    border-color: var(--accent-red);
    background: rgba(239, 68, 68, 0.05);
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-top: var(--spacing-6);
`;

const ActionButton = styled(motion.button)`
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  ${props => props.variant === 'primary' && `
    background: var(--primary-blue);
    color: white;
    
    &:hover {
      background: var(--secondary-blue);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--gray-100);
    color: var(--gray-700);
    
    &:hover {
      background: var(--gray-200);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: var(--accent-red);
    color: white;
    
    &:hover {
      background: #dc2626;
      transform: translateY(-2px);
    }
  `}
`;

const Instructions = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-top: var(--spacing-4);
  line-height: 1.5;
`;

const VoiceInput = ({ onClose, onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Handle speech recognition result
  const handleSpeechResult = (text, isFinal) => {
    setTranscript(text);
    
    if (isFinal) {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Process the final transcript
      setTimeout(() => {
        onTranscript(text);
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Handle speech recognition error
  const handleSpeechError = (error) => {
    setError(error);
    setIsRecording(false);
  };

  // Handle speech recognition end
  const handleSpeechEnd = () => {
    setIsRecording(false);
  };

  // Start recording
  const startRecording = () => {
    setError('');
    setTranscript('');
    setIsRecording(true);
    
    const success = startSpeechRecognition(
      handleSpeechResult,
      handleSpeechError,
      handleSpeechEnd
    );
    
    if (!success) {
      setError('Failed to start voice recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    stopSpeechRecognition();
    setIsRecording(false);
  };

  // Handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle send transcript
  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopSpeechRecognition();
      }
    };
  }, [isRecording]);

  return (
    <AnimatePresence>
      <VoiceModal
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <VoiceContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
        >
          <CloseButton
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </CloseButton>

          <StatusText isRecording={isRecording}>
            {isProcessing ? 'Processing...' :
             isRecording ? 'Listening...' :
             error ? 'Error' :
             'Voice Input'}
          </StatusText>

          <MicButton
            isRecording={isRecording}
            onClick={handleMicClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MicIcon>
              {isRecording ? <FiMicOff /> : <FiMic />}
            </MicIcon>
            
            {/* Pulsing animation when recording */}
            <AnimatePresence>
              {isRecording && (
                <PulseRing
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </MicButton>

          <TranscriptContainer isRecording={isRecording}>
            {error ? (
              <div style={{ color: 'var(--accent-red)' }}>
                {error}
              </div>
            ) : transcript ? (
              transcript
            ) : (
              <div style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>
                {isRecording ? 'Listening...' : 'Click the microphone to start recording'}
              </div>
            )}
          </TranscriptContainer>

          <ActionButtons>
            {transcript && !isRecording && (
              <ActionButton
                variant="primary"
                onClick={handleSendTranscript}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </ActionButton>
            )}
            
            <ActionButton
              variant="secondary"
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </ActionButton>
          </ActionButtons>

          <Instructions>
            <strong>Instructions:</strong><br />
            • Click the microphone to start recording<br />
            • Speak clearly and naturally<br />
            • Click again to stop recording<br />
            • Your message will be sent automatically
          </Instructions>
        </VoiceContainer>
      </VoiceModal>
    </AnimatePresence>
  );
};

export default VoiceInput;
