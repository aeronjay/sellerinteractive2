-- ============================================
-- Client Review Tracker — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create the review_requests table
CREATE TABLE review_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  product_asin CHAR(10) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'In Progress', 'Done')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast status filtering
CREATE INDEX idx_review_requests_status ON review_requests(status);

-- Composite index for duplicate detection lookups
CREATE INDEX idx_review_requests_client_asin ON review_requests(client_name, product_asin);

-- ============================================
-- Row Level Security (RLS)
-- Internal tool: allow all operations via anon key
-- ============================================
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon"
  ON review_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);
