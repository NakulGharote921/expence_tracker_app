/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Entry Validation Utilities
 */

import { PAYMENT_METHODS } from '../mockData';

/**
 * Required fields for a transaction
 */
export const REQUIRED_FIELDS = ['amount', 'category', 'date', 'payment_method'];

/**
 * Detect missing required fields in extracted data
 */
export const detectMissingFields = (extractedData) => {
  const missing = [];

  if (!extractedData.amount || extractedData.amount <= 0) {
    missing.push('amount');
  }

  if (!extractedData.category || extractedData.category.trim().length === 0) {
    missing.push('category');
  }

  if (!extractedData.date || isNaN(Date.parse(extractedData.date))) {
    missing.push('date');
  }

  if (!extractedData.payment_method || !PAYMENT_METHODS.includes(extractedData.payment_method)) {
    missing.push('payment_method');
  }

  return missing;
};

/**
 * Get user-friendly message for missing field
 */
export const getMissingFieldMessage = (fieldName) => {
  const messages = {
    amount: "How much did you spend?",
    category: "What category is this?",
    date: "When was this?",
    payment_method: "How did you pay?"
  };
  return messages[fieldName] || `Please provide ${fieldName}`;
};

/**
 * Get placeholder text for amount input
 */
export const getAmountPlaceholder = () => {
  return "Enter amount in ₹";
};

/**
 * Validate the complete transaction before saving
 */
export const validateTransaction = (data) => {
  const errors = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (typeof data.amount !== 'number') {
    errors.push('Amount must be a valid number');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Valid date is required');
  }

  if (!data.payment_method || !PAYMENT_METHODS.includes(data.payment_method)) {
    errors.push('Valid payment method is required');
  }

  if (!['expense', 'income'].includes(data.type)) {
    errors.push('Type must be either expense or income');
  }

  return errors;
};

/**
 * Calculate confidence level label
 */
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.9) return { label: 'High', color: 'text-green-600' };
  if (confidence >= 0.7) return { label: 'Medium', color: 'text-yellow-600' };
  return { label: 'Low', color: 'text-red-600' };
};

/**
 * Format extracted data for display
 */
export const formatExtractedForDisplay = (data) => {
  return {
    amount: data.amount ? `₹${data.amount.toLocaleString('en-IN')}` : 'Not detected',
    type: data.type === 'expense' ? 'Expense' : 'Income',
    category: data.category || 'Not detected',
    date: data.date ? new Date(data.date).toLocaleDateString('en-IN', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'Not detected',
    payment_method: data.payment_method || 'Not detected',
    description: data.description || 'No description',
    confidence: data.confidence ? `${Math.round(data.confidence * 100)}%` : 'Unknown'
  };
};
