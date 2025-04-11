import {collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
/**
 * Function to delete a document from a specified Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} field - The name field used to find the document.
 * @param {string} value - The value of the field to match
 */
const deleteDocumentCondition = async (collectionName, field, value) => {
  const collectionRef = collection(db, collectionName);

  try {
    // Create a query to fetch documents where `field` equals `value`
    const q = query(collectionRef, where(field, '==', value));
    const querySnapshot = await getDocs(q);

    // Iterate through the documents and delete them
    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, collectionName, docSnapshot.id))
    );

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

  } catch (error) {
    throw new Error('Error deleting documents with the specified condition');
  }
};

export default deleteDocumentCondition;
