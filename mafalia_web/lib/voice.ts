
export type VoiceLanguage = 'en-US' | 'fr-FR' | 'ar-SA';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class VoiceService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false; // Disable interim results to reduce network noise and improve stability
        console.log('VoiceService: SpeechRecognition initialized (Stability Mode)');
      } else {
        console.warn('VoiceService: SpeechRecognition not supported in this browser');
      }
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    lang: VoiceLanguage,
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void,
    onError: (error: any) => void
  ) {
    if (!this.recognition) {
      console.error('VoiceService: Recognition not supported');
      return;
    }

    if (this.isListening) {
      console.warn('VoiceService: Already listening');
      return;
    }

    this.recognition.lang = lang;
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      onResult({ transcript, isFinal });
    };

    this.recognition.onend = () => {
      console.log('VoiceService: Recognition ended');
      this.isListening = false;
      onEnd();
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        console.log('VoiceService: Recognition aborted');
      } else if (event.error === 'network') {
        console.warn('VoiceService: Network error detected. This often happens if the speech service is temporarily unavailable or blocked.');
        onError('network');
      } else {
        console.error('VoiceService: Recognition error', event.error);
        onError(event.error);
      }
      this.isListening = false;
    };

    try {
      // Re-initialize if previously failed with network error
      if (this.isListening) {
        this.recognition.abort();
      }
      
      this.recognition.start();
      this.isListening = true;
      console.log('VoiceService: Started listening', lang);
    } catch (e: any) {
      if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
        console.warn('VoiceService: Recognition already started, ignoring request');
        this.isListening = true;
      } else {
        console.error('VoiceService: Failed to start listening', e);
        this.isListening = false;
        onError(e);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log('VoiceService: Stopped listening');
      } catch (e) {
        console.error('VoiceService: Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/#{1,6}\s?/g, '') // Headers
      .replace(/\*\*/g, '') // Bold
      .replace(/\*/g, '') // Italic
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/[-*+]\s/g, '') // List markers
      .replace(/\d+\.\s/g, '') // Numbered list markers
      .replace(/\n+/g, ' ') // Newlines to spaces
      .trim();
  }

  public speak(text: string, lang: VoiceLanguage, onEnd?: () => void) {
    if (!this.synth) {
      console.error('VoiceService: Synthesis not supported');
      return;
    }

    const cleanText = this.stripMarkdown(text);
    console.log('VoiceService: Speaking', cleanText.substring(0, 30) + '...', lang);
    this.synth.cancel();

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      
      // Natural voice tuning
      utterance.rate = 0.95; // Slightly slower for better clarity
      utterance.pitch = 1.05; // Slightly higher for a friendly, professional tone
      
      const voices = this.synth!.getVoices();
      // Try to find a high-quality voice for the language
      // Prefer "Google" voices for better quality in Chrome, or "premium" voices
      const languageMatch = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
      const preferredVoice = languageMatch.find(v => v.name.includes('Google') || v.name.includes('Premium')) 
        || languageMatch[0] 
        || voices[0];
        
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        console.log('VoiceService: Speaking ended');
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.error('VoiceService: Speaking error', e);
        if (onEnd) onEnd();
      };

      this.synth!.speak(utterance);
    };

    // Chrome workaround: voices might not be loaded yet
    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => {
        this.synth!.onvoiceschanged = null; // Prevent multiple triggers
        speakNow();
      };
    } else {
      speakNow();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      console.log('VoiceService: Stopped speaking');
    }
  }
}

export const voiceService = new VoiceService();
