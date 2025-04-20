import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to get a document from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to fetch.
 * @returns {object} - The document data.
 */
const fetchDocumentWithId = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn('No such document!');
      return null;
    }
  } catch (e) {
    throw Error('Error getting document: ', e);
  }
};

export default fetchDocumentWithId;
