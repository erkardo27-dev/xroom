'use client';

import { doc, setDoc, deleteDoc, serverTimestamp, Firestore, DocumentReference, SetOptions } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A non-blocking wrapper for Firestore's setDoc function.
 * It initiates the write operation but does not wait for it to complete on the server.
 * Instead, it immediately returns and handles potential permission errors in the background
 * by emitting a custom event.
 *
 * This is crucial for maintaining a responsive UI, especially with optimistic updates.
 *
 * @param docRef The DocumentReference of the document to write to.
 * @param data The data to be written.
 * @param options SetOptions for the write operation (e.g., { merge: true }).
 */
export function setDocumentNonBlocking<T>(
  docRef: DocumentReference<T>,
  data: any,
  options?: SetOptions
): void {
  const operation = options && 'merge' in options ? 'update' : 'create';
  
  // Create the data payload for the request.
  const requestData = {
    ...data,
    // Add a server-side timestamp for when the document was last updated.
    // This is good practice for auditing and data management.
    updatedAt: serverTimestamp(),
  };

  // Call setDoc without 'await'. The promise is handled by the .catch() block.
  setDoc(docRef, requestData, options || {})
    .catch(async (serverError) => {
      // If a permission error (or any other error) occurs, create a detailed error object.
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data, // Use original data for the error context
      });

      // Emit the error globally so it can be caught by a listener (e.g., FirebaseErrorListener).
      // This decouples error handling from the component that initiated the write.
      errorEmitter.emit('permission-error', permissionError);
    });
}


/**
 * A non-blocking wrapper for Firestore's deleteDoc function.
 * It handles permission errors in the background by emitting a custom event.
 *
 * @param docRef The DocumentReference of the document to delete.
 */
export function deleteDocumentNonBlocking<T>(docRef: DocumentReference<T>): void {
  // Call deleteDoc without 'await'.
  deleteDoc(docRef)
    .catch(async (serverError) => {
      // Create a detailed error object for the failed delete operation.
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });

      // Emit the error for a global listener to handle.
      errorEmitter.emit('permission-error', permissionError);
    });
}