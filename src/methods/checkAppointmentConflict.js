import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Function to check if the is a conflict for an apointement.
 */
const checkAppointmentConflict = async (collectionName, startDate, endDate) => { 
    const q = query(
        collection(db, collectionName),
        where("dateFrom", "<=", endDate.toISOString()),
        where("dateTo", ">=", startDate.toISOString())
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0;  
};

export default checkAppointmentConflict;
