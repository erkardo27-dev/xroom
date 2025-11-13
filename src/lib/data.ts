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
      roomName: 'Стандарт Кинг Өрөө',
      hotelName: 'Их Оазис',
      price: 120,
      originalPrice: 180,
      rating: 4.5,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-1',
    },
    {
      id: 'room-102',
      roomName: 'Делюкс Люкс',
      hotelName: 'Хотын Төв',
      price: 95,
      rating: 4.2,
      amenities: ['wifi', 'restaurant'],
      imageId: 'hotel-2',
    },
    {
      id: 'room-103',
      roomName: 'Голын Харагдацтай Давхар Ор',
      hotelName: 'Голын Эрэг Амралт',
      price: 150,
      originalPrice: 200,
      rating: 4.8,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-3',
    },
    {
      id: 'room-104',
      roomName: 'Компакт Нэг Ортой',
      hotelName: 'Минималист Дэн буудал',
      price: 75,
      rating: 3.9,
      amenities: ['wifi'],
      imageId: 'hotel-4',
    },
    {
      id: 'room-105',
      roomName: 'Пентхаус Люкс',
      hotelName: 'Тэнгэр Харагдах Люкс',
      price: 220,
      originalPrice: 300,
      rating: 4.9,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-5',
    },
    {
      id: 'room-106',
      roomName: 'Хотын Ихэр Ортой Өрөө',
      hotelName: 'Орчин үеийн хотын Lodge',
      price: 88,
      rating: 4.1,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-6',
    },
     {
      id: 'room-107',
      roomName: 'Тохилог Давхар Ор',
      hotelName: 'Тохилог булан B&B',
      price: 65,
      originalPrice: 90,
      rating: 4.3,
      amenities: ['wifi'],
      imageId: 'hotel-1',
    },
    {
      id: 'room-108',
      roomName: 'Ерөнхийлөгчийн люкс',
      hotelName: 'Платинум ордон',
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
