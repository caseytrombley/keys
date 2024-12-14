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

// Function to normalize notes to their sharp equivalent
const normalizeNote = (note: string): string => {
  const normalizationMap: Record<string, string> = {
    Db: "C#",
    Eb: "D#",
    Fb: "E",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    Cb: "B", // Optional, if you want to standardize Cb as B
  };

  return normalizationMap[note] || note;
};

// Normalize notes to fit within three octaves (3 to 5) and play them in ascending order
const normalizeNotes = (notes: string[]): string[] => {
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  let currentOctave = 3; // Start with the lowest octave
  let normalizedNotes: string[] = [];

  for (let i = 0; i < notes.length; i++) {
    const note = normalizeNote(notes[i]); // Normalize the note

    const [base, octave] = note.split(/(\d+)/); // Split the note into its base (C, D, etc.) and octave (3, 4, etc.)

    let normalizedOctave = parseInt(octave) || currentOctave; // Use currentOctave if no octave is provided

    // Ensure the note fits within the octaves of interest (3 to 5)
    normalizedOctave = Math.max(3, Math.min(normalizedOctave, 5));

    // Ensure notes are played in order (ascending octaves and notes)
    if (
      normalizedNotes.length > 0 &&
      noteOrder.indexOf(base) < noteOrder.indexOf(normalizedNotes[normalizedNotes.length - 1]?.split(/(\d+)/)[0])
    ) {
      normalizedOctave = Math.min(normalizedOctave + 1, 5); // Move to the next octave if necessary
    }

    normalizedNotes.push(`${base}${normalizedOctave}`);
    currentOctave = normalizedOctave; // Update the current octave for the next note
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
