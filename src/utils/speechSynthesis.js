let synthesis = null;
let isSupported = false;
let currentUtterance = null;

export const checkSpeechSynthesisSupport = () => {
  isSupported = 'speechSynthesis' in window;
  return isSupported;
};

export const initializeSpeechSynthesis = async () => {
  try {
    if (!checkSpeechSynthesisSupport()) {
      throw new Error('Speech synthesis is not supported in this browser');
    }

    synthesis = window.speechSynthesis;
    
    if (synthesis.getVoices().length === 0) {
      await new Promise((resolve) => {
        synthesis.onvoiceschanged = resolve;
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing speech synthesis:', error);
    return false;
  }
};

export const getAvailableVoices = () => {
  if (!synthesis) return [];
  
  return synthesis.getVoices().map(voice => ({
    name: voice.name,
    lang: voice.lang,
    localService: voice.localService,
    default: voice.default
  }));
};

export const getIndianVoices = () => {
  const voices = getAvailableVoices();
  return voices.filter(voice => 
    voice.lang.includes('en-IN') || 
    voice.lang.includes('hi-IN') ||
    voice.name.toLowerCase().includes('indian')
  );
};

export const speakText = (text, options = {}) => {
  if (!synthesis) {
    console.error('Speech synthesis not initialized');
    return false;
  }

  try {
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-IN';
    
    if (options.voice) {
      const voices = synthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      currentUtterance = utterance;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      console.error('Speech synthesis error:', event.error);
      if (options.onError) options.onError(event.error);
    };

    utterance.onpause = () => {
      if (options.onPause) options.onPause();
    };

    utterance.onresume = () => {
      if (options.onResume) options.onResume();
    };

    synthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Error speaking text:', error);
    return false;
  }
};

export const stopSpeaking = () => {
  if (synthesis) {
    synthesis.cancel();
    currentUtterance = null;
    return true;
  }
  return false;
};

export const pauseSpeaking = () => {
  if (synthesis) {
    synthesis.pause();
    return true;
  }
  return false;
};

export const resumeSpeaking = () => {
  if (synthesis) {
    synthesis.resume();
    return true;
  }
  return false;
};

export const isSpeaking = () => {
  return synthesis ? synthesis.speaking : false;
};

export const isPaused = () => {
  return synthesis ? synthesis.paused : false;
};

export const getCurrentUtterance = () => {
  return currentUtterance;
};

export const speakWithIndianAccent = (text, options = {}) => {
  const indianVoices = getIndianVoices();
  const voice = indianVoices.find(v => v.lang.includes('en-IN')) || indianVoices[0];
  
  return speakText(text, {
    ...options,
    voice: voice?.name,
    lang: 'en-IN',
    rate: 0.85,
    pitch: 1.1
  });
};

export const speakInHindi = (text, options = {}) => {
  const hindiVoices = getAvailableVoices().filter(v => v.lang.includes('hi-IN'));
  const voice = hindiVoices[0];
  
  return speakText(text, {
    ...options,
    voice: voice?.name,
    lang: 'hi-IN',
    rate: 0.8,
    pitch: 1
  });
};

export const speakMedicalTerms = (text, options = {}) => {
  return speakText(text, {
    ...options,
    rate: 0.7,
    pitch: 1.2,
    volume: 1.2
  });
};

export const speakEmergency = (text, options = {}) => {
  return speakText(text, {
    ...options,
    rate: 1.1,
    pitch: 1.3,
    volume: 1.5
  });
};

export const speakWithPauses = (text, options = {}) => {
  const textWithPauses = text
    .replace(/\./g, '... ')
    .replace(/,/g, ', ... ')
    .replace(/!/g, '! ... ')
    .replace(/\?/g, '? ... ');
  
  return speakText(textWithPauses, {
    ...options,
    rate: 0.8
  });
};

export const queueSpeak = (texts, options = {}) => {
  if (!synthesis) return false;
  
  texts.forEach((text, index) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-IN';
    
    utterance.onstart = () => {
      if (options.onStart) options.onStart(text, index);
    };
    
    utterance.onend = () => {
      if (options.onEnd) options.onEnd(text, index);
    };
    
    synthesis.speak(utterance);
  });
  
  return true;
};

export const speakWithEmphasis = (text, keywords = [], options = {}) => {
  let emphasizedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    emphasizedText = emphasizedText.replace(regex, `${keyword}...`);
  });
  
  return speakText(emphasizedText, {
    ...options,
    rate: 0.8
  });
};

export const getSpeechSynthesisState = () => {
  if (!synthesis) return 'not-supported';
  
  if (synthesis.speaking) return 'speaking';
  if (synthesis.paused) return 'paused';
  return 'idle';
};

export const setSpeechSynthesisProperties = (properties) => {
  if (!synthesis) return false;
  
  try {
    if (properties.rate !== undefined) synthesis.rate = properties.rate;
    if (properties.pitch !== undefined) synthesis.pitch = properties.pitch;
    if (properties.volume !== undefined) synthesis.volume = properties.volume;
    return true;
  } catch (error) {
    console.error('Error setting speech synthesis properties:', error);
    return false;
  }
};

export const speechSynthesisUtils = {
  checkSupport: checkSpeechSynthesisSupport,
  initialize: initializeSpeechSynthesis,
  getVoices: getAvailableVoices,
  getIndianVoices,
  speak: speakText,
  stop: stopSpeaking,
  pause: pauseSpeaking,
  resume: resumeSpeaking,
  isSpeaking,
  isPaused,
  getCurrentUtterance,
  speakWithIndianAccent,
  speakInHindi,
  speakMedicalTerms,
  speakEmergency,
  speakWithPauses,
  queueSpeak,
  speakWithEmphasis,
  getState: getSpeechSynthesisState,
  setProperties: setSpeechSynthesisProperties
};
