
export type Amenity = 
  | 'wifi' 
  | 'parking' 
  | 'restaurant'
  | 'unifi'
  | 'breakfast'
  | 'bathtub'
  | 'fitness'
  | 'laundry'
  | 'karaoke'
  | 'massage';

export const amenityOptions: { id: Amenity; label: string }[] = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'unifi', label: 'Юнивишн' },
    { id: 'breakfast', label: 'Өглөөний цай' },
    { id: 'bathtub', label: 'Ванн' },
    { id: 'parking', label: 'Машины зогсоол' },
    { id: 'restaurant', label: 'Ресторан' },
    { id: 'fitness', label: 'Фитнесс' },
    { id: 'laundry', label: 'Угаалга' },
    { id: 'karaoke', label: 'Караоке' },
    { id: 'massage', label: 'Массаж' },
];

export type SortOption = 'distance' | 'price' | 'likes';
export const locations = ['Хотын төв', 'Зайсан', 'Яармаг', 'Сансар', '1-р хороолол', 'Хороолол'] as const;
export type Location = typeof locations[number];

export type RoomStatus = 'available' | 'booked' | 'maintenance' | 'closed' | 'occupied';

// Represents a template for a room type, stored in 'room_types' collection
export type Room = {
  id: string; 
  roomName: string;
  hotelName: string;
  price: number;
  originalPrice?: number;
  amenities: Amenity[];
  imageIds: string[];
  location: Location;
  detailedAddress?: string;
  latitude?: number;
  longitude?: number;
  ownerId: string; // user.uid of the hotel owner
  phoneNumber: string;
  totalQuantity: number;
  rating: number; 
  distance: number;
  likes: number;
};

// Represents an individual, physical room, stored in 'room_instances' collection
export type RoomInstance = {
    instanceId: string;
    roomTypeId: string; // Foreign key to Room (the template)
    roomNumber: string; // e.g., "101", "205A"
    status: RoomStatus; // Base status for TODAY. Future dates default to this.
    bookingCode?: string; // 4-digit code if booked for TODAY
    ownerId: string; // user.uid of the hotel owner
    // Date-specific overrides. Key is ISO date string (YYYY-MM-DD)
    overrides: { 
        [date: string]: {
            status?: RoomStatus;
            bookingCode?: string;
            price?: number; // Price for this specific day
        }
    };
};
