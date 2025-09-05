-- Add id column to verification_tokens table
-- This migration adds an auto-incrementing id primary key to the verification_tokens table

-- Add id column as SERIAL (auto-incrementing integer)
ALTER TABLE verification_tokens 
ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;

-- If the table already has a primary key constraint, you might need to drop it first
-- This is commented out by default, uncomment if needed:
-- ALTER TABLE verification_tokens DROP CONSTRAINT IF EXISTS verification_tokens_pkey;

-- Ensure the id column is set as primary key
-- This will be handled by SERIAL PRIMARY KEY above, but included for clarity
-- ALTER TABLE verification_tokens ADD PRIMARY KEY (id);

-- Create sequence for existing records (if any)
-- The SERIAL type automatically creates a sequence, but if there are existing records,
-- we need to ensure the sequence starts from the correct value
DO $$
BEGIN
    -- Check if there are existing records
    IF EXISTS (SELECT 1 FROM verification_tokens LIMIT 1) THEN
        -- Set the sequence to start from the max id + 1
        PERFORM setval('verification_tokens_id_seq', COALESCE(MAX(id), 0) + 1, false) 
        FROM verification_tokens;
    END IF;
END $$;