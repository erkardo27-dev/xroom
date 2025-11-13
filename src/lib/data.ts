import { PlaceHolderImages } from './placeholder-images';

export type Amenity = 'wifi' | 'parking' | 'restaurant';
export type SortOption = 'distance' | 'price' | 'rating';

export type Room = {
  id: string;
  roomName: string;
  hotelName: string;
  price: number;
  originalPrice?: number;
  rating: number; // in km
  distance: number;
  amenities: Amenity[];
  imageId: string;
};

const roomsData: Omit<Room, 'distance'>[] = [
    {
      id: 'room-101',
      roomName: 'Standard King Room',
      hotelName: 'The Grand Oasis',
      price: 120,
      originalPrice: 180,
      rating: 4.5,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-1',
    },
    {
      id: 'room-102',
      roomName: 'Deluxe Suite',
      hotelName: 'Cityscape Central',
      price: 95,
      rating: 4.2,
      amenities: ['wifi', 'restaurant'],
      imageId: 'hotel-2',
    },
    {
      id: 'room-103',
      roomName: 'River View Double',
      hotelName: 'Riverside Retreat',
      price: 150,
      originalPrice: 200,
      rating: 4.8,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-3',
    },
    {
      id: 'room-104',
      roomName: 'Compact Single',
      hotelName: 'The Minimalist Inn',
      price: 75,
      rating: 3.9,
      amenities: ['wifi'],
      imageId: 'hotel-4',
    },
    {
      id: 'room-105',
      roomName: 'Penthouse Suite',
      hotelName: 'Skyline View Suites',
      price: 220,
      originalPrice: 300,
      rating: 4.9,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-5',
    },
    {
      id: 'room-106',
      roomName: 'Urban Twin Room',
      hotelName: 'Urban Modern Lodge',
      price: 88,
      rating: 4.1,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-6',
    },
     {
      id: 'room-107',
      roomName: 'Cozy Double Bed',
      hotelName: 'Cozy Corner B&B',
      price: 65,
      originalPrice: 90,
      rating: 4.3,
      amenities: ['wifi'],
      imageId: 'hotel-1',
    },
    {
      id: 'room-108',
      roomName: 'Presidential Suite',
      hotelName: 'The Platinum Palace',
      price: 350,
      rating: 5.0,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-2',
    }
];

// Add random distances to rooms for variety
export const rooms: Room[] = roomsData.map(room => ({
    ...room,
    distance: +(Math.random() * 10 + 0.5).toFixed(1), // Random distance between 0.5 and 10.5 km
}));
