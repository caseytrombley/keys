import { defineStore } from "pinia";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chordOrder } from "../utils/chordSorting";

export const useChordsStore = defineStore("chords", {
  state: () => ({
    chords: {} as Record<string, any[]>, // Stores chords grouped by keys
    inversions: {} as Record<string, any>, // Store inversions separately
    allKeysLoaded: false, // Tracks if all keys have been loaded
  }),
  actions: {
    async fetchChordsForKey(key: string) {
      if (!this.chords[key]) {
        const docRef = doc(db, "chords", key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Fetch and sort chords based on chordOrder
          this.chords[key] = Object.entries(docSnap.data())
            .map(([id, chord]: any) => ({
              id,
              ...chord,
            }))
            .filter((chord) => chordOrder.includes(chord.id)) // Filter by chordOrder
            .sort((a, b) => chordOrder.indexOf(a.id) - chordOrder.indexOf(b.id)); // Sort by chordOrder
        }
      }
    },

    async fetchInversionsForChord(chordName: string) {
      if (!this.inversions[chordName]) {
        const docRef = doc(db, "inversions", chordName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.inversions[chordName] = docSnap.data();
        } else {
          console.error(`No inversions found for chord: ${chordName}`);
        }
      }
    },

    async fetchAllChords(force = false) {
      if (!this.allKeysLoaded || force) {
        console.log('Fetching all chords from Firebase...');
        const querySnapshot = await getDocs(collection(db, "chords"));
        const allChords: Record<string, any[]> = {};
        const pianoOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

        querySnapshot.forEach((doc) => {
          const key = doc.id;
          const data = doc.data();

          // Fetch and sort chords for each key
          allChords[key] = Object.entries(data)
            .map(([id, chord]: any) => ({
              id,
              ...chord,
            }))
            .filter((chord) => chordOrder.includes(chord.id)) // Filter by chordOrder
            .sort((a, b) => chordOrder.indexOf(a.id) - chordOrder.indexOf(b.id)); // Sort by chordOrder
        });

        console.log('Fetched keys from Firebase:', Object.keys(allChords));

        // Sort the keys based on piano order
        const sortedKeys = Object.keys(allChords).sort((a, b) => {
          return pianoOrder.indexOf(a) - pianoOrder.indexOf(b);
        });

        // Rebuild the chords object in the sorted order
        const sortedChords: Record<string, any[]> = {};
        for (const key of sortedKeys) {
          sortedChords[key] = allChords[key];
        }

        this.chords = sortedChords;
        this.allKeysLoaded = true;
        console.log('All chords loaded. Total keys:', Object.keys(this.chords).length);
      }
    },
  },
});
