/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Nvidia NIM API Service for AI Expense Extraction
 *
 * The API key lives ONLY on the server (Vercel serverless function).
 * This client calls POST /api/nvidia with no auth — the proxy handles it.
 */

import axios from 'axios';

const NIM_API_URL = '/api/nvidia';
const MODEL = "openai/gpt-oss-20b";

/**
 * Build the system prompt with user's custom categories
 */
const buildSystemPrompt = (userCategories = []) => {
  const categoryList = userCategories.length > 0
    ? userCategories.join(', ')
    : 'Food, Travel, Marketing, Utilities, Other';

  return `You are an expense/income extraction assistant for a personal finance app.

Extract structured data from natural language input and return ONLY valid JSON.

Available categories for this user: ${categoryList}

Return JSON with these exact fields:
{
  "amount": number | null,
  "type": "expense" | "income",
  "category": "string",
  "date": "YYYY-MM-DD",
  "payment_method": "Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Transfer" | null,
  "description": "string",
  "confidence": number (0-1)
}

Rules:
1. NEVER guess amount if not provided - set to null
2. NEVER guess payment_method if not provided - set to null
3. Parse Indian number formats (e.g., "2,500" -> 2500, "1.5k" -> 1500, "5000 rupees" -> 5000)
4. Parse relative dates: "today" = today, "yesterday" = yesterday, "last monday" = that date
5. If no date mentioned, default to today's date
6. If amount is negative or context implies expense, set type to "expense"
7. If context implies income (salary, received, earned), set type to "income"
8. Match category to the closest available category from the user's list
9. Return ONLY valid JSON, no other text or markdown`;
};

/**
 * Extract expense data from natural language input using Nvidia NIM.
 * Calls our serverless proxy — no API key in the browser.
 */
export const extractExpenseData = async (userInput, userCategories = []) => {
  if (!userInput || userInput.trim().length === 0) {
    throw new Error('Please provide some input to analyze.');
  }

  const today = new Date().toISOString().split('T')[0];

  const payload = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(userCategories)
      },
      {
        role: "user",
        content: `Today's date is ${today}.\n\nExtract expense from: "${userInput.trim()}"`
      }
    ],
    temperature: 0.1,
    max_tokens: 512,
    stream: false
  };

  try {
    const response = await axios.post(NIM_API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const extracted = JSON.parse(cleanedContent);

    // Validate and normalize the extracted data
    return normalizeExtractedData(extracted, today);
  } catch (error) {
    if (error.response) {
      console.error('NIM API Error:', error.response.status, error.response.data);
      throw new Error(`AI service error: ${error.response.status}`);
    } else if (error.message.includes('JSON')) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    } else {
      throw error;
    }
  }
};

/**
 * Normalize and validate extracted data
 */
const normalizeExtractedData = (data, today) => {
  const paymentMethod = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'].includes(data.payment_method)
    ? data.payment_method
    : null;
  return {
    amount: typeof data.amount === 'number' && data.amount > 0 ? data.amount : null,
    type: ['expense', 'income'].includes(data.type) ? data.type : 'expense',
    category: data.category || 'Other',
    date: data.date && !isNaN(Date.parse(data.date)) ? data.date : today,
    payment_method: paymentMethod,
    paymentMethod,
    description: data.description || '',
    confidence: typeof data.confidence === 'number' ? Math.min(1, Math.max(0, data.confidence)) : 0.5
  };
};

/**
 * Get available categories from the AI model
 */
export const getAICategories = () => {
  return ['Food', 'Travel', 'Marketing', 'Utilities', 'Other', 'Entertainment', 'Health', 'Bills', 'Shopping'];
};
