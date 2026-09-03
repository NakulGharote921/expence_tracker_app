-- Migration: Add AI metadata fields to transactions table
-- Run this in Supabase SQL Editor to add AI tracking support

-- Add source field to track how transaction was created
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Add AI confidence score field
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS ai_confidence numeric;

-- Add check constraint for source field values
DO $$ BEGIN
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_source_check
    CHECK (source in ('manual', 'ai', 'receipt', 'import'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create index for source field for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
