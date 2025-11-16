import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Toggles an item in an array.
 * If the item exists, it's removed. If it doesn't, it's added.
 * @param arr The array to modify.
 * @param item The item to toggle.
 * @returns A new array with the item toggled.
 */
export function toggleArrayItem<T>(arr: T[], item: T): T[] {
    const newArr = [...arr];
    const index = newArr.indexOf(item);

    if (index > -1) {
        newArr.splice(index, 1); // Remove item
    } else {
        newArr.push(item); // Add item
    }

    return newArr;
}
