
const isDev = process.env.NODE_ENV === 'development';

export type VoiceLanguage = 'en-US' | 'fr-FR' | 'ar-SA';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

/** Manages browser speech recognition and speech synthesis for voice interactions. */
export class VoiceService {
  private recognition: { start(): void; stop(): void; abort(): void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: Event) => void) | null; onend: (() => void) | null; onerror: ((e: Event) => void) | null } | null = null;
  private synth: SpeechSynthesis | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        this.recognition = rec;
      } else {
        if (isDev) console.warn('VoiceService: SpeechRecognition not supported in this browser');
      }
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  /** Starts speech recognition in the given language and fires callbacks on result, end, or error. */
  public startListening(
    lang: VoiceLanguage,
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void,
    onError: (error: any) => void
  ) {
    if (!this.recognition) {
      if (isDev) console.error('VoiceService: Recognition not supported');
      return;
    }

    if (this.isListening) {
      if (isDev) console.warn('VoiceService: Already listening');
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
      this.isListening = false;
      onEnd();
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        // recognition aborted — no action needed
      } else if (event.error === 'network') {
        if (isDev) console.warn('VoiceService: Network error detected.');
        onError('network');
      } else {
        if (isDev) console.error('VoiceService: Recognition error', event.error);
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
    } catch (e: any) {
      if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
        if (isDev) console.warn('VoiceService: Recognition already started, ignoring request');
        this.isListening = true;
      } else {
        if (isDev) console.error('VoiceService: Failed to start listening', e);
        this.isListening = false;
        onError(e);
      }
    }
  }

  /** Stops the active speech recognition session. */
  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        if (isDev) console.error('VoiceService: Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, 'code block omitted') // Fenced code blocks
      .replace(/`[^`]+`/g, '') // Inline code
      .replace(/#{1,6}\s*/g, '') // Headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/__([^_]+)__/g, '$1') // Bold underline
      .replace(/_([^_]+)_/g, '$1') // Italic underline
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // Images
      .replace(/^[-*+]\s+/gm, '') // Unordered list markers
      .replace(/^\d+\.\s+/gm, '') // Ordered list markers
      .replace(/^>\s*/gm, '') // Blockquotes
      .replace(/^[-*_]{3,}\s*$/gm, '') // Horizontal rules
      .replace(/\|[^\n]+\|/g, '') // Tables
      .replace(/https?:\/\/\S+/g, '') // Raw URLs
      .replace(/\n{2,}/g, '. ') // Multiple newlines to sentence break
      .replace(/\n/g, ' ') // Single newlines to spaces
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[], lang: VoiceLanguage): SpeechSynthesisVoice | null {
    const langCode = lang.split('-')[0];
    const exactMatch = voices.filter(v => v.lang === lang);
    const langMatch = voices.filter(v => v.lang.startsWith(langCode));
    const pool = exactMatch.length > 0 ? exactMatch : langMatch;

    // Priority order: known high-quality voices
    const qualityNames = [
      'Google', 'Microsoft', 'Samantha', 'Karen', 'Daniel', 'Moira',
      'Tessa', 'Rishi', 'Premium', 'Enhanced', 'Natural',
    ];
    for (const q of qualityNames) {
      const v = pool.find(v => v.name.includes(q));
      if (v) return v;
    }
    return pool[0] || voices[0] || null;
  }

  public speak(text: string, lang: VoiceLanguage, onEnd?: () => void) {
    if (!this.synth) {
      if (isDev) console.error('VoiceService: Synthesis not supported');
      return;
    }

    const cleanText = this.stripMarkdown(text);
    if (!cleanText) { if (onEnd) onEnd(); return; }

    this.synth.cancel();

    const doSpeak = () => {
      const voices = this.synth!.getVoices();
      const voice = this.selectBestVoice(voices, lang);

      // Split into sentences for more natural delivery
      const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
      let idx = 0;

      const speakNext = () => {
        if (idx >= sentences.length) { if (onEnd) onEnd(); return; }
        const sentence = sentences[idx++].trim();
        if (!sentence) { speakNext(); return; }

        const utt = new SpeechSynthesisUtterance(sentence);
        utt.lang = lang;
        utt.rate = 0.92;
        utt.pitch = 1.0;
        utt.volume = 1.0;
        if (voice) utt.voice = voice;

        utt.onend = speakNext;
        utt.onerror = () => { if (onEnd) onEnd(); };
        this.synth!.speak(utt);
      };

      speakNext();
    };

    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => {
        this.synth!.onvoiceschanged = null;
        doSpeak();
      };
    } else {
      doSpeak();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();

export class VoiceError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'VoiceError';
  }
}

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return [
    { code: 'en-US', name: 'English' },
    { code: 'fr-FR', name: 'French' },
    { code: 'ar-SA', name: 'Arabic' },
  ];
}
