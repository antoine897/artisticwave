import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to create or update a document in a specified Firestore collection with a custom document ID.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} documentData - The data to be stored in the document.
 * @param {string} documentId - The custom document ID (e.g., user UID).
 */
const createDocumentWithId = async (collectionName, documentData, documentId) => {
  try {
    // Reference to the document with the custom documentId
    const docRef = doc(db, collectionName, documentId);

    // Set the document data (this will overwrite if the document already exists)
    await setDoc(docRef, documentData);
  } catch (e) {
    throw new Error('Error adding document with custom ID: ', e);
  }
};

export default createDocumentWithId;
