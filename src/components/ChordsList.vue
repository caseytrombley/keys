<script setup lang="ts">
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust the path based on your directory structure

// Define the type for a single chord
interface Chord {
  id: string;
  name: string;
  description: string;
}

// Create a ref to store chords
const chords = ref<Chord[]>([]);

// Fetch chords from Firestore
const fetchChords = async () => {
  const querySnapshot = await getDocs(collection(db, "chords"));

  // Map documents to Chord type
  chords.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description || 'No description available',
    } as Chord;
  });
};

// Fetch chords when the component is mounted
onMounted(() => {
  fetchChords();
});
</script>

<template>
  <div>
    <h1>Chords List</h1>
    <ul>
      <li v-for="chord in chords" :key="chord.id">
        <!-- Using router-link to go to the ChordDetail page with the chordId -->
        <router-link :to="{ name: 'ChordDetail', params: { chordId: chord.id } }">
          <strong>{{ chord.name }}</strong>: {{ chord.description }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chords-list {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.error {
  color: red;
  text-align: center;
}
</style>
