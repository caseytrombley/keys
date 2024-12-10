<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Define the type for a single chord
interface Chord {
  id: string;
  key: string;
  name: string;
}

const chords = ref<Chord[]>([]);
const searchQuery = ref<string>(""); // The search query entered by the user

// Fetch chords from Firestore
const fetchChords = async () => {
  const querySnapshot = await getDocs(collection(db, "chords"));
  chords.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      key: data.key,
      name: data.name,
    } as Chord;
  });
};

// Filter chords based on the search query
const filteredChords = computed(() => {
  // If no search query, return all chords
  if (!searchQuery.value) return chords.value;

  // Otherwise, filter by key
  return chords.value.filter((chord) =>
    chord.key.toLowerCase().startsWith(searchQuery.value.toLowerCase())
  );
});

// Fetch chords when the component is mounted
onMounted(() => {
  fetchChords();
});

// Clear the search input
const clearSearch = () => {
  searchQuery.value = "";
};
</script>

<template>
  <div>
    <h1 class="d-none">Chords List</h1>

    <!-- Search Bar with Prefill and Clear Button -->
    <v-autocomplete
      v-model="searchQuery"
      :items="filteredChords"
      item-title="name"
      item-value="id"
      label="Search Chords"
      clearable
      append-icon="mdi-close-circle"
      @click:append="clearSearch"
      solo
      dense
      :search-input.sync="searchQuery"
      hide-no-data
    ></v-autocomplete>

    <!-- Loop through filteredChords and display results -->
    <div v-if="filteredChords.length">
      <v-row dense>
        <v-col
          v-for="chord in filteredChords"
          :key="chord.id"
          cols="auto"
        >
          <v-card
            :to="{ name: 'ChordDetail', params: { chordId: chord.id } }"
            router
            class="d-flex flex-column justify-center align-center hover-card"
            elevation="2"
          >
            <div class="chord-name">{{ chord.name }}</div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.chord-group {
  margin-bottom: 2rem;
}

.chord-name {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
}

.v-card {
  text-align: center;
  padding: 8px;
  width: 80px;
  height: 80px;
  transition: transform 0.2s, background-color 0.2s;
}

.v-card:hover {
  transform: scale(1.05);
}

.hover-card {
  cursor: pointer;
  text-decoration: none;
}
</style>
