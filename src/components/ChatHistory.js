import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiSearch, FiDownload, FiTrash2, FiClock, FiMessageSquare } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const HistoryHeader = styled.div`
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
`;

const HistoryTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--spacing-3) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: var(--spacing-3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-8);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  outline: none;
  transition: all var(--transition-normal);
  
  &:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: var(--font-size-sm);
`;

const HistoryActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const ActionButton = styled(motion.button)`
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  
  ${props => props.variant === 'primary' && `
    background: var(--primary-blue);
    color: white;
    
    &:hover {
      background: var(--secondary-blue);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--gray-100);
    color: var(--gray-700);
    
    &:hover {
      background: var(--gray-200);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: var(--accent-red);
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  `}
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2);
`;

const HistoryItem = styled(motion.div)`
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--gray-200);
  
  &:hover {
    background: var(--gray-50);
    border-color: var(--primary-blue);
    transform: translateY(-1px);
  }
  
  ${props => props.isActive && `
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
  `}
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
`;

const HistoryItemTitle = styled.div`
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: ${props => props.isActive ? 'white' : 'var(--gray-900)'};
`;

const HistoryItemTime = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--gray-500)'};
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const HistoryItemPreview = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'var(--gray-600)'};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HistoryItemStats = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--gray-500)'};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-8);
  color: var(--gray-500);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: var(--spacing-3);
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-2);
`;

const EmptySubtext = styled.div`
  font-size: var(--font-size-sm);
  opacity: 0.7;
`;

const ChatHistory = () => {
  const { chatHistory, currentSession, loadSession, deleteSession, exportChatHistory } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState(chatHistory);

  // Filter history based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(chatHistory);
    } else {
      const filtered = chatHistory.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.messages?.some(msg => 
          msg.content.text?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, chatHistory]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get session preview
  const getSessionPreview = (session) => {
    const messages = session.messages || [];
    if (messages.length === 0) return 'No messages';
    
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage.content.text || '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  // Get session title
  const getSessionTitle = (session) => {
    if (session.title) return session.title;
    
    const messages = session.messages || [];
    if (messages.length === 0) return 'Untitled Conversation';
    
    const firstMessage = messages[0];
    const text = firstMessage.content.text || '';
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  // Handle session click
  const handleSessionClick = (session) => {
    loadSession(session.id);
  };

  // Handle delete session
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteSession(sessionId);
    }
  };

  // Handle export history
  const handleExportHistory = () => {
    exportChatHistory();
  };

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
      // Clear all sessions
      chatHistory.forEach(session => deleteSession(session.id));
    }
  };

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitle>
          <FiMessageSquare />
          Chat History
        </HistoryTitle>
        
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <HistoryActions>
          <ActionButton
            variant="primary"
            onClick={handleExportHistory}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload />
            Export
          </ActionButton>
          
          <ActionButton
            variant="danger"
            onClick={handleClearAll}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrash2 />
            Clear All
          </ActionButton>
        </HistoryActions>
      </HistoryHeader>

      <HistoryList>
        {filteredHistory.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FiMessageSquare />
            </EmptyIcon>
            <EmptyText>No conversations yet</EmptyText>
            <EmptySubtext>
              {searchTerm ? 'No conversations match your search' : 'Start a conversation to see it here'}
            </EmptySubtext>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {filteredHistory.map((session) => (
              <HistoryItem
                key={session.id}
                isActive={currentSession?.id === session.id}
                onClick={() => handleSessionClick(session)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HistoryItemHeader>
                  <HistoryItemTitle isActive={currentSession?.id === session.id}>
                    {getSessionTitle(session)}
                  </HistoryItemTitle>
                  <HistoryItemTime isActive={currentSession?.id === session.id}>
                    <FiClock />
                    {formatTime(session.timestamp)}
                  </HistoryItemTime>
                </HistoryItemHeader>
                
                <HistoryItemPreview isActive={currentSession?.id === session.id}>
                  {getSessionPreview(session)}
                </HistoryItemPreview>
                
                <HistoryItemStats isActive={currentSession?.id === session.id}>
                  <StatItem>
                    <FiMessageSquare />
                    {session.messages?.length || 0} messages
                  </StatItem>
                  
                  <ActionButton
                    variant="danger"
                    size="small"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                  >
                    <FiTrash2 />
                  </ActionButton>
                </HistoryItemStats>
              </HistoryItem>
            ))}
          </AnimatePresence>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default ChatHistory;
