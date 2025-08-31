import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiSend, FiMic } from 'react-icons/fi';

import { useChat } from '../context/ChatContext';
import { useAccessibility } from '../context/AccessibilityContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
`;

const Header = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BotAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  backdrop-filter: blur(10px);
`;

const HeaderInfo = styled.div`
  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  p {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 0.25rem;
  ` : `
    background: white;
    color: #333;
    align-self: flex-start;
    border-bottom-left-radius: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `}
`;

const InputContainer = styled(motion.div)`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const Input = styled.textarea`
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  resize: none;
  outline: none;
  font-family: inherit;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SendButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VoiceButton = styled(motion.button)`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const ChatInterface = ({ isEmergencyMode, onEmergencyMode }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { messages, addMessage } = useChat();
  const { settings } = useAccessibility();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: {
          text: "Hello, Apki Seva Mein ✨\n\nI'm Sevak, your AI medical assistant. I can help you with:\n\n• Symptom checking and disease prediction\n• Treatment guidance and medication information\n• Prescription understanding\n• Emergency support and hospital locations\n\nHow can I assist you today?",
          confidence: 1.0,
          suggestions: [
            "Check my symptoms",
            "Explain my prescription",
            "Find nearby hospitals",
            "Emergency help"
          ]
        },
        timestamp: new Date()
      };
      addMessage(welcomeMessage);
    }
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const getFallbackResponse = (userInput) => {
    if (userInput.includes('malaria') && userInput.includes('symptom')) {
      return `🦟 **Malaria Symptoms:**

**Common Symptoms:**
• High fever (often cyclical - every 48-72 hours)
• Chills and shivering
• Headache
• Muscle aches and fatigue
• Nausea and vomiting
• Sweating

**Severe Symptoms (Seek immediate medical attention):**
• Severe anemia
• Difficulty breathing
• Jaundice (yellowing of skin/eyes)
• Confusion or seizures
• Dark urine
• Organ failure

**When to see a doctor:**
- If you have fever after visiting a malaria-endemic area
- If symptoms persist for more than 24 hours
- If you experience severe symptoms

**Prevention:**
• Use mosquito nets
• Apply insect repellent
• Take antimalarial medication if prescribed
• Wear long-sleeved clothing

Would you like me to help you with treatment options or prevention methods?`;
    } else if (userInput.includes('fever') || userInput.includes('temperature')) {
      return `🌡️ **Fever Information:**

**What is a fever?**
A fever is a body temperature above 100.4°F (38°C). It's often a sign that your body is fighting an infection.

**Common Causes:**
• Viral infections (cold, flu, COVID-19)
• Bacterial infections
• Malaria
• Heat exhaustion
• Certain medications

**When to seek medical attention:**
• Temperature above 103°F (39.4°C)
• Fever lasting more than 3 days
• Fever with severe headache
• Fever with rash
• Fever with neck stiffness
• Fever in infants under 3 months

**Home Care:**
• Rest and stay hydrated
• Take acetaminophen or ibuprofen (consult doctor first)
• Cool compress on forehead
• Light clothing
• Monitor temperature regularly

How high is your temperature? How long have you had the fever?`;
    } else if (userInput.includes('headache') || userInput.includes('head pain')) {
      return `🤕 **Headache Information:**

**Types of Headaches:**
• **Tension Headaches** - Most common, dull pain on both sides
• **Migraines** - Severe, often one-sided with nausea
• **Cluster Headaches** - Intense pain around one eye
• **Sinus Headaches** - Pain in forehead and cheeks

**Common Causes:**
• Stress and tension
• Dehydration
• Lack of sleep
• Eye strain
• Sinus infections
• High blood pressure

**When to seek medical attention:**
• Sudden, severe headache
• Headache with fever and stiff neck
• Headache after head injury
• Headache with confusion or vision changes
• Headache that's different from usual

**Home Remedies:**
• Rest in a quiet, dark room
• Stay hydrated
• Gentle neck stretches
• Over-the-counter pain relievers
• Cold or warm compress

How severe is your headache? Is it accompanied by other symptoms?`;
    } else {
      const genericResponses = [
        "I understand your concern. Could you provide more specific details about your symptoms?",
        "That's an important health question. Let me help you understand this better.",
        "I'd be happy to help with that. Can you tell me more about your symptoms?",
        "Thank you for sharing. To provide better guidance, could you describe your symptoms in detail?"
      ];
      return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: { text: inputValue.trim() },
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputValue('');
    inputRef.current.style.height = 'auto';

    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'bleeding', 'difficulty breathing'];
    const isEmergency = emergencyKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword)
    );
    
    if (isEmergency) {
      onEmergencyMode();
    }

    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:5001/api/chat/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          userId: 'anonymous',
          sessionId: Date.now().toString(),
          context: {
            isEmergency,
            userLocation: null,
            language: 'en'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.response || "I'm sorry, I couldn't process your request at the moment.";

      if (data.error && data.error.includes('OpenAI')) {
        responseText = getFallbackResponse(inputValue.toLowerCase());
      }

      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          type: 'bot',
          content: {
            text: responseText,
            confidence: data.confidence || 0.8
          },
          timestamp: new Date()
        });
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage({
        id: Date.now() + 1,
        type: 'bot',
        content: {
          text: "I apologize, but I'm experiencing some technical difficulties. Please try again.",
          confidence: 0.5
        },
        timestamp: new Date()
      });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ChatContainer>
      <Header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderContent>
          <BotAvatar>🩺</BotAvatar>
          <HeaderInfo>
            <h1>Sevak Medical Assistant</h1>
            <p>Your AI healthcare companion</p>
          </HeaderInfo>
        </HeaderContent>
      </Header>

      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              isUser={message.type === 'user'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {message.content.text}
            </MessageBubble>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <MessageBubble isUser={false}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
            </div>
          </MessageBubble>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          rows={1}
          style={{
            fontSize: settings?.largeText ? '1.1rem' : '1rem'
          }}
        />
        
        <VoiceButton
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Voice input"
        >
          <FiMic />
        </VoiceButton>
        
        <SendButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          aria-label="Send message"
        >
          <FiSend />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;
