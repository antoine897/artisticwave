import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to fetch all document IDs from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @returns {Array} - An array containing the IDs of all documents in the collection.
 */
const fetchDocumentsId = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    const documentIds = querySnapshot.docs.map(doc => doc.id);
    
    return documentIds;
  } catch (e) {
    console.error('Error fetching document IDs:', e);
    return [];
  }
};

export default fetchDocumentsId;
