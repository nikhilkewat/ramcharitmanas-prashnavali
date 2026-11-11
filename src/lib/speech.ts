export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Chrome loads voices asynchronously; getVoices() is empty until
// `voiceschanged` fires. Wait briefly for it, then use whatever we have.
function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener('voiceschanged', done);
  });
}

const byLang = (voices: SpeechSynthesisVoice[], prefix: string) =>
  voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));

export interface SpeakOptions {
  hindi: string;
  /** Roman-script reading used when the device has no Hindi voice. */
  transliteration: string;
  onEnd: () => void;
  /** Checked after the async voice load; true means the user stopped meanwhile. */
  isCancelled?: () => boolean;
}

/**
 * Speaks the chaupai. Uses a Hindi voice when available; otherwise reads the
 * transliteration with an English voice (Indian English preferred), because an
 * English voice given Devanagari either stays silent or spells it out.
 * Returns false when no voice could be used at all.
 */
export async function speakChaupai({ hindi, transliteration, onEnd, isCancelled }: SpeakOptions): Promise<boolean> {
  const synth = window.speechSynthesis;
  const voices = await loadVoices();
  if (isCancelled?.()) return true;
  const hindiVoice = byLang(voices, 'hi');
  const fallback = byLang(voices, 'en-in') ?? byLang(voices, 'en');

  let utterance: SpeechSynthesisUtterance;
  if (hindiVoice) {
    utterance = new SpeechSynthesisUtterance(hindi);
    utterance.voice = hindiVoice;
    utterance.lang = hindiVoice.lang;
  } else if (fallback) {
    utterance = new SpeechSynthesisUtterance(transliteration);
    utterance.voice = fallback;
    utterance.lang = fallback.lang;
  } else if (voices.length === 0) {
    // Some engines never list voices but still speak; let the platform choose.
    utterance = new SpeechSynthesisUtterance(hindi);
    utterance.lang = 'hi-IN';
  } else {
    return false;
  }

  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.cancel();
  synth.speak(utterance);
  return true;
}
