import { db } from './firestore.js';

// Function to delete all documents in a collection
const deleteCollection = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted entire ${collectionName} collection.`);
};

// Deleting both the `chords` and `inversions` collections
const deleteBothCollections = async () => {
  try {
    await deleteCollection('chords');
    await deleteCollection('inversions');
    console.log('Deletion of both collections completed.');
  } catch (error) {
    console.error('Error deleting collections:', error);
  }
};

deleteBothCollections();
