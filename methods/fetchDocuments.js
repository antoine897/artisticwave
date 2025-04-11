import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to fetch all documents from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 */
const fetchDocuments = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return documents;
  } catch (e) {
    console.error('Error fetching documents:', e);
    return [];
  }
};

export default fetchDocuments;
