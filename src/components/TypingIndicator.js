import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { gsap } from 'gsap';

const TypingContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: white;
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);
  box-shadow: var(--shadow-md);
  max-width: 200px;
  margin-bottom: var(--spacing-4);
`;

const BotAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: var(--primary-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: var(--gray-400);
  border-radius: 50%;
`;

const TypingIndicator = () => {
  const dotsRef = useRef([]);

  useEffect(() => {
    // Animate dots with GSAP
    const tl = gsap.timeline({ repeat: -1 });
    
    dotsRef.current.forEach((dot, index) => {
      tl.to(dot, {
        y: -10,
        duration: 0.4,
        ease: 'power2.out',
        delay: index * 0.1
      })
      .to(dot, {
        y: 0,
        duration: 0.4,
        ease: 'power2.in',
        delay: 0.1
      }, '-=0.3');
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <TypingContainer
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
    >
      <BotAvatar>🤖</BotAvatar>
      
      <DotsContainer>
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            ref={(el) => (dotsRef.current[index] = el)}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </DotsContainer>
    </TypingContainer>
  );
};

export default TypingIndicator;
