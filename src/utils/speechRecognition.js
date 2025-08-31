let recognition = null;
let isSupported = false;

export const checkSpeechRecognitionSupport = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  isSupported = !!SpeechRecognition;
  return isSupported;
};

export const initializeSpeechRecognition = async () => {
  try {
    if (!checkSpeechRecognitionSupport()) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    return true;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return false;
  }
};

export const startSpeechRecognition = (onResult, onError, onEnd) => {
  if (!recognition) {
    onError('Speech recognition not initialized');
    return false;
  }

  try {
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      const isFinal = event.results[event.results.length - 1].isFinal;
      
      onResult(transcript, isFinal);
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture error. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      onError(errorMessage);
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();
    return true;
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    onError('Failed to start speech recognition');
    return false;
  }
};

export const stopSpeechRecognition = () => {
  if (recognition) {
    try {
      recognition.stop();
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      return false;
    }
  }
  return false;
};

export const abortSpeechRecognition = () => {
  if (recognition) {
    try {
      recognition.abort();
      return true;
    } catch (error) {
      console.error('Error aborting speech recognition:', error);
      return false;
    }
  }
  return false;
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'ta-IN', name: 'Tamil (India)' },
    { code: 'te-IN', name: 'Telugu (India)' },
    { code: 'bn-IN', name: 'Bengali (India)' },
    { code: 'mr-IN', name: 'Marathi (India)' },
    { code: 'gu-IN', name: 'Gujarati (India)' },
    { code: 'kn-IN', name: 'Kannada (India)' },
    { code: 'ml-IN', name: 'Malayalam (India)' },
    { code: 'pa-IN', name: 'Punjabi (India)' }
  ];
};

export const setRecognitionLanguage = (languageCode) => {
  if (recognition) {
    recognition.lang = languageCode;
    return true;
  }
  return false;
};

export const isRecognitionActive = () => {
  return recognition && recognition.state === 'recording';
};

export const getRecognitionState = () => {
  return recognition ? recognition.state : 'not-initialized';
};

export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

export const startSpeechRecognitionWithTimeout = (timeoutMs = 10000, onResult, onError, onEnd) => {
  const timeoutId = setTimeout(() => {
    stopSpeechRecognition();
    onError('Speech recognition timeout. Please try again.');
  }, timeoutMs);

  const wrappedOnEnd = () => {
    clearTimeout(timeoutId);
    onEnd();
  };

  const success = startSpeechRecognition(onResult, onError, wrappedOnEnd);
  
  if (!success) {
    clearTimeout(timeoutId);
  }
  
  return success;
};

export const startContinuousSpeechRecognition = (onResult, onError, onEnd) => {
  if (!recognition) {
    onError('Speech recognition not initialized');
    return false;
  }

  try {
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      const isFinal = event.results[event.results.length - 1].isFinal;
      
      onResult(transcript, isFinal);
    };

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (recognition.continuous) {
        try {
          recognition.start();
        } catch (error) {
          onEnd();
        }
      } else {
        onEnd();
      }
    };

    recognition.start();
    return true;
  } catch (error) {
    console.error('Error starting continuous speech recognition:', error);
    onError('Failed to start continuous speech recognition');
    return false;
  }
};

export const speechRecognitionUtils = {
  checkSupport: checkSpeechRecognitionSupport,
  initialize: initializeSpeechRecognition,
  start: startSpeechRecognition,
  stop: stopSpeechRecognition,
  abort: abortSpeechRecognition,
  getLanguages: getAvailableLanguages,
  setLanguage: setRecognitionLanguage,
  isActive: isRecognitionActive,
  getState: getRecognitionState,
  requestPermission: requestMicrophonePermission,
  startWithTimeout: startSpeechRecognitionWithTimeout,
  startContinuous: startContinuousSpeechRecognition
};
