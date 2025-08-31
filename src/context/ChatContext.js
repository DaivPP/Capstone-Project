import React, { createContext, useContext, useReducer, useEffect } from 'react';

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  chatHistory: [],
  currentSession: null
};

const ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  LOAD_CHAT_HISTORY: 'LOAD_CHAT_HISTORY',
  SAVE_CHAT_HISTORY: 'SAVE_CHAT_HISTORY',
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION'
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        currentSession: null
      };
    
    case ACTIONS.LOAD_CHAT_HISTORY:
      return {
        ...state,
        chatHistory: action.payload
      };
    
    case ACTIONS.SAVE_CHAT_HISTORY:
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      };
    
    case ACTIONS.SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: action.payload
      };
    
    default:
      return state;
  }
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sevak_chat_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        dispatch({ type: ACTIONS.LOAD_CHAT_HISTORY, payload: history });
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (state.chatHistory.length > 0) {
      localStorage.setItem('sevak_chat_history', JSON.stringify(state.chatHistory));
    }
  }, [state.chatHistory]);

  const addMessage = (message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  };

  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };

  const clearMessages = () => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES });
  };

  const saveChatSession = (session) => {
    dispatch({ type: ACTIONS.SAVE_CHAT_HISTORY, payload: session });
  };

  const setCurrentSession = (session) => {
    dispatch({ type: ACTIONS.SET_CURRENT_SESSION, payload: session });
  };

  const loadSession = (sessionId) => {
    const session = state.chatHistory.find(s => s.id === sessionId);
    if (session) {
      dispatch({ type: ACTIONS.SET_CURRENT_SESSION, payload: session });
      dispatch({ type: ACTIONS.CLEAR_MESSAGES });
      session.messages.forEach(message => {
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
      });
    }
  };

  const exportChatHistory = () => {
    const dataStr = JSON.stringify(state.chatHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sevak_chat_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteSession = (sessionId) => {
    const updatedHistory = state.chatHistory.filter(s => s.id !== sessionId);
    dispatch({ type: ACTIONS.LOAD_CHAT_HISTORY, payload: updatedHistory });
  };

  const value = {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    chatHistory: state.chatHistory,
    currentSession: state.currentSession,
    
    addMessage,
    setLoading,
    setError,
    clearMessages,
    saveChatSession,
    setCurrentSession,
    loadSession,
    exportChatHistory,
    deleteSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
