'use server';
/**
 * @fileOverview An AI agent for recommending hotel room pricing.
 *
 * - getPricingRecommendation - A function that handles the price recommendation process.
 */

import { ai } from '@/ai/genkit';
import {
  PricingRecommendationInput,
  PricingRecommendationInputSchema,
  PricingRecommendation,
  PricingRecommendationSchema
} from './pricing-recommendation.schema';

export async function getPricingRecommendation(input: PricingRecommendationInput): Promise<PricingRecommendation> {
  return pricingRecommendationFlow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'pricingRecommendationPrompt',
    input: { schema: PricingRecommendationInputSchema },
    output: { schema: PricingRecommendationSchema },
    prompt: `You are an expert hotel revenue manager for Ulaanbaatar, Mongolia. Your goal is to maximize profit by dynamically setting room prices.

Analyze the provided room types and the date range. Consider the following factors for the Mongolian market:
- Day of the week: Weekends (Friday, Saturday) usually have higher demand.
- Seasonality: Summer (June-August) is high season. Winter is low season.
- Holidays & Events: Consider major Mongolian holidays like Naadam (July 11-13), Tsagaan Sar (lunar new year, ~Feb), and other public holidays or major local events if you are aware of any.
- Competitor Landscape (Simulated): Assume hotels in the city center are more expensive. A 5-star hotel might charge 500,000-800,000 MNT, a 4-star 300,000-500,000 MNT, and a 3-star 150,000-300,000 MNT. Adjust based on the provided room's rating and amenities.
- Room characteristics: Higher rated rooms with more amenities in prime locations should have higher prices.

Based on this analysis, generate a pricing plan for the given date range for each room type.

Your output must be a JSON object that adheres to the output schema.
- The 'summary' field should be a short, actionable summary in Mongolian explaining the logic behind your recommendations (e.g., "Амралтын өдрүүдэд эрэлт ихсэх тул үнийг нэмж, ажлын өдрүүдэд хямдруулав.").
- The 'recommendations' field should be an object where each key is a string "roomTypeId_YYYY-MM-DD" and the value is the recommended integer price in MNT.
- Only include recommendations for prices that are DIFFERENT from the room's base price. Do not include recommendations if the price should remain the same.
- Round prices to the nearest 1000 MNT.

Today's Date: ${new Date().toISOString().split('T')[0]}

Room Types:
{{#each roomTypes}}
- Room Type ID: {{id}}
- Name: {{roomName}} at {{hotelName}}
- Base Price: {{price}} MNT
- Location: {{location}}
- Rating: {{rating}}
{{/each}}

Date Range: {{dateRange.startDate}} to {{dateRange.endDate}}`,
  }
);


const pricingRecommendationFlow = ai.defineFlow(
  {
    name: 'pricingRecommendationFlow',
    inputSchema: PricingRecommendationInputSchema,
    outputSchema: PricingRecommendationSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI did not return a valid recommendation.");
    }
    return output;
  }
);
