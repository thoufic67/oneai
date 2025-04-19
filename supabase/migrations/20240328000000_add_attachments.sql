-- Add attachment_url column to chat_messages
ALTER TABLE public.chat_messages
ADD COLUMN attachment_url text,
ADD COLUMN attachment_type text,
ADD CONSTRAINT valid_attachment_type CHECK (
    attachment_type IS NULL OR 
    attachment_type IN ('image', 'video', 'audio', 'document', 'other')
);

-- Create index for faster queries on messages with attachments
CREATE INDEX idx_chat_messages_attachments ON public.chat_messages(conversation_id) 
WHERE attachment_url IS NOT NULL;

-- Update RLS policies to allow access to attachments
ALTER POLICY "Users can perform all actions on messages in their conversations"
ON public.chat_messages
USING (
    auth.uid() = (
        select user_id 
        from public.conversations 
        where id = chat_messages.conversation_id
    )
);

COMMENT ON COLUMN public.chat_messages.attachment_url IS 'URL of the attached file';
COMMENT ON COLUMN public.chat_messages.attachment_type IS 'Type of the attachment (image, video, audio, document, other)'; 