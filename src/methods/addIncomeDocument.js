import { addDoc, collection, serverTimestamp, getFirestore } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collectionConst';

const addIncomeDocument = async ({ appointmentId, client, service }) => {
  const db = getFirestore(); // No external db import

  const doc = {
    appointmentId,
    clientName: `${client.firstName} ${client.lastName}`,
    clientPhone: client.phoneNumber,
    amount: client.ammountToPay,
    serviceName: service?.serviceName || '',
    date: serverTimestamp(),
    type: 'income',
  };

  try {
    await addDoc(collection(db, COLLECTIONS.FINANCIAL_STATUS), doc);
  } catch (err) {
    console.error('Error adding income document:', err);
    throw err;
  }
};

export default addIncomeDocument;
