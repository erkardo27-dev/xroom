import { z } from 'zod';

const RoomTypeSchema = z.object({
  id: z.string(),
  roomName: z.string(),
  hotelName: z.string(),
  price: z.number(),
  location: z.string(),
  amenities: z.array(z.string()),
  rating: z.number(),
  ownerId: z.string(),
});

export const PricingRecommendationInputSchema = z.object({
  roomTypes: z.array(RoomTypeSchema),
  requesterUid: z.string(),
  dateRange: z.object({
    startDate: z.string().describe('The start date in YYYY-MM-DD format.'),
    endDate: z.string().describe('The end date in YYYY-MM-DD format.'),
  }),
  events: z.array(z.object({
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    impact: z.string(),
    description: z.string(),
  })).optional().describe('A list of significant local events during the date range.'),
});
export type PricingRecommendationInput = z.infer<typeof PricingRecommendationInputSchema>;

export const InternalPricingRecommendationSchema = z.object({
  summary: z.string().describe('A brief, high-level summary of the pricing strategy recommendation in Mongolian.'),
  recommendations: z.array(z.object({
    key: z.string().describe('The key in the format "roomTypeId_YYYY-MM-DD"'),
    price: z.number().describe('The recommended price')
  })).describe('An array of recommended prices.'),
});

export const PricingRecommendationSchema = z.object({
  summary: z.string().describe('A brief, high-level summary of the pricing strategy recommendation in Mongolian.'),
  recommendations: z.record(z.string(), z.number()).describe('A map of recommended prices.'),
});
export type PricingRecommendation = z.infer<typeof PricingRecommendationSchema>;
