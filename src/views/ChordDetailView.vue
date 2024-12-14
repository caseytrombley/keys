<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Piano from "../components/Piano.vue";
import { collection, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Define a type for the chord data
interface ChordDetail {
  name: string;
  notes: string[];
  intervals: string[];
  midiKeys: number[];
  inversions?: {
    name: string;
    notes: string[];
  }[];
}

const route = useRoute();
const key = route.params.key as string; // Top-level key (e.g., "C")
const chordId = route.params.id as string; // Chord ID (e.g., "5")

// Create a ref to store the chord data
const chordData = ref<ChordDetail | null>(null);

// Create a ref to the Piano component
const piano = ref(null);

// Create a ref to track the "Play Sample" button state (disabled/enabled)
const isPlaying = ref(false);

// Method to trigger the playSample method in the Piano component
const playSample = () => {
  if (piano.value) {
    isPlaying.value = true; // Disable the button when the sample starts playing
    piano.value.playSample(); // Call the playSample method in Piano
  }
};

// Fetch chord details from Firestore based on the route parameters (key and chordId)
const fetchChord = async () => {
  const docRef = doc(db, "chords", key); // Fetch the document for the key (e.g., "C")
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const keyData = docSnap.data() as Record<string, ChordDetail>;
    const chord = keyData[chordId]; // Access the specific chord by ID
    if (chord) {
      chordData.value = chord;
    } else {
      console.error("Chord not found in the specified key");
    }
  } else {
    console.error("Key not found in Firestore");
  }
};

// Fetch the chord details when the component is mounted
onMounted(() => {
  fetchChord();
});

// Method to handle when the sample finishes playing
const onSampleFinish = () => {
  isPlaying.value = false; // Re-enable the button once the sample is finished
};
</script>

<template>
  <div>
    <!-- Display chord name and notes -->
    <h1>{{ chordData?.name }}</h1>
    <p>Notes: {{ chordData?.notes.join(", ") }}</p>
    <p>Intervals: {{ chordData?.intervals.join(", ") }}</p>

    <!-- Button to play the sample -->
    <v-btn
      variant="flat"
      color="primary"
      @click="playSample"
      :disabled="isPlaying"
    >
      Play Sample
    </v-btn>

    <!-- Piano component for the main chord -->
    <Piano
      v-if="chordData"
      ref="piano"
      :notes="chordData?.notes || []"
      @finish="onSampleFinish"
    />

    <!-- Display inversions, if available -->
    <div v-if="chordData?.inversions && chordData.inversions.length">
      <h2>Inversions</h2>
      <div
        v-for="(inversion, index) in chordData.inversions"
        :key="index"
        class="inversion"
      >
        <h3>{{ inversion.name }}</h3>
        <p>Notes: {{ inversion.notes.join(", ") }}</p>
        <Piano :notes="inversion.notes" />
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Your styles here */
</style>
