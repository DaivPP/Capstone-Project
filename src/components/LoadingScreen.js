import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { gsap } from 'gsap';

const LoadingContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
`;

const LogoContainer = styled(motion.div)`
  text-align: center;
  margin-bottom: var(--spacing-8);
`;

const Logo = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto var(--spacing-4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled(motion.h1)`
  font-size: var(--font-size-4xl);
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled(motion.p)`
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin: var(--spacing-2) 0 0 0;
  font-weight: 300;
`;

const LoadingBar = styled(motion.div)`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--spacing-6);
`;

const LoadingProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ffffff, #e0e7ff);
  border-radius: var(--radius-full);
`;

const LoadingText = styled(motion.p)`
  font-size: var(--font-size-sm);
  opacity: 0.7;
  margin-top: var(--spacing-3);
  text-align: center;
`;

const FeaturesList = styled(motion.div)`
  display: flex;
  gap: var(--spacing-6);
  margin-top: var(--spacing-8);
  opacity: 0.8;
`;

const Feature = styled(motion.div)`
  text-align: center;
  font-size: var(--font-size-sm);
  
  .icon {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-2);
    display: block;
  }
`;

const LoadingScreen = () => {
  const logoRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // Animate logo rotation
    gsap.to(logoRef.current, {
      rotation: 360,
      duration: 3,
      ease: 'none',
      repeat: -1
    });

    // Animate loading progress
    gsap.to(progressRef.current, {
      width: '100%',
      duration: 2,
      ease: 'power2.out'
    });

    // Pulse animation for logo
    gsap.to(logoRef.current, {
      scale: 1.1,
      duration: 1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    });
  }, []);

  return (
    <LoadingContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LogoContainer>
        <Logo
          ref={logoRef}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: 'back.out(1.7)' }}
        >
          🤖
        </Logo>
        
        <Title
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Sevak
        </Title>
        
        <Subtitle
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Apki Seva Mein ✨
        </Subtitle>
      </LogoContainer>

      <LoadingBar>
        <LoadingProgress
          ref={progressRef}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'power2.out' }}
        />
      </LoadingBar>

      <LoadingText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        Initializing medical intelligence...
      </LoadingText>

      <FeaturesList
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Feature
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <span className="icon">🏥</span>
          <div>Symptom Checker</div>
        </Feature>
        
        <Feature
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <span className="icon">💊</span>
          <div>Medication Guide</div>
        </Feature>
        
        <Feature
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <span className="icon">🚨</span>
          <div>Emergency Support</div>
        </Feature>
        
        <Feature
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2.0 }}
        >
          <span className="icon">🎤</span>
          <div>Voice Assistant</div>
        </Feature>
      </FeaturesList>
    </LoadingContainer>
  );
};

export default LoadingScreen;
