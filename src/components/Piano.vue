<script setup lang="ts">
import * as Tone from "tone";
import { defineProps, defineExpose, defineEmits, reactive, onMounted, onUnmounted, ref } from "vue";

// Define three octaves of piano keys (3, 4, 5) and their MIDI mappings
const keys = [
  { note: "C", octave: 3, keyboardKey: "z", midiNote: 48 },
  { note: "C#", octave: 3, keyboardKey: "s", midiNote: 49 },
  { note: "D", octave: 3, keyboardKey: "x", midiNote: 50 },
  { note: "D#", octave: 3, keyboardKey: "d", midiNote: 51 },
  { note: "E", octave: 3, keyboardKey: "c", midiNote: 52 },
  { note: "F", octave: 3, keyboardKey: "v", midiNote: 53 },
  { note: "F#", octave: 3, keyboardKey: "g", midiNote: 54 },
  { note: "G", octave: 3, keyboardKey: "b", midiNote: 55 },
  { note: "G#", octave: 3, keyboardKey: "h", midiNote: 56 },
  { note: "A", octave: 3, keyboardKey: "n", midiNote: 57 },
  { note: "A#", octave: 3, keyboardKey: "j", midiNote: 58 },
  { note: "B", octave: 3, keyboardKey: "m", midiNote: 59 },
  { note: "C", octave: 4, keyboardKey: "q", midiNote: 60 },
  { note: "C#", octave: 4, keyboardKey: "2", midiNote: 61 },
  { note: "D", octave: 4, keyboardKey: "w", midiNote: 62 },
  { note: "D#", octave: 4, keyboardKey: "3", midiNote: 63 },
  { note: "E", octave: 4, keyboardKey: "e", midiNote: 64 },
  { note: "F", octave: 4, keyboardKey: "r", midiNote: 65 },
  { note: "F#", octave: 4, keyboardKey: "5", midiNote: 66 },
  { note: "G", octave: 4, keyboardKey: "t", midiNote: 67 },
  { note: "G#", octave: 4, keyboardKey: "6", midiNote: 68 },
  { note: "A", octave: 4, keyboardKey: "y", midiNote: 69 },
  { note: "A#", octave: 4, keyboardKey: "7", midiNote: 70 },
  { note: "B", octave: 4, keyboardKey: "u", midiNote: 71 },
  { note: "C", octave: 5, keyboardKey: "i", midiNote: 72 },
  { note: "C#", octave: 5, keyboardKey: "9", midiNote: 73 },
  { note: "D", octave: 5, keyboardKey: "o", midiNote: 74 },
  { note: "D#", octave: 5, keyboardKey: "0", midiNote: 75 },
  { note: "E", octave: 5, keyboardKey: "p", midiNote: 76 },
  { note: "F", octave: 5, keyboardKey: "[", midiNote: 77 },
  { note: "F#", octave: 5, keyboardKey: "=", midiNote: 78 },
  { note: "G", octave: 5, keyboardKey: "]", midiNote: 79 },
  { note: "G#", octave: 5, keyboardKey: null, midiNote: 80 },
  { note: "A", octave: 5, keyboardKey: null, midiNote: 81 },
  { note: "A#", octave: 5, keyboardKey: null, midiNote: 82 },
  { note: "B", octave: 5, keyboardKey: null, midiNote: 83 },
];

const polySynth = new Tone.PolySynth().toDestination();
const activeNotes = reactive<{ note: string; octave: string }[]>([]);
const pressedKeys = new Set<string>();
const midiAccess = ref<any>(null);

const props = defineProps({
  notes: {
    type: Array as () => string[],
    required: true,
  },
  size: {
    type: String as () => string,
  },
});

const emit = defineEmits<{
  (event: 'finish'): void;
}>();

// MIDI Setup
const setupMIDI = async () => {
  if (navigator.requestMIDIAccess) {
    try {
      const access = await navigator.requestMIDIAccess();
      midiAccess.value = access;

      for (const input of access.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
      }
      console.log("MIDI initialized successfully");
    } catch (error) {
      console.log("MIDI access denied or not available:", error);
    }
  }
};

const handleMIDIMessage = (message: any) => {
  const [command, note, velocity] = message.data;

  // 144 = note on, 128 = note off
  if (command === 144 && velocity > 0) {
    // Note on
    const key = keys.find(k => k.midiNote === note);
    if (key) {
      playNote(`${key.note}${key.octave}`, true);
    }
  } else if (command === 128 || (command === 144 && velocity === 0)) {
    // Note off
    const key = keys.find(k => k.midiNote === note);
    if (key) {
      stopNote(`${key.note}${key.octave}`);
    }
  }
};

