<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Piano from "../components/Piano.vue";
import { collection, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust path if necessary

// Define a type for the chord data
interface ChordData {
  name: string;
  fullName: string;
  notes: string[];
}

const route = useRoute();
const chordId = route.params.chordId as string;

// Create a ref to store the chord data
const chordData = ref<ChordData | null>(null);
// Create a ref to the Piano component
const piano = ref(null);

// Method to trigger the playSample method in the Piano component
const playSample = () => {
  if (piano.value) {
    piano.value.playSample(); // Call the playSample method in Piano
  }
};

// Fetch chord details from Firestore based on the route parameter (chordId)
const fetchChord = async () => {
  const docRef = doc(db, "chords", chordId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    chordData.value = docSnap.data() as ChordData;
  } else {
    console.error("Chord not found");
  }
};

// Fetch the chord details when the component is mounted
onMounted(() => {
  fetchChord();
});
</script>

<template>
  <div>
    <h1>{{ chordData?.name }} - {{ chordData?.fullName }}</h1>
    <p>Notes: {{ chordData?.notes.join(", ") }}</p>

    <v-btn
      variant="flat"
      color="primary"
      @click="playSample"
    >
      Play Sample
    </v-btn>

    <!-- Pass notes prop to Piano component -->
    <Piano ref="piano" :notes="chordData?.notes || []" />
  </div>
</template>

<style scoped>
/* Your styles here */
</style>
