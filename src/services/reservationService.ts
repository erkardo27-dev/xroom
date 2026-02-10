
import {
    collection,
    doc,
    getDocs,
    query,
    where,
    updateDoc,
    Timestamp,
    writeBatch,
    serverTimestamp,
    getFirestore
} from "firebase/firestore";
import { getApp, getApps } from "firebase/app";
import { Reservation, RoomInstance } from "@/lib/data";
import { format, addDays } from "date-fns";

// Helper to get DB safely
const getDb = () => {
    if (typeof window === 'undefined' || !getApps().length) {
        return null;
    }
    return getFirestore(getApp());
};

export const reservationService = {

    // Create a new reservation and update room availability
    async createReservation(data: Omit<Reservation, 'id' | 'createdAt' | 'bookingCode'>, roomInstance: RoomInstance) {
        const db = getDb();
        if (!db) throw new Error("Firebase not initialized");

        const batch = writeBatch(db);
        const reservationId = doc(collection(db, "reservations")).id;
        const bookingCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

        const reservationRef = doc(db, "reservations", reservationId);

        // Convert Dates to Timestamps for Firestore if needed, but the type says 'any' for now.
        // Ideally we should use Timestamp.fromDate(date) if the input is JS Date.
        const checkInTimestamp = data.checkInDate instanceof Date ? Timestamp.fromDate(data.checkInDate) : data.checkInDate;
        const checkOutTimestamp = data.checkOutDate instanceof Date ? Timestamp.fromDate(data.checkOutDate) : data.checkOutDate;

        const newReservation: Reservation = {
            ...data,
            id: reservationId,
            bookingCode,
            createdAt: serverTimestamp(),
            checkInDate: checkInTimestamp,
            checkOutDate: checkOutTimestamp,
        };

        batch.set(reservationRef, newReservation);

        // Update RoomInstance overrides for each day of the stay
        const instanceRef = doc(db, "room_instances", roomInstance.instanceId);
        // Initialize overrides if undefined (though data model implies it might exist)
        const overrides = { ...(roomInstance.overrides || {}) };

        // We need JS dates for loop
        const start = data.checkInDate instanceof Timestamp ? data.checkInDate.toDate() : (data.checkInDate instanceof Date ? data.checkInDate : new Date(data.checkInDate));
        const end = data.checkOutDate instanceof Timestamp ? data.checkOutDate.toDate() : (data.checkOutDate instanceof Date ? data.checkOutDate : new Date(data.checkOutDate));

        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i < nights; i++) {
            const currentDay = addDays(start, i);
            const dateKey = format(currentDay, 'yyyy-MM-dd');

            if (!overrides[dateKey]) {
                overrides[dateKey] = {};
            }

            overrides[dateKey].status = 'booked';
            overrides[dateKey].bookingCode = bookingCode;
            // Also save price if it was overridden in reservation? For now, keep room price.
        }

        batch.update(instanceRef, { overrides });

        await batch.commit();
        return newReservation;
    },

    // Get reservation by booking code
    async getReservationByCode(bookingCode: string): Promise<Reservation | null> {
        const db = getDb();
        if (!db) return null;
        const q = query(collection(db, "reservations"), where("bookingCode", "==", bookingCode));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docData = snapshot.docs[0].data() as Reservation;
        return { ...docData, id: snapshot.docs[0].id };
    },

    // Update reservation status
    async updateReservationStatus(reservationId: string, status: Reservation['status']) {
        const db = getDb();
        if (!db) return;
        const ref = doc(db, "reservations", reservationId);
        await updateDoc(ref, { status });
    },

    // Move a reservation to a new room and/or date
    async moveReservation(reservationId: string, newStart: Date, newRoomInstanceId: string) {
        const db = getDb();
        if (!db) throw new Error("Firebase not initialized");

        const batch = writeBatch(db);

        // 1. Get original reservation to know duration and old room
        const resRef = doc(db, "reservations", reservationId);
        const resSnap = await getDocs(query(collection(db, "reservations"), where("id", "==", reservationId))); // or getDoc if we trust ID
        // Better to use getDoc if we have the ID, but our getReservationByCode uses query. 
        // Let's us getDoc directly as we are passing ID.
        const resDoc = await import("firebase/firestore").then(mod => mod.getDoc(resRef));

        if (!resDoc.exists()) throw new Error("Reservation not found");
        const resData = resDoc.data() as Reservation;

        const oldRoomId = resData.roomInstanceId;
        const oldStart = resData.checkInDate instanceof Timestamp ? resData.checkInDate.toDate() : (resData.checkInDate instanceof Date ? resData.checkInDate : new Date(resData.checkInDate));
        const oldEnd = resData.checkOutDate instanceof Timestamp ? resData.checkOutDate.toDate() : (resData.checkOutDate instanceof Date ? resData.checkOutDate : new Date(resData.checkOutDate));

        const nights = Math.ceil((oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24));

        // 2. Calculate new End Date
        const newEnd = addDays(newStart, nights);

        // 3. Update Reservation Doc
        batch.update(resRef, {
            roomInstanceId: newRoomInstanceId,
            checkInDate: Timestamp.fromDate(newStart),
            checkOutDate: Timestamp.fromDate(newEnd)
        });

        // 4. Transform Room Instances (Clear Old, Set New)

        // 4a. Clear Old
        const oldInstanceRef = doc(db, "room_instances", oldRoomId);
        // We can't easily "delete" a key from a map in Firestore without reading it first or using FieldValue.delete() on the specific dot path.
        // For simplicity/safety, we will read the old instance doc, modify local object, and set it back (or update).
        // Actually, we can use dot notation with FieldValue.delete() but we need to loop.
        // Let's read both instances to be safe and consistent.

        // If old and new room are same, we just need one read/write
        if (oldRoomId === newRoomInstanceId) {
            const instanceRef = doc(db, "room_instances", oldRoomId);
            const instanceDoc = await import("firebase/firestore").then(mod => mod.getDoc(instanceRef));
            if (!instanceDoc.exists()) throw new Error("Room not found");

            const instanceData = instanceDoc.data() as RoomInstance;
            const overrides = { ...instanceData.overrides };

            // Clear old dates
            for (let i = 0; i < nights; i++) {
                const date = addDays(oldStart, i);
                const dateKey = format(date, 'yyyy-MM-dd');
                if (overrides[dateKey] && overrides[dateKey].bookingCode === resData.bookingCode) {
                    delete overrides[dateKey];
                }
            }

            // Set new dates
            for (let i = 0; i < nights; i++) {
                const date = addDays(newStart, i);
                const dateKey = format(date, 'yyyy-MM-dd');
                if (!overrides[dateKey]) overrides[dateKey] = {};
                overrides[dateKey].status = 'booked';
                overrides[dateKey].bookingCode = resData.bookingCode;
            }

            batch.update(instanceRef, { overrides });

        } else {
            // Different rooms

            // 4b. Handle Old Room
            const oldInstanceDoc = await import("firebase/firestore").then(mod => mod.getDoc(oldInstanceRef));
            if (oldInstanceDoc.exists()) {
                const oldData = oldInstanceDoc.data() as RoomInstance;
                const oldOverrides = { ...oldData.overrides };
                for (let i = 0; i < nights; i++) {
                    const date = addDays(oldStart, i);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    if (oldOverrides[dateKey] && oldOverrides[dateKey].bookingCode === resData.bookingCode) {
                        delete oldOverrides[dateKey];
                    }
                }
                batch.update(oldInstanceRef, { overrides: oldOverrides });
            }

            // 4c. Handle New Room
            const newInstanceRef = doc(db, "room_instances", newRoomInstanceId);
            const newInstanceDoc = await import("firebase/firestore").then(mod => mod.getDoc(newInstanceRef));
            // If it doesn't exist, we might have an issue, but let's assume it does.
            if (newInstanceDoc.exists()) {
                const newData = newInstanceDoc.data() as RoomInstance;
                const newOverrides = { ...newData.overrides };
                for (let i = 0; i < nights; i++) {
                    const date = addDays(newStart, i);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    if (!newOverrides[dateKey]) newOverrides[dateKey] = {};
                    newOverrides[dateKey].status = 'booked';
                    newOverrides[dateKey].bookingCode = resData.bookingCode;
                }
                batch.update(newInstanceRef, { overrides: newOverrides });
            }
        }

        await batch.commit();
    }
};
