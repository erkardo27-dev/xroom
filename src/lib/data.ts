import { PlaceHolderImages } from './placeholder-images';

export type Amenity = 'wifi' | 'parking' | 'restaurant';
export type SortOption = 'distance' | 'price' | 'rating';
export const locations = ['Хотын төв', 'Зайсан', 'Яармаг', 'Сансар', '1-р хороолол', 'Хороолол'] as const;
export type Location = typeof locations[number];

export type RoomStatus = 'available' | 'booked' | 'maintenance' | 'closed' | 'occupied';

// Represents a template for a room type
export type Room = {
  id: string; // This will now be room TYPE id
  roomName: string;
  hotelName: string;
  price: number;
  originalPrice?: number;
  amenities: Amenity[];
  imageIds: string[];
  location: Location;
  ownerId: string;
  totalQuantity: number;
  rating: number; 
  distance: number;
};

// Represents an individual, physical room
export type RoomInstance = {
    instanceId: string; // Unique ID for each physical room, e.g., 'room-101-1'
    roomTypeId: string; // Foreign key to Room (the template)
    roomNumber: string; // e.g., "101", "205A"
    status: RoomStatus; // Base status for TODAY. Future dates default to this.
    bookingCode?: string; // 4-digit code if booked for TODAY
    ownerId: string;
    // Date-specific overrides. Key is ISO date string (YYYY-MM-DD)
    overrides: { 
        [date: string]: {
            status: RoomStatus;
            bookingCode?: string;
        }
    };
};


const initialRoomTypesData: Omit<Room, 'distance' | 'rating' | 'totalQuantity' | 'ownerId'>[] = [
    {
      id: 'room-type-1',
      roomName: 'Стандарт Кинг Өрөө',
      hotelName: 'Их Оазис',
      price: 400000,
      originalPrice: 610000,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageIds: ['hotel-1', 'hotel-7', 'hotel-8'],
      location: 'Хотын төв',
    },
    {
      id: 'room-type-2',
      roomName: 'Делюкс Люкс',
      hotelName: 'Хотын Төв',
      price: 320000,
      amenities: ['wifi', 'restaurant'],
      imageIds: ['hotel-2', 'hotel-9', 'hotel-1'],
      location: 'Хотын төв',
    },
    {
      id: 'room-type-3',
      roomName: 'Голын Харагдацтай Давхар Ор',
      hotelName: 'Голын Эрэг Амралт',
      price: 510000,
      originalPrice: 680000,
      amenities: ['wifi', 'parking'],
      imageIds: ['hotel-3', 'hotel-10', 'hotel-2'],
      location: 'Зайсан',
    },
];

export const initialRooms: Room[] = initialRoomTypesData.map(rt => ({
    ...rt,
    ownerId: "owner@example.com", // Assign a default owner for initial data
    distance: +(Math.random() * 10 + 0.5).toFixed(1),
    rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
    totalQuantity: Math.floor(Math.random() * 5) + 2, // 2 to 6 rooms
}));

export const initialRoomInstances: RoomInstance[] = initialRooms.flatMap(roomType => {
    return Array.from({ length: roomType.totalQuantity }).map((_, i) => ({
        instanceId: `${roomType.id}-instance-${i + 1}`,
        roomTypeId: roomType.id,
        roomNumber: `${Math.floor(Math.random() * 4) + 1}0${i + 1}`, // e.g., 101, 202...
        status: 'available',
        ownerId: roomType.ownerId,
        overrides: {}
    }));
});


export type NewRoom = Omit<Room, 'id' | 'rating' | 'distance' | 'availableQuantity'>
