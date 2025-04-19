
-- Add metadata column
ALTER TABLE public.conversations
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb NOT NULL;

-- Create GIN index on metadata for faster JSON operations
CREATE INDEX idx_conversations_metadata ON public.conversations USING GIN (metadata); 