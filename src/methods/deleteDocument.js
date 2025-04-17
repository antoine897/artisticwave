import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to delete a document from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to be deleted.
 */
const deleteDocument = async (collectionName, documentId) => {
  try {
    // Create a reference to the document to be deleted
    const documentRef = doc(db, collectionName, documentId);

    // Delete the document
    await deleteDoc(documentRef);

  } catch (e) {
    console.error('Error deleting document: ', e);
  }
};

export default deleteDocument;
