import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityType = 'price_change' | 'booking_created' | 'autopilot_applied' | 'login' | 'settings_updated';

export async function logActivity(
    userId: string,
    type: ActivityType,
    details: string,
    metadata?: any
) {
    const db = getFirestore();
    const logRef = collection(db, 'activity_log');

    try {
        await addDoc(logRef, {
            userId,
            type,
            details,
            metadata: metadata || {},
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}
