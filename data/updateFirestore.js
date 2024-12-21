import { db } from './firestore.js';
import fs from 'fs';

// Load the chord data file
const chordsAll = JSON.parse(fs.readFileSync('chordsAll.json', 'utf8'));

// Define the standard piano key order
const pianoOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Main function to reorder and update Firestore data
const reorderAndUpdateFirestore = async () => {
  try {
    // Sort the chord data keys based on the piano order
    const sortedKeys = Object.keys(chordsAll).sort((a, b) => {
      return pianoOrder.indexOf(a) - pianoOrder.indexOf(b);
    });

    // Rebuild the collection in the correct order
    for (const key of sortedKeys) {
      const chordData = chordsAll[key];
      const chordDocRef = db.collection('chords').doc(key);

      // Update Firestore with the sorted data
      await chordDocRef.set(chordData);
      console.log(`Updated chord data for ${key}.`);
    }

    console.log('Reordering completed successfully.');
  } catch (error) {
    console.error('Error reordering Firestore data:', error);
  }
};

// Start the reordering process
reorderAndUpdateFirestore();
