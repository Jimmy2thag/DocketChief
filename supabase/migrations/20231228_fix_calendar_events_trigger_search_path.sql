-- Fix search_path security issue for calendar_events updated_at trigger function
-- This migration sets an explicit search_path to prevent search_path injection attacks

-- Drop and recreate the trigger function with explicit search_path
DROP TRIGGER IF EXISTS update_calendar_events_updated_at_trigger ON calendar_events;
DROP FUNCTION IF EXISTS update_calendar_events_updated_at();

-- Create the trigger function with explicit search_path set to public schema
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_calendar_events_updated_at_trigger
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- Add comment explaining the security fix
COMMENT ON FUNCTION update_calendar_events_updated_at() IS 
  'Automatically updates the updated_at timestamp. Uses explicit search_path for security.';
