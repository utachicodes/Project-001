
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
    if (!this.recognition) return;

    this.recognition.lang = lang;
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      onResult({ transcript, isFinal });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Speech recognition error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(text: string, lang: VoiceLanguage, onEnd?: () => void) {
    if (!this.synth) return;

    // Stop any current speaking
    this.synth.cancel();

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      const voices = this.synth!.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      this.synth!.speak(utterance);
    };

    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => speakNow();
    } else {
      speakNow();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();
