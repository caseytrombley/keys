import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK with the service account key
import { fileURLToPath } from 'url'; // For using __dirname in ES modules
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually load the service account JSON
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-admin-key.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load the chord data file
const chordsAll = JSON.parse(fs.readFileSync('./chordsAll.json', 'utf8'));

// Function to calculate inversions for a chord
function getInversions(chordName, notes, midiKeys) {
  const inversions = [];
  const numNotes = notes.length;

  // Generate inversions by rotating the notes and corresponding midiKeys
  for (let i = 1; i < numNotes; i++) {
    const inversionNotes = [...notes.slice(i), ...notes.slice(0, i)];
    const inversionMidiKeys = [...midiKeys.slice(i), ...midiKeys.slice(0, i)];
    const inversionName = `${chordName}-inv${i}`;

    inversions.push({
      name: inversionName,
      notes: inversionNotes,
      midiKeys: inversionMidiKeys,
    });
  }

  return inversions;
}

// Import data function with inversions logic
const importData = async () => {
  for (const [docId, docData] of Object.entries(chordsAll)) {
    try {
      // Ensure `docId` is a valid document path
      const docRef = db.collection('chords').doc(docId);
      const chordTypes = Object.entries(docData); // Assuming you have chord types inside each chord document (like '5', '6', etc.)

      // Loop through the different chord types (5, 6, etc.)
      for (const [chordType, chordDetails] of chordTypes) {
        const { name, notes, midiKeys, intervals } = chordDetails;

        // Get the inversions for this chord
        const inversions = getInversions(name, notes, midiKeys);

        // Create the chord entry with inversions added as a field
        const chordEntry = {
          name,
          notes,
          midiKeys,
          intervals,
          inversions, // Add inversions directly as a field
        };

        // Set the chord entry in the parent collection (chords)
        await docRef.set({
          [chordType]: chordEntry, // Store each chord version under its respective chordType
        }, { merge: true }); // Merge ensures that existing data is not overwritten

        console.log(`Document for ${docId} -> ${chordType} created with inversions.`);
      }
    } catch (error) {
      console.error(`Error importing ${docId}: `, error);
    }
  }
};

// Start the import process
importData();