// Keyboard event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  // Prevent repeat events when key is held
  if (event.repeat) return;

  const key = event.key.toLowerCase();

  // Prevent triggering if already pressed
  if (pressedKeys.has(key)) return;
  pressedKeys.add(key);

  const pianoKey = keys.find(k => k.keyboardKey === key);
  if (pianoKey) {
    event.preventDefault();
    playNote(`${pianoKey.note}${pianoKey.octave}`, true);
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  pressedKeys.delete(key);

  const pianoKey = keys.find(k => k.keyboardKey === key);
  if (pianoKey) {
    event.preventDefault();
    stopNote(`${pianoKey.note}${pianoKey.octave}`);
  }
};

onMounted(() => {
  setupMIDI();
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);

  // Clean up MIDI
  if (midiAccess.value) {
    for (const input of midiAccess.value.inputs.values()) {
      input.onmidimessage = null;
    }
  }
});

const getEnharmonicEquivalent = (note: string): string => {
  const enharmonics: Record<string, string> = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };
  return enharmonics[note] || "";
};

const isActive = (key: { note: string; octave: number }) => {
  return activeNotes.some((n) => n.note === key.note && n.octave === `${key.octave}`);
};

const normalizeNote = (note: string): string => {
  const normalizationMap: Record<string, string> = {
    Db: "C#",
    Eb: "D#",
    Fb: "E",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    Cb: "B",
  };
  return normalizationMap[note] || note;
};

const normalizeNotes = (notes: string[]): string[] => {
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const maxPlayableOctave = 5;
  const minPlayableOctave = 3;
  let currentOctave = 3;
  let firstNoteHandled = false;
  const normalizedNotes: string[] = [];

  const shiftNotesDownOneOctave = (notes: string[]) => {
    return notes.map((note) => {
      const baseNote = note.replace(/\d+/g, "");
      const currentOctave = parseInt(note.match(/\d+/)?.[0] || "3", 10);
      const newOctave = Math.max(currentOctave - 1, minPlayableOctave);
      return `${baseNote}${newOctave}`;
    });
  };

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    note = normalizeNote(note);

    const baseNote = note.replace(/\d+/g, "");
    let normalizedOctave = currentOctave;

    if (!firstNoteHandled) {
      if (["C", "C#", "D", "D#", "E", "F"].includes(baseNote)) {
        normalizedOctave = 4;
      }
      firstNoteHandled = true;
    } else {
      const prevNote = normalizedNotes[normalizedNotes.length - 1];
      const prevBase = prevNote.replace(/\d+/g, "");
      const prevOctave = parseInt(prevNote.match(/\d+/)?.[0] || `${currentOctave}`, 10);

      if (noteOrder.indexOf(baseNote) <= noteOrder.indexOf(prevBase)) {
        normalizedOctave = prevOctave + 1;
      } else {
        normalizedOctave = prevOctave;
      }
    }

    normalizedNotes.push(`${baseNote}${normalizedOctave}`);
    currentOctave = normalizedOctave;
  }

  const hasOutOfRangeNotes = normalizedNotes.some((note) => {
    const octave = parseInt(note.match(/\d+/)?.[0] || "3", 10);
    return octave > maxPlayableOctave;
  });

  if (hasOutOfRangeNotes) {
    return shiftNotesDownOneOctave(normalizedNotes);
  }

  return normalizedNotes;
};

// Play a sequence of notes one by one, then play the chord with all notes simultaneously
const playSample = async () => {
  const notesSequence = normalizeNotes(props.notes);
  const noteDelay = 500; // ms between notes in arpeggio
  const chordDuration = 2000; // ms for chord

  // Play arpeggio
  for (let i = 0; i < notesSequence.length; i++) {
    await new Promise(resolve => {
      playNote(notesSequence[i], false);
      setTimeout(() => {
        stopNote(notesSequence[i]);
        resolve(null);
      }, noteDelay);
    });
  }

  // Small pause before chord
  await new Promise(resolve => setTimeout(resolve, 200));

  // Play chord
  playChord(notesSequence, chordDuration);

  // Wait for chord to finish
  await new Promise(resolve => setTimeout(resolve, chordDuration));

  emit('finish');
};

// Play a single note and highlight it
const playNote = (note: string, sustained: boolean = false) => {
  const [base, octave] = note.split(/(\d+)/);

  // Check if note is already active to avoid duplicates
  const existingIndex = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
  if (existingIndex === -1) {
    activeNotes.push({ note: base, octave });
  }

  if (sustained) {
    // For keyboard/MIDI, keep note playing until explicitly stopped
    polySynth.triggerAttack(note);
  } else {
    // For clicks and sequences, play short note
    polySynth.triggerAttackRelease(note, "8n");
  }
};

