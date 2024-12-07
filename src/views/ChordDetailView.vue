<template>
  <div>
    <h1>{{ chord?.name }}</h1>
    <p><strong>Full Name:</strong> {{ chord?.fullName }}</p>
    <p><strong>AKA:</strong> {{ chord?.aka }}</p>
    <p><strong>Notes:</strong> {{ chord?.notes.join(', ') }}</p>
    <p><strong>Interval Structure:</strong> {{ chord?.intervalStructure.join(', ') }}</p>
    <Piano :highlightedKeys="chord?.notes" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Piano from "../components/Piano.vue";

 // Your Firestore setup file

const route = useRoute();
const chordId = route.params.chordId as string;
const chord = ref(null);

onMounted(async () => {
  const docRef = doc(db, 'chords', chordId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    chord.value = docSnap.data();
  } else {
    console.error('Chord not found!');
  }
});
</script>
