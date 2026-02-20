/**
 * Voice Commands Service
 * Uses Web Speech API for voice control
 */

type SpeechRecognition = any;

let recognition: SpeechRecognition | null = null;

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

const commands: VoiceCommand[] = [];

/**
 * Initialize voice recognition
 */
export function initVoiceRecognition() {
  if (typeof window === 'undefined') return false;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.log('Voice recognition not supported');
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log('Voice command:', transcript);
    handleVoiceCommand(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error('Voice recognition error:', event.error);
  };

  return true;
}

/**
 * Start listening
 */
export function startListening() {
  if (recognition) {
    recognition.start();
    return true;
  }
  return false;
}

/**
 * Stop listening
 */
export function stopListening() {
  if (recognition) {
    recognition.stop();
  }
}

/**
 * Register a voice command
 */
export function registerCommand(command: string, action: () => void, description: string) {
  commands.push({ command: command.toLowerCase(), action, description });
}

/**
 * Handle voice command
 */
function handleVoiceCommand(transcript: string) {
  for (const cmd of commands) {
    if (transcript.includes(cmd.command)) {
      cmd.action();
      speak(`Executing: ${cmd.description}`);
      return;
    }
  }

  // Default responses
  if (transcript.includes('help')) {
    speak('Available commands: ' + commands.map(c => c.command).join(', '));
  } else {
    speak('Command not recognized. Say help for available commands.');
  }
}

/**
 * Text-to-speech
 */
export function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

/**
 * Get all registered commands
 */
export function getCommands(): VoiceCommand[] {
  return commands;
}

/**
 * Clear all commands
 */
export function clearCommands() {
  commands.length = 0;
}
