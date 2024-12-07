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

// Use a PolySynth instead of Synth for polyphony
const polySynth = new Tone.PolySynth().toDestination();
const activeNotes = reactive<string[]>([]);

// Accept Notes as prop
const props = defineProps({
  notes: {
    type: Array,
    required: true,
  }
});

// Play a note and track it in the activeNotes array
const playNote = (note: string) => {
  polySynth.triggerAttackRelease(note, "8n");
  activeNotes.push(note);
  setTimeout(() => {
    activeNotes.shift();
  }, 500); // Remove the note after 500ms
};

const getNoteWithOctave = (note: string) => {
  const octave = 4; // Default octave is 4. You can customize this if you want a dynamic octave.
  return `${note}${octave}`;
};

// Method to play the sequence and then the chord
const playSample = () => {
  console.log(props.notes);
  const notesSequence = props.notes.map((note) => getNoteWithOctave(note)); // Ensure the note is in the correct format
  const chord = notesSequence; // Chord can be the same as the notes sequence or different, modify as needed

  // Play the notes sequence in arpeggio style
  let delay = 0;
  notesSequence.forEach((note: string) => {
    setTimeout(() => {
      playNote(note);
    }, delay);
    delay += 500; // 500ms delay between notes
  });

  // Play the chord after the sequence
  setTimeout(() => {
    // Play all notes of the chord at the same time (polyphonic)
    chord.forEach((note: string) => {
      polySynth.triggerAttackRelease(note, "2n"); // Use "2n" (half-note) to make the chord last longer
      activeNotes.push(note); // Add chord notes to activeNotes to keep them highlighted
    });

    // Remove the chord notes after a longer duration (e.g., 1000ms)
    setTimeout(() => {
      chord.forEach((note: string) => {
        const index = activeNotes.indexOf(note);
        if (index > -1) {
          activeNotes.splice(index, 1); // Remove note after it finishes playing
        }
      });
    }, 1000); // Keep the chord notes active for 1 second
  }, delay);
};

// Expose playSample method so it can be accessed by parent
defineExpose({
  playSample,
});

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
        :class="{ black: key.note.includes('#'), active: activeNotes.includes(`${key.note}${key.octave}`) }"
        @mousedown="playNote(`${key.note}${key.octave}`)"
      >
        <span class="note">{{ key.note }}</span>
      </div>
    </div>
    <div class="active-notes">
      <h3>Currently Playing:</h3>
      <div v-if="activeNotes.length > 0">
        <span v-for="note in activeNotes" :key="note">{{ note }}</span>
      </div>
      <div v-else>No notes being played</div>
    </div>
  </div>
</template>

<style scoped>
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
}

.key.black {
  width: 30px;
  height: 120px;
  margin: 0 -15px;
  z-index: 1;
  background-color: black;
}

.key.active {
  background-color: yellow;
}

.active-notes {
  margin-top: 20px;
  font-size: 1.2rem;
}
</style>
