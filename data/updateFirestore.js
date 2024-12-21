import { db } from './firestore.js';
import fs from 'fs';

// Load the chord data file
const chordsAll = JSON.parse(fs.readFileSync('chordsOriginal.json', 'utf8'));

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

// Function to determine the chord type and generate a long name
function getChordTypeAndLongName(chordId, notes) {
  let type = 'major'; // Default type is major
  let longName = '';

  // Check for "mmaj" chords (minor with a major interval)
  if (chordId.startsWith('mmaj')) {
    type = 'minor';
    longName = `${notes[0]}mmaj${chordId.slice(4)}`; // Keep "mmaj" in the long name
  }
  // Check for "maj" chords (standard major chords)
  else if (chordId.startsWith('maj')) {
    type = 'major';
    longName = `${notes[0]}maj${chordId.slice(3)}`; // Keep "maj" in the long name
  }
  // Check for standard minor chords (e.g., "m11")
  else if (chordId.startsWith('m')) {
    type = 'minor';
    longName = `${notes[0]}${chordId}`; // No "maj" for standard minor chords
  }
  // Default for other major chords (e.g., "5", "6", "7")
  else {
    longName = `${notes[0]}maj${chordId}`;
  }

  return { type, longName };
}

// Main function to update Firestore data
const importData = async () => {
  for (const [docId, docData] of Object.entries(chordsAll)) {
    try {
      // Reference the chords collection
      const chordDocRef = db.collection('chords').doc(docId);

      // Loop through chord types (e.g., '5', '6', 'maj7')
      for (const [chordType, chordDetails] of Object.entries(docData)) {
        const { name, notes, midiKeys, intervals } = chordDetails;

        // Get the chord type (major or minor) and longname
        const { type, longName } = getChordTypeAndLongName(chordType, notes);

        // Update the `chords` collection to include type and longname
        const updatedChordData = { name, notes, midiKeys, intervals, type, longName };
        await chordDocRef.set({ [chordType]: updatedChordData }, { merge: true });

        console.log(`Updated ${docId}-${chordType} in chords collection.`);

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
