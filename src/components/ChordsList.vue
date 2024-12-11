<script setup lang="ts">
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";

import { db } from "../firebase/firebase";

// Define the chord type
interface Chord {
  id: string;
  key: string;
  name: string;
  abbreviations: string[];
}

const chords = ref<Chord[]>([]);

// Fetch the chords data from Firestore
const fetchChords = async () => {
  const querySnapshot = await getDocs(collection(db, "chords"));
  chords.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      key: data.key,
      name: data.name,
      abbreviations: data.abbreviations || [],
    } as Chord;
  });
};

// Fetch the chords when the component is mounted
onMounted(() => {
  fetchChords();
});


</script>

<template>
  <div>
    <v-autocomplete

    ></v-autocomplete>



    <div v-if="chords.length">
      <v-row dense>
        <v-col
          v-for="chord in chords"
          :key="chord.id"
          cols="auto"
        >
          <v-card
            :to="`/chords/piano/${chord.id}`"
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
