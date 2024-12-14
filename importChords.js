import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK with the service account key
import { fileURLToPath } from 'url'; // For using __dirname in ES modules
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually load the service account JSON since it's not an ES module
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-admin-key.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load the JSON data file (make sure it's correctly formatted)
const chordsAll = JSON.parse(fs.readFileSync('./chordsAll.json', 'utf8'));

// Import data function
const importData = async () => {
  for (const [docId, docData] of Object.entries(chordsAll)) {
    try {
      // Ensure `docId` is a valid document path
      // We're assuming docId in the `chordsAll.json` file is the correct document name (e.g., "C-Major", "D-Minor")
      const docRef = db.collection('chords').doc(docId);

      // Set document data
      await docRef.set(docData);

      console.log(`Document ${docId} imported successfully`);
    } catch (error) {
      console.error(`Error importing ${docId}: `, error);
    }
  }
};

// Start the import process
importData();
