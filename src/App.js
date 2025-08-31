import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import ChatInterface from './components/ChatInterface';

import { ChatProvider } from './context/ChatContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const App = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const handleEmergencyMode = () => {
    setIsEmergencyMode(true);
    console.log('Emergency mode activated');
  };

  return (
    <AccessibilityProvider>
      <ChatProvider>
        <Router>
          <AppContainer>
            <MainContent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ChatInterface 
                      isEmergencyMode={isEmergencyMode}
                      onEmergencyMode={handleEmergencyMode}
                    />
                  } 
                />
              </Routes>
            </MainContent>
          </AppContainer>
        </Router>
      </ChatProvider>
    </AccessibilityProvider>
  );
};

export default App;
