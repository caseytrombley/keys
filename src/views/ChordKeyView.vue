<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import KeyNav from "../components/KeyNav.vue";
import PageHeader from "../components/PageHeader.vue";
import ChordList from "../components/ChordList.vue";

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
  <ChordList
    :chords="chords"
    :baseKey="selectedKey"
  />
</template>

<style scoped>
</style>
