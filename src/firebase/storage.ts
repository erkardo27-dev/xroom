"use client";

import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export const uploadHotelImage = async (storage: FirebaseStorage | null, file: File, userId: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage is not initialized.");
    if (!userId) throw new Error("User is not authenticated.");

    const ext = file.name.split('.').pop();
    const name = `${uuidv4()}.${ext}`;
    const filePath = `hotel-images/${userId}/${name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

export const deleteHotelImage = async (storage: FirebaseStorage | null, imageUrl: string): Promise<void> => {
    if (!storage) throw new Error("Firebase Storage is not initialized.");
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
};