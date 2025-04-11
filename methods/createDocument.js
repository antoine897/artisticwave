import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
/**
 * Function to create a new document in a specified Firestore collection.
 * @param {Object} documentData - The data to be stored in the new document.
 * @param {string} collectionName - The name of the Firestore collection.
 */
const createDocument = async (documentData, collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);

    await addDoc(collectionRef, documentData);

  } catch (e) {
    throw new Error('Error adding document: ', e);
  }
};

export default createDocument;
