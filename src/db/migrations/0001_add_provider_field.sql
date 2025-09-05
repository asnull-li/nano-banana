-- Add provider field to nano_banana_tasks table
-- This migration adds a provider field to track which service (fal or kie) is used for each task

-- Add provider column with default value 'fal' for backward compatibility
ALTER TABLE nano_banana_tasks 
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'fal';

-- Add check constraint to ensure only valid providers
ALTER TABLE nano_banana_tasks 
ADD CONSTRAINT check_provider_valid 
CHECK (provider IN ('fal', 'kie'));

-- Create index on provider for better query performance
CREATE INDEX IF NOT EXISTS idx_nano_banana_tasks_provider 
ON nano_banana_tasks(provider);

-- Update existing records to have 'fal' as provider (if any NULL values exist)
-- This should not be needed due to DEFAULT, but included for safety
UPDATE nano_banana_tasks 
SET provider = 'fal' 
WHERE provider IS NULL;