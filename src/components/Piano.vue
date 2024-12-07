<script setup lang="ts">
import * as Tone from "tone";
import { defineProps, defineExpose, reactive, onMounted, onUnmounted } from "vue";

// Define the piano keys and their MIDI mappings
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
];

// Use a PolySynth for polyphony
const polySynth = new Tone.PolySynth().toDestination();
const activeNotes = reactive<{ note: string; octave: string }[]>([]);

// Map enharmonic equivalents
const enharmonicMap: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#",
};

// Normalize a note to ensure equivalent notes are recognized
const normalizeNote = (note: string): string => {
  const [base, octave] = note.split(/(\d+)/);
  return `${enharmonicMap[base] || base}${octave}`;
};

// Accept Notes as a prop
const props = defineProps({
  notes: {
    type: Array,
    required: true,
  },
});

// Play a note and track it in the activeNotes array
const playNote = (note: string) => {
  const [base, octave] = note.split(/(\d+)/);
  const normalizedNote = `${base}${octave || 4}`;

  polySynth.triggerAttackRelease(normalizedNote, "8n");

  // Add the note and its enharmonic equivalent to activeNotes array
  const enharmonicEquivalent = enharmonicMap[base];
  const notesToAdd = [{ note: base, octave: octave || "4" }];
  if (enharmonicEquivalent) {
    notesToAdd.push({ note: enharmonicEquivalent, octave: octave || "4" });
  }

  notesToAdd.forEach(({ note, octave }) => {
    if (!activeNotes.some((n) => n.note === note && n.octave === octave)) {
      activeNotes.push({ note, octave });
    }
  });

  // Remove note after it's done playing (500ms)
  setTimeout(() => {
    notesToAdd.forEach(({ note, octave }) => {
      const index = activeNotes.findIndex((n) => n.note === note && n.octave === octave);
      if (index > -1) activeNotes.splice(index, 1);
    });
  }, 500);
};

// Play a sample sequence and chord
const playSample = () => {
  const notesSequence = props.notes.map((note) => `${note}4`);

  let delay = 0;
  notesSequence.forEach((note) => {
    setTimeout(() => {
      playNote(note);
    }, delay);
    delay += 500;
  });

  setTimeout(() => {
    // Play the chord after the sequence with a longer duration (1 second)
    notesSequence.forEach((note) => {
      polySynth.triggerAttackRelease(note, "2n");
      // Highlight all notes in the chord
      const enharmonicEquivalent = enharmonicMap[note.slice(0, -1)];
      activeNotes.push({ note: note.slice(0, -1), octave: note.slice(-1) });
      if (enharmonicEquivalent) {
        activeNotes.push({ note: enharmonicEquivalent, octave: note.slice(-1) });
      }
    });

    // Remove the chord notes after 1 second
    setTimeout(() => {
      notesSequence.forEach((note) => {
        const notesToRemove = [
          { note: note.slice(0, -1), octave: note.slice(-1) },
          { note: enharmonicMap[note.slice(0, -1)], octave: note.slice(-1) }
        ];

        notesToRemove.forEach(({ note, octave }) => {
          const index = activeNotes.findIndex((n) => n.note === note && n.octave === octave);
          if (index > -1) activeNotes.splice(index, 1);
        });
      });
    }, 1000);
  }, delay);
};

// Expose playSample method so it can be accessed by the parent
defineExpose({ playSample });

// Handle keyboard input to play notes
const keyToNoteMap: Record<string, string> = {
  a: "C4",
  w: "C#4",
  s: "D4",
  e: "D#4",
  d: "E4",
  f: "F4",
  t: "F#4",
  g: "G4",
  y: "G#4",
  h: "A4",
  u: "A#4",
  j: "B4",
  k: "C5",
};

const handleKeyDown = (event: KeyboardEvent) => {
  const note = keyToNoteMap[event.key];
  if (note) playNote(note);
};

// Attach and detach keyboard listeners
onMounted(() => window.addEventListener("keydown", handleKeyDown));
onUnmounted(() => window.removeEventListener("keydown", handleKeyDown));
</script>

<template>
  <div class="piano">
    <div class="keys">
      <div
        v-for="key in keys"
        :key="`${key.note}${key.octave}`"
        class="key"
        :class="{
          black: key.note.includes('#'),
          active: activeNotes.some((n) => n.note === key.note && n.octave === `${key.octave}`) ||
                 activeNotes.some((n) => normalizeNote(`${key.note}${key.octave}`) === normalizeNote(`${n.note}${n.octave}`))
        }"
        @mousedown="playNote(`${key.note}${key.octave}`)"
      >
        <span class="note">{{ key.note }}</span>
      </div>
    </div>
    <div class="active-notes">
      <h3>Currently Playing:</h3>
      <div v-if="activeNotes.length > 0">
        <div v-for="note in activeNotes" :key="note.note">
          {{ note.note }}<span v-if="note.octave !== '4'">{{ note.octave }}</span>
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

    &.active {
      background-color: yellow;
    }
  }

  &.active {
    background-color: yellow;
  }
}

.active-notes {
  margin-top: 20px;
  font-size: 1.2rem;
}
</style>
