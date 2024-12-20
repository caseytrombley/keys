import { db } from './firestore.js';

import fs from 'fs';
// Load the chord data file
const chordsAll = JSON.parse(fs.readFileSync('chordsAll.json', 'utf8'));

// Function to calculate inversions for a chord
function getInversions(chordName, notes, midiKeys, intervals) {
  const inversions = [];
  const numNotes = notes.length;

  // Generate inversions by rotating the notes, midiKeys, and intervals
  for (let i = 1; i < numNotes; i++) {
    const inversionNotes = [...notes.slice(i), ...notes.slice(0, i)];
    const inversionMidiKeys = [...midiKeys.slice(i), ...midiKeys.slice(0, i)];
    const inversionIntervals = [...intervals.slice(i), ...intervals.slice(0, i)];
    const inversionName = `${chordName}-inv${i}`;

    inversions.push({
      name: inversionName,
      notes: inversionNotes,
      midiKeys: inversionMidiKeys,
      intervals: inversionIntervals,
    });
  }

  return inversions;
}

// Main function to update Firestore data
const importData = async () => {
  for (const [docId, docData] of Object.entries(chordsAll)) {
    try {
      // Reference the chords collection
      const chordDocRef = db.collection('chords').doc(docId);

      // Loop through chord types (e.g., '5', '6')
      for (const [chordType, chordDetails] of Object.entries(docData)) {
        const { name, notes, midiKeys, intervals } = chordDetails;

        // Update the `chords` collection to remove inversions
        const updatedChordData = { name, notes, midiKeys, intervals };
        await chordDocRef.set({ [chordType]: updatedChordData }, { merge: true });

        console.log(`Updated ${docId}-${chordType} in chords collection to remove inversions.`);

        // Calculate new inversions
        const newInversions = getInversions(name, notes, midiKeys, intervals);

        // Write the inversions to the `inversions` collection
        const inversionsDocRef = db.collection('inversions').doc(`${docId}-${chordType}`);
        await inversionsDocRef.set({ inversions: newInversions });

        console.log(`Added inversions for ${docId}-${chordType} to inversions collection.`);
      }
    } catch (error) {
      console.error(`Error processing ${docId}-${chordType}:`, error);
    }
  }
};

// Start the import process
importData();
