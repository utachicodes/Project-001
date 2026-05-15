
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
        this.recognition.interimResults = true;
        console.log('VoiceService: SpeechRecognition initialized');
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
      console.warn('VoiceService: Already listening, stopping previous session');
      this.stopListening();
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
      console.error('VoiceService: Recognition error', event.error);
      this.isListening = false;
      onError(event.error);
    };

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('VoiceService: Started listening', lang);
    } catch (e) {
      console.error('VoiceService: Failed to start listening', e);
      this.isListening = false;
      onError(e);
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

  public speak(text: string, lang: VoiceLanguage, onEnd?: () => void) {
    if (!this.synth) {
      console.error('VoiceService: Synthesis not supported');
      return;
    }

    console.log('VoiceService: Speaking', text.substring(0, 30) + '...', lang);
    this.synth.cancel();

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      const voices = this.synth!.getVoices();
      // Try to find a high-quality voice for the language
      const preferredVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
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
