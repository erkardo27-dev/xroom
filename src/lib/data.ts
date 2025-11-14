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
  imageIds: string[];
};

const roomsData: Omit<Room, 'distance' | 'imageIds'> & { imageIds: string[] }[] = [
    {
      id: 'room-101',
      roomName: 'Стандарт Кинг Өрөө',
      hotelName: 'Их Оазис',
      price: 400000,
      originalPrice: 610000,
      rating: 4.5,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageIds: ['hotel-1', 'hotel-7', 'hotel-8'],
    },
    {
      id: 'room-102',
      roomName: 'Делюкс Люкс',
      hotelName: 'Хотын Төв',
      price: 320000,
      rating: 4.2,
      amenities: ['wifi', 'restaurant'],
      imageIds: ['hotel-2', 'hotel-9', 'hotel-1'],
    },
    {
      id: 'room-103',
      roomName: 'Голын Харагдацтай Давхар Ор',
      hotelName: 'Голын Эрэг Амралт',
      price: 510000,
      originalPrice: 680000,
      rating: 4.8,
      amenities: ['wifi', 'parking'],
      imageIds: ['hotel-3', 'hotel-10', 'hotel-2'],
    },
    {
      id: 'room-104',
      roomName: 'Компакт Нэг Ортой',
      hotelName: 'Минималист Дэн буудал',
      price: 255000,
      rating: 3.9,
      amenities: ['wifi'],
      imageIds: ['hotel-4', 'hotel-11', 'hotel-3'],
    },
    {
      id: 'room-105',
      roomName: 'Пентхаус Люкс',
      hotelName: 'Тэнгэр Харагдах Люкс',
      price: 750000,
      originalPrice: 1020000,
      rating: 4.9,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageIds: ['hotel-5', 'hotel-12', 'hotel-4'],
    },
    {
      id: 'room-106',
      roomName: 'Хотын Ихэр Ортой Өрөө',
      hotelName: 'Орчин үеийн хотын Lodge',
      price: 300000,
      rating: 4.1,
      amenities: ['wifi', 'parking'],
      imageIds: ['hotel-6', 'hotel-1', 'hotel-5'],
    },
     {
      id: 'room-107',
      roomName: 'Тохилог Давхар Ор',
      hotelName: 'Тохилог булан B&B',
      price: 220000,
      originalPrice: 300000,
      rating: 4.3,
      amenities: ['wifi'],
      imageIds: ['hotel-7', 'hotel-2', 'hotel-6'],
    },
    {
      id: 'room-108',
      roomName: 'Ерөнхийлөгчийн люкс',
      hotelName: 'Платинум ордон',
      price: 950000,
      rating: 5.0,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageIds: ['hotel-8', 'hotel-3', 'hotel-7'],
    }
];

// Add random distances to rooms for variety
export const rooms: Room[] = roomsData.map(room => ({
    ...room,
    distance: +(Math.random() * 10 + 0.5).toFixed(1), // Random distance between 0.5 and 10.5 km
}));
