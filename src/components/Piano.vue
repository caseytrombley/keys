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
          'bg-secondary': isHighlighted(key),  // Check if the note is part of the chord
          'bg-primary': isActive(key),  // Highlight active notes while being played
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
import {defineProps, defineExpose, reactive, computed, onMounted} from "vue";

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
  console.log('props.notes:', props.notes);
  //returns array like this: ["C", "E", "G"]
});

// Function to check if a note is part of the chord
const isHighlighted = (key) => {
  const result = props.notes.includes(`${key.note}${key.octave}`);
  //console.log(`Checking ${key.note}${key.octave} - Highlighted: ${result}`);
  return result;
};


// Function to check if a note is active (being played)
const isActive = (key) => {
  return activeNotes.some((n) => n.note === key.note && n.octave === `${key.octave}`);
};

// Normalize notes to fit within two octaves and play them in ascending order
const normalizeNotes = (notes: string[]): string[] => {
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  let currentOctave = 4;

  const normalized = notes.map((note, index) => {
    const [base, octave] = note.split(/(\d+)/);

    if (!noteOrder.includes(base)) return null;

    let normalizedOctave = octave ? parseInt(octave) : currentOctave;

    if (normalizedOctave < 4) {
      normalizedOctave = 4;
    } else if (normalizedOctave > 6) {
      normalizedOctave = 6;
    }

    const noteIndex = noteOrder.indexOf(base);
    const prevNoteIndex = index > 0 ? noteOrder.indexOf(notes[index - 1].split(/(\d+)/)[0]) : -1;

    if (noteIndex < prevNoteIndex) {
      normalizedOctave = Math.min(normalizedOctave + 1, 6);
    }

    currentOctave = normalizedOctave;

    return `${base}${normalizedOctave}`;
  });

  return normalized.filter((note) => note);
};

const playNote = (note: string) => {
  polySynth.triggerAttackRelease(note, "8n");
  const [base, octave] = note.split(/(\d+)/);

  activeNotes.push({ note: base, octave });

  setTimeout(() => {
    const index = activeNotes.findIndex((n) => n.note === base && n.octave === octave);
    if (index > -1) activeNotes.splice(index, 1);
  }, 500);
};

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
