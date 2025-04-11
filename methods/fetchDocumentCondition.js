import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to fetch a document from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} field - The name field used to find the document.
 * @param {string} value - The value of the field to match
 */
const fetchDocumentCondition = async (collectionName, field, value) => {
  try {
    const collectionRef = collection(db, collectionName);

    const q = query(collectionRef, where(field, '==', value));

    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return documents;
  } catch (e) {
    console.error('Error fetching documents with condition:', e);
    return [];
  }
};

export default fetchDocumentCondition;
