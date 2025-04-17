import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { COLLECTIONS } from '../constants/collectionConst'
 

/**
 * Fetch clients with unpaid status from closed appointments.
 */
const fetchClientsWithUnpaidStatus = async () => {
  // Query to get all appointments where status is 'closed'
  const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
  const q = query(
    appointmentsRef,
    where('status', '==', 'closed')
  );

  const querySnapshot = await getDocs(q);
  const clientsData = {};

  // Loop through each appointment
  querySnapshot.forEach(doc => {
    const appointment = doc.data();
    const { clients, service } = appointment;

    // Loop through clients to check if any client has not paid
    clients.forEach(client => {
      if (!client.paid) {
        if (!clientsData[client.id]) {
          // Initialize the client data if not already added
          clientsData[client.id] = {
            firstName: client.firstName,
            lastName: client.lastName,
            phoneNumber: client.phoneNumber,
            mailAddress: client.mailAddress,
            totalOwed: 0,
            appointments: []
          };
        }

        // Add to the total owed by the client
        clientsData[client.id].totalOwed += client.ammountToPay;

        // Add the appointment details
        clientsData[client.id].appointments.push({
          serviceName: service?.serviceName || 'Unknown Service',
          dateFrom: appointment.dateFrom,
          dateTo: appointment.dateTo,
          amount: client.ammountToPay
        });
      }
    });
  });

  return Object.values(clientsData); // Return clients grouped with their unpaid status and amounts
};

export default fetchClientsWithUnpaidStatus;
