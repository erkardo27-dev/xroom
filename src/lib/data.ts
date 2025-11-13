import { PlaceHolderImages } from './placeholder-images';

export type Hotel = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  distance: number; // in km
  amenities: ('wifi' | 'parking' | 'restaurant')[];
  imageId: string;
};

const hotelsData: Omit<Hotel, 'distance'>[] = [
    {
      id: 'hotel-101',
      name: 'The Grand Oasis',
      price: 120,
      originalPrice: 180,
      rating: 4.5,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-1',
    },
    {
      id: 'hotel-102',
      name: 'Cityscape Central',
      price: 95,
      rating: 4.2,
      amenities: ['wifi', 'restaurant'],
      imageId: 'hotel-2',
    },
    {
      id: 'hotel-103',
      name: 'Riverside Retreat',
      price: 150,
      originalPrice: 200,
      rating: 4.8,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-3',
    },
    {
      id: 'hotel-104',
      name: 'The Minimalist Inn',
      price: 75,
      rating: 3.9,
      amenities: ['wifi'],
      imageId: 'hotel-4',
    },
    {
      id: 'hotel-105',
      name: 'Skyline View Suites',
      price: 220,
      originalPrice: 300,
      rating: 4.9,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-5',
    },
    {
      id: 'hotel-106',
      name: 'Urban Modern Lodge',
      price: 88,
      rating: 4.1,
      amenities: ['wifi', 'parking'],
      imageId: 'hotel-6',
    },
     {
      id: 'hotel-107',
      name: 'Cozy Corner B&B',
      price: 65,
      originalPrice: 90,
      rating: 4.3,
      amenities: ['wifi'],
      imageId: 'hotel-1',
    },
    {
      id: 'hotel-108',
      name: 'The Platinum Palace',
      price: 350,
      rating: 5.0,
      amenities: ['wifi', 'parking', 'restaurant'],
      imageId: 'hotel-2',
    }
];

// Add random distances to hotels for variety
export const hotels: Hotel[] = hotelsData.map(hotel => ({
    ...hotel,
    distance: +(Math.random() * 10 + 0.5).toFixed(1), // Random distance between 0.5 and 10.5 km
}));
