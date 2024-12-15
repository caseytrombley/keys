<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import KeyNav from "../components/KeyNav.vue";
import PageHeader from "../components/PageHeader.vue";

// Define types
interface ChordDetail {
  id: string;
  name: string;
  notes: string[];
  intervals: string[];
  midiKeys: number[];
}

const route = useRoute();
const router = useRouter();
const selectedKey = route.params.key as string; // Key passed via the route
const chords = ref<ChordDetail[]>([]); // Store the chords for the selected key

// Fetch chords from Firestore for the selected key
const fetchChordsForKey = async () => {
  const docRef = doc(db, "chords", selectedKey);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const chordsData = docSnap.data();
    chords.value = Object.entries(chordsData).map(([id, chord]: any) => ({
      id,
      ...chord,
    }));
  } else {
    console.error("No chords found for key:", selectedKey);
  }
};

onMounted(() => {
  fetchChordsForKey();
});
</script>

<template>
  <KeyNav :activeKey="selectedKey" />
  <PageHeader pre="Chords in the key of" :title="selectedKey" />

  <v-container max-width="1200px" fluid>
    <v-row dense>
      <v-col
        v-for="chord in chords"
        :key="chord.id"
        cols="auto"
      >
        <v-card
          :to="`/chords/piano/${encodeURIComponent(selectedKey)}/${encodeURIComponent(chord.id)}`"
          router
          class="d-flex flex-column justify-center align-center hover-card"
          elevation="2"
        >
          <div class="chord-name">{{ chord.name }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
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
