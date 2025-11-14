import { z } from 'zod';

const RoomTypeSchema = z.object({
  id: z.string(),
  roomName: z.string(),
  hotelName: z.string(),
  price: z.number(),
  location: z.string(),
  amenities: z.array(z.string()),
  rating: z.number(),
});

export const PricingRecommendationInputSchema = z.object({
  roomTypes: z.array(RoomTypeSchema),
  dateRange: z.object({
    startDate: z.string().describe('The start date in YYYY-MM-DD format.'),
    endDate: z.string().describe('The end date in YYYY-MM-DD format.'),
  }),
});
export type PricingRecommendationInput = z.infer<typeof PricingRecommendationInputSchema>;

export const PricingRecommendationSchema = z.object({
  summary: z.string().describe('A brief, high-level summary of the pricing strategy recommendation in Mongolian.'),
  recommendations: z.record(z.string(), z.number()).describe('A map of recommended prices. The key should be in the format "roomTypeId_YYYY-MM-DD" and the value is the recommended price as a number.'),
});
export type PricingRecommendation = z.infer<typeof PricingRecommendationSchema>;