// Stop a note (for keyboard/MIDI release)
const stopNote = (note: string) => {
  const [base, octave] = note.split(/(\d+)/);
  const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
  if (index > -1) {
    activeNotes.splice(index, 1);
    polySynth.triggerRelease(note);
  }
};

// Play the entire chord with all notes simultaneously
const playChord = (notes: string[], durationMs: number) => {
  // Clear existing active notes
  activeNotes.splice(0, activeNotes.length);

  // Add all chord notes to active notes
  notes.forEach(note => {
    const [base, octave] = note.split(/(\d+)/);
    activeNotes.push({ note: base, octave });
  });

  // Play all notes of the chord simultaneously
  polySynth.triggerAttackRelease(notes, `${durationMs / 1000}s`);

  // Clear active notes after duration
  setTimeout(() => {
    activeNotes.splice(0, activeNotes.length);
  }, durationMs);
};

// Play a chord immediately without the note sequence
const playChordOnly = () => {
  const notesSequence = normalizeNotes(props.notes);
  const duration = 2000; // ms

  playChord(notesSequence, duration);

  setTimeout(() => {
    emit('finish');
  }, duration);
};

// Handle mouse/touch click
const handleNoteClick = (note: string) => {
  playNote(note, false);
  setTimeout(() => {
    stopNote(note);
  }, 300);
};

defineExpose({ playSample, playChordOnly });
</script>

<template>
  <div class="piano">
    <!-- Piano keys -->
    <div class="keys">
      <div
        v-for="key in keys"
        :key="`${key.note}${key.octave}`"
        class="key"
        :class="{
          black: key.note.includes('#'),
          'active-note': isActive(key)
        }"
        @mousedown="handleNoteClick(`${key.note}${key.octave}`)"
        @touchstart.prevent="handleNoteClick(`${key.note}${key.octave}`)"
      >
        <span class="note">{{ key.note }}</span>
        <span v-if="key.note.includes('#')" class="enharmonic">{{ getEnharmonicEquivalent(key.note) }}</span>
        <span v-if="key.keyboardKey" class="keyboard-hint">{{ key.keyboardKey.toUpperCase() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.keys {
  display: flex;
  position: relative;
}

.key {
  width: 40px;
  height: 200px;
  font-size: 0.8rem;
  border: 1px solid #000;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  position: relative;
  background-color: white;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.05s ease;

  .note {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    color: #444;
    font-weight: bold;
  }

  .keyboard-hint {
    position: absolute;
    bottom: 30px;
    width: 100%;
    text-align: center;
    font-size: 0.65rem;
    color: #999;
    font-weight: normal;
  }

  &.black {
    width: 30px;
    height: 120px;
    margin: 0 -15px;
    z-index: 1;
    background-color: black;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .note {
      bottom: 20px;
      color: #ffffff;
    }

    .keyboard-hint {
      bottom: 40px;
      color: #666;
    }

    .enharmonic {
      position: absolute;
      bottom: 5px;
      width: 100%;
      text-align: center;
      color: #999999;
      font-size: 0.65rem;
    }
  }

  &.active-note {
    background-color: #4CAF50;

    &.black {
      background-color: #2E7D32;
    }
  }

  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    transform: translateY(1px);
  }
}

@media (max-width: 459px) {
  .key {
    width: 19px;
    height: 130px;
    margin: -.25px;
    font-size: 0.6rem;

    .keyboard-hint {
      display: none;
    }

    &.black {
      width: 14px;
      height: 80px;
      margin: 0 -8px;
    }
  }
}

@media (min-width: 460px) {
  .key {
    width: 25px;
    height: 160px;
    font-size: 0.7rem;

    &.black {
      width: 19px;
      height: 100px;
      margin: 0 -10px;
    }
  }
}

@media (min-width: 600px) {
  .key {
    width: 30px;
    height: 180px;
    font-size: 0.75rem;

    &.black {
      width: 22px;
      height: 110px;
      margin: 0 -12px;
    }
  }
}

@media (min-width: 768px) {
  .key {
    width: 35px;
    height: 180px;
    font-size: 0.7rem;

    &.black {
      width: 25px;
      height: 110px;
      margin: 0 -14px;
    }
  }
}

@media (min-width: 900px) {
  .key {
    width: 40px;
    height: 200px;
    font-size: 0.8rem;

    &.black {
      width: 30px;
      height: 120px;
      margin: 0 -15px;
    }
  }
}
</style>
