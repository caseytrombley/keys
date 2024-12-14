<script setup lang="ts">
import * as Tone from "tone";
import { defineProps, defineExpose, reactive } from "vue";

// Define two octaves of piano keys and their MIDI mappings
const keys = [
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
  { note: "C", octave: 6 },
  { note: "C#", octave: 6 },
  { note: "D", octave: 6 },
  { note: "D#", octave: 6 },
  { note: "E", octave: 6 },
  { note: "F", octave: 6 },
  { note: "F#", octave: 6 },
  { note: "G", octave: 6 },
  { note: "G#", octave: 6 },
  { note: "A", octave: 6 },
  { note: "A#", octave: 6 },
  { note: "B", octave: 6 },
];


// Polyphonic synth for playing notes
const polySynth = new Tone.PolySynth().toDestination();
const activeNotes = reactive<{ note: string; octave: string }[]>([]);

// Define props for notes
const props = defineProps({
  notes: {
    type: Array as () => string[],
    required: true,
  },
});

// Normalize notes to fit within two octaves and play them in ascending order
const normalizeNotes = (notes: string[]): string[] => {
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // This will keep track of the last used octave
  let currentOctave = 4;

  const normalized = notes.map((note, index) => {
    const [base, octave] = note.split(/(\d+)/);

    if (!noteOrder.includes(base)) return null; // Skip invalid notes

    // Determine the octave: if the note has an octave, use it; otherwise, use the current octave.
    let normalizedOctave = octave ? parseInt(octave) : currentOctave;

    // If the octave exceeds the range of 4-6, adjust it.
    if (normalizedOctave < 4) {
      normalizedOctave = 4; // Ensure no octave below 4
    } else if (normalizedOctave > 6) {
      normalizedOctave = 6; // Ensure no octave above 6
    }

    // Ensure progression to next octave if the note comes after a high note of the current octave
    const noteIndex = noteOrder.indexOf(base);
    const prevNoteIndex = index > 0 ? noteOrder.indexOf(notes[index - 1].split(/(\d+)/)[0]) : -1;

    // If this note is higher than the previous one and would normally wrap to a new octave, increment the octave
    if (noteIndex < prevNoteIndex) {
      normalizedOctave = Math.min(normalizedOctave + 1, 6); // Make sure we do not go above octave 6
    }

    // Update current octave for the next note
    currentOctave = normalizedOctave;

    return `${base}${normalizedOctave}`;
  });

  return normalized.filter((note) => note); // Remove any invalid notes
};



// Play a note and update active notes
const playNote = (note: string) => {
  polySynth.triggerAttackRelease(note, "8n");
  const [base, octave] = note.split(/(\d+)/);

  activeNotes.push({ note: base, octave });

  setTimeout(() => {
    const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
    if (index > -1) activeNotes.splice(index, 1);
  }, 500);
};

// Play a chord and update active notes
const playChord = (notes: string[], duration: number) => {
  const chordNotes = notes.map((note) => {
    const [base, octave] = note.split(/(\d+)/);
    activeNotes.push({ note: base, octave });
    return note;
  });

  // Trigger the chord
  polySynth.triggerAttackRelease(chordNotes, `${duration}n`);

  // Remove notes from activeNotes after the chord duration
  setTimeout(() => {
    chordNotes.forEach((note) => {
      const [base, octave] = note.split(/(\d+)/);
      const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
      if (index > -1) activeNotes.splice(index, 1);
    });
  }, duration * 1000); // Convert to milliseconds
};

// Play a sample chord or sequence
const playSample = () => {
  const notesSequence = normalizeNotes(props.notes);

  // Play the single notes in sequence
  let delay = 0;
  notesSequence.forEach((note) => {
    setTimeout(() => {
      playNote(note);
    }, delay);
    delay += 500;
  });

  // Play the full chord after the sequence
  setTimeout(() => {
    playChord(notesSequence, 2); // 2-second chord duration
  }, delay);
};

// Expose the playSample method so it can be called by the parent
defineExpose({ playSample });
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
          'bg-primary lighten-5': props.notes.includes(`${key.note}${key.octave}`),
          'bg-primary': activeNotes.some((n) => n.note === key.note && n.octave === `${key.octave}`),
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
