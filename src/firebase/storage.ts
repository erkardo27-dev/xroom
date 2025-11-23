'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a hotel image to Firebase Storage.
 * @param storage The Firebase Storage instance.
 * @param file The image file to upload.
 * @param userId The UID of the user uploading the file.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadHotelImage = async (storage: FirebaseStorage, file: File, userId: string): Promise<string> => {
    if (!userId) {
        throw new Error("User is not authenticated.");
    }
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `hotel-images/${userId}/${fileName}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
};

/**
 * Deletes a hotel image from Firebase Storage using its URL.
 * @param storage The Firebase Storage instance.
 * @param imageUrl The public URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteHotelImage = async (storage: FirebaseStorage, imageUrl: string): Promise<void> => {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
};
