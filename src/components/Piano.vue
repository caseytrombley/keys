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
          'bg-primary': isActive(key),
          'bg-secondary': isHighlighted(key) && !isActive(key),
        }"
        @mousedown="playNote(`${key.note}${key.octave}`)"
      >
        <span class="note">{{ key.note }}</span>
      </div>
    </div>

    <!-- Active notes display -->
    <div class="active-notes">
      <h3>Currently Playing:</h3>
      <div v-if="activeNotes.length > 0">
        <div v-for="note in activeNotes" :key="`${note.note}${note.octave}`">
          {{ note.note }}{{ note.octave }}
        </div>
      </div>
      <div v-else>No notes being played</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Tone from "tone";
import { defineProps, defineExpose, reactive, onMounted } from "vue";

// Define three octaves of piano keys (3, 4, 5) and their MIDI mappings
const keys = [
  { note: "C", octave: 3 },
  { note: "C#", octave: 3 },
  { note: "D", octave: 3 },
  { note: "D#", octave: 3 },
  { note: "E", octave: 3 },
  { note: "F", octave: 3 },
  { note: "F#", octave: 3 },
  { note: "G", octave: 3 },
  { note: "G#", octave: 3 },
  { note: "A", octave: 3 },
  { note: "A#", octave: 3 },
  { note: "B", octave: 3 },
  { note: "C", octave: 4 },
  { note: "C#", octave: 4 },
  { note: "D", octave: 4 },
  { note: "D#", octave: 4 },
  { note: "E", octave: 4 },
  { note: "F", octave: 4 },
  { note: "F#", octave: 4 },
  { note: "G", octave: 4 },
  { note: "G#", octave: 4 },
  { note: "A", octave: 4 },
  { note: "A#", octave: 4 },
  { note: "B", octave: 4 },
  { note: "C", octave: 5 },
  { note: "C#", octave: 5 },
  { note: "D", octave: 5 },
  { note: "D#", octave: 5 },
  { note: "E", octave: 5 },
  { note: "F", octave: 5 },
  { note: "F#", octave: 5 },
  { note: "G", octave: 5 },
  { note: "G#", octave: 5 },
  { note: "A", octave: 5 },
  { note: "A#", octave: 5 },
  { note: "B", octave: 5 },
];

const polySynth = new Tone.PolySynth().toDestination();
const activeNotes = reactive<{ note: string; octave: string }[]>([]);

// Define props for notes
const props = defineProps({
  notes: {
    type: Array as () => string[],
    required: true,
  },
});

onMounted(() => {
  console.log("props.notes:", props.notes);
  // Example to test
  const testNotes = ["A", "C", "E", "F#", "B"];
  const normalizedTest = normalizeNotes(testNotes);
  console.log(normalizedTest); // Expected output: ["A3", "C4", "E4", "F#4", "B4"]
});

// Function to check if a note is part of the chord and should be highlighted
const isHighlighted = (key) => {
  // Normalize props.notes to ensure proper octave assignment
  const normalizedNotes = normalizeNotes(props.notes);

  // Check if the current key matches any normalized note
  return normalizedNotes.includes(`${key.note}${key.octave}`);
};


// Function to check if a note is active (being played)
const isActive = (key) => {
  return activeNotes.some((n) => n.note === key.note && n.octave === `${key.octave}`);
};

const normalizeNote = (note: string): string => {
  // Normalize accidentals to their sharp equivalents
  const normalizationMap: Record<string, string> = {
    Db: "C#",  // Normalize Db to C#
    Eb: "D#",  // Normalize Eb to D#
    Fb: "E",   // Normalize Fb to E
    Gb: "F#",  // Normalize Gb to F#
    Ab: "G#",  // Normalize Ab to G#
    Bb: "A#",  // Normalize Bb to A#
    Cb: "B",   // Normalize Cb to B
  };
  return normalizationMap[note] || note;  // Return normalized note or original note
};

const normalizeNotes = (notes: string[]): string[] => {
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let currentOctave = 3; // Start at octave 3 by default
  let normalizedNotes: string[] = [];

  // Handle the first note based on its value
  let firstNoteHandled = false;

  for (let i = 0; i < notes.length; i++) {
    const note = normalizeNote(notes[i]);  // Normalize the note
    const [base, originalOctave] = note.split(/(\d+)/);  // Split into base note and octave
    let normalizedOctave = parseInt(originalOctave) || currentOctave;  // Use provided octave or default to current

    // For the first note, if it's one of C, C#, D, D#, E, F, shift to octave 4
    if (!firstNoteHandled && ["C", "C#", "D", "D#", "E", "F"].includes(base)) {
      normalizedOctave = 4; // Ensure starting at octave 4 for these notes
      firstNoteHandled = true;
    } else if (firstNoteHandled) {
      // For other notes, ensure ascending order and adjust the octave if needed
      if (normalizedNotes.length > 0) {
        const previousBase = normalizedNotes[normalizedNotes.length - 1].split(/(\d+)/)[0];
        if (noteOrder.indexOf(base) < noteOrder.indexOf(previousBase)) {
          normalizedOctave += 1;  // If the note is out of order, shift to the next octave
        }
      }
    }

    // Add the normalized note with the correct octave
    normalizedNotes.push(`${base}${normalizedOctave}`);
    currentOctave = normalizedOctave;  // Update the current octave for the next note
  }

  return normalizedNotes;
};

// Play a single note
const playNote = (note: string) => {
  polySynth.triggerAttackRelease(note, "8n");
  const [base, octave] = note.split(/(\d+)/);

  activeNotes.push({ note: base, octave });

  setTimeout(() => {
    const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
    if (index > -1) activeNotes.splice(index, 1);
  }, 500);
};

// Play a chord
const playChord = (notes: string[], duration: number) => {
  const chordNotes = notes.map((note) => {
    const [base, octave] = note.split(/(\d+)/);
    activeNotes.push({ note: base, octave });
    return note;
  });

  polySynth.triggerAttackRelease(chordNotes, `${duration}n`);

  setTimeout(() => {
    chordNotes.forEach((note) => {
      const [base, octave] = note.split(/(\d+)/);
      const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
      if (index > -1) activeNotes.splice(index, 1);
    });
  }, duration * 1000);
};

// Play a sequence of notes and then a chord
const playSample = () => {
  const notesSequence = normalizeNotes(props.notes);

  let delay = 0;
  notesSequence.forEach((note) => {
    setTimeout(() => {
      playNote(note);
    }, delay);
    delay += 500;
  });

  setTimeout(() => {
    playChord(notesSequence, 2); // 2-second chord duration
  }, delay);
};

defineExpose({ playSample });
</script>

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
  margin: 2px;
  border: 1px solid #000;
  position: relative;
  background-color: white;
  cursor: pointer;
  user-select: none;

  &.black {
    width: 30px;
    height: 120px;
    margin: 0 -15px;
    z-index: 1;
    background-color: black;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .note {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    font-size: 0.8rem;
    color: #444;
  }
}

.active-notes {
  margin-top: 20px;
  font-size: 1.2rem;
  color: #333;

  h3 {
    margin-bottom: 10px;
  }

  div {
    font-weight: bold;
  }
}
</style>
