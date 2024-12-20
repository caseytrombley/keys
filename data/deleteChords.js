import { db } from './firestore.js';

// Deletion Script: Remove all documents from the `chords` collection
const deleteCollection = async () => {
  const snapshot = await db.collection('chords').get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('Deleted entire chords collection.');
};

deleteCollection()
  .then(() => console.log('Deletion completed.'))
  .catch((error) => console.error('Error deleting collection:', error));
