import { defineStore } from "pinia";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

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
          this.chords[key] = Object.entries(docSnap.data()).map(([id, chord]: any) => ({
            id,
            ...chord,
          }));
        }
      }
    },

    // Fetch inversions for a specific chord by using the chord's name (like "A-6")
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

    async fetchAllChords() {
      if (!this.allKeysLoaded) {
        const querySnapshot = await getDocs(collection(db, "chords"));
        const allChords: Record<string, any[]> = {};
        querySnapshot.forEach((doc) => {
          const key = doc.id;
          const data = doc.data();
          allChords[key] = Object.entries(data).map(([id, chord]: any) => ({
            id,
            ...chord,
          }));
        });
        this.chords = allChords;
        this.allKeysLoaded = true;
      }
    },
  },
});
