import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';  // Ensure you import your Firestore instance

/**
 * Function to update a document in a specified collection in Firestore.
 * @param {string} collectionName - The name of the collection.
 * @param {Object} updateData - The data to update in the document.
 * @param {string} documentId - The document ID to update.
 */
const updateDocumentWithId = async (collectionName, updateData, documentId) => {
  try {
    // Create a reference to the document
    const docRef = doc(db, collectionName, documentId);

    // Update the document with the provided data
    await updateDoc(docRef, updateData);
  } catch (error) {
    throw new Error('Error updating document');
  }
};

export default updateDocumentWithId;
