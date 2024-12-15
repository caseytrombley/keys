<script setup lang="ts">
import * as Tone from "tone";
import { defineProps, defineExpose, defineEmits, reactive, onMounted } from "vue";

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

// Define the emit event
const emit = defineEmits<{
  (event: 'finish'): void;
}>();

onMounted(() => {
  // const input = ["B", "F#"];
  // const result = normalizeNotes(input);
  // console.log(result); // Output: ["B3", "F#4"]
  // console.log("props.notes:", props.notes);
  // // Example to test
  // const testNotes = ["A", "C", "E", "F#", "B"];
  // const normalizedTest = normalizeNotes(testNotes);
  // console.log(normalizedTest); // Expected output: ["A3", "C4", "E4", "F#4", "B4"]
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
  let currentOctave = 3; // Default starting octave
  const normalizedNotes: string[] = [];
  let firstNoteHandled = false;

  // Loop through each note and apply normalization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    note = normalizeNote(note);  // Normalize the note (e.g., Bb -> A#)

    const baseNote = note.replace(/\d+/g, ""); // Strip any existing octave info
    let normalizedOctave = currentOctave;

    // Special rule: First note "C" to "F" starts in octave 4
    if (!firstNoteHandled) {
      if (["C", "C#", "D", "D#", "E", "F"].includes(baseNote)) {
        normalizedOctave = 4; // Force first note to start in octave 4
      }
      firstNoteHandled = true;
    } else {
      // Handle subsequent notes
      const prevNote = normalizedNotes[normalizedNotes.length - 1];
      const prevBase = prevNote.replace(/\d+/g, ""); // Base note of the previous note
      const prevOctave = parseInt(prevNote.match(/\d+/)?.[0] || `${currentOctave}`, 10);

      if (noteOrder.indexOf(baseNote) <= noteOrder.indexOf(prevBase)) {
        // If the current note is earlier or equal to the previous note, increment the octave
        normalizedOctave = prevOctave + 1;
      } else {
        // Otherwise, stay in the same octave
        normalizedOctave = prevOctave;
      }
    }

    // Add the normalized note with its octave
    normalizedNotes.push(`${baseNote}${normalizedOctave}`);
    currentOctave = normalizedOctave; // Update the current octave
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

  // Play each note with the proper delay
  notesSequence.forEach((note) => {
    setTimeout(() => {
      playNote(note);
    }, delay);
    delay += 500;  // Assuming each note has a 500ms duration
  });

  // After all notes have played, play the chord (and wait for its duration before emitting 'finish')
  const chordDuration = 2; // Duration for the chord
  setTimeout(() => {
    playChord(notesSequence, chordDuration); // Play the chord for 2 seconds

    // Emit 'finish' after waiting for the chord's duration
    setTimeout(() => {
      emit('finish'); // Emit 'finish' after the chord's duration
    }, chordDuration * 1000); // Wait for the duration of the chord (in milliseconds)
  }, delay); // Delay for the last note's finish time
};


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
          'active-note': isActive(key),
          'highlighted-note': isHighlighted(key) && !isActive(key),
        }"
        @mousedown="playNote(`${key.note}${key.octave}`)"
      >
        <span class="note">{{ key.note }}</span>
      </div>
    </div>

    <!-- Active notes being played -->
<!--    <div class="details">-->
<!--      <h3 class="d-none">Notes currently playing:</h3>-->
<!--      <div class="detail-text">-->
<!--        <div v-for="note in activeNotes" :key="`${note.note}${note.octave}`">-->
<!--          {{ note.note }}{{ note.octave }}-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
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

  .note {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    font-size: 0.8rem;
    color: #444;
  }

  &.black {
    width: 30px;
    height: 120px;
    margin: 0 -15px;
    z-index: 1;
    background-color: black;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .note {
      color: #ffffff;
    }
  }

  &.highlighted-note {
    background-color: rgba(var(--v-theme-secondary), 1);
  }

  &.active-note {
    background-color: rgba(var(--v-theme-primary), 1);
  }
}

//.details {
//  margin-top: 20px;
//  font-size: 1.2rem;
//
//  h3 {
//    display: none;
//  }
//
//  .detail-text {
//    display: flex;
//    font-weight: bold;
//  }
//}
</style>
