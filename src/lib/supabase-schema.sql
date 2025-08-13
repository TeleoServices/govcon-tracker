-- SAM.gov Opportunities Database Schema for Supabase
-- This script creates all necessary tables for storing SAM.gov opportunity data

-- 1. Main Opportunities Table
CREATE TABLE IF NOT EXISTS sam_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  solicitation_number VARCHAR(255),
  full_parent_path_name TEXT,
  full_parent_path_code VARCHAR(255),
  posted_date TIMESTAMP WITH TIME ZONE,
  opportunity_type VARCHAR(100),
  base_type VARCHAR(100),
  archive_type VARCHAR(100),
  archive_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  naics_code VARCHAR(10),
  classification_code VARCHAR(10),
  response_deadline TIMESTAMP WITH TIME ZONE,
  set_aside_type VARCHAR(50),
  set_aside_description TEXT,
  description_link TEXT,
  ui_link TEXT,
  additional_info_link TEXT,
  organization_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Opportunity Awards Table
CREATE TABLE IF NOT EXISTS sam_opportunity_awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES sam_opportunities(id) ON DELETE CASCADE,
  award_number VARCHAR(255),
  award_amount DECIMAL(15,2),
  award_date TIMESTAMP WITH TIME ZONE,
  awardee_name TEXT,
  awardee_uei_sam VARCHAR(20),
  awardee_street_address TEXT,
  awardee_street_address2 TEXT,
  awardee_city_code VARCHAR(10),
  awardee_city_name VARCHAR(100),
  awardee_state_code VARCHAR(5),
  awardee_state_name VARCHAR(100),
  awardee_country_code VARCHAR(5),
  awardee_country_name VARCHAR(100),
  awardee_zip VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Point of Contact Table
CREATE TABLE IF NOT EXISTS sam_opportunity_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES sam_opportunities(id) ON DELETE CASCADE,
  contact_type VARCHAR(50),
  title VARCHAR(255),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  fax VARCHAR(50),
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Place of Performance Table
CREATE TABLE IF NOT EXISTS sam_opportunity_performance_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES sam_opportunities(id) ON DELETE CASCADE,
  street_address TEXT,
  street_address2 TEXT,
  city_code VARCHAR(10),
  city_name VARCHAR(100),
  state_code VARCHAR(5),
  state_name VARCHAR(100),
  country_code VARCHAR(5),
  country_name VARCHAR(100),
  zip VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Office Address Table
CREATE TABLE IF NOT EXISTS sam_opportunity_office_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES sam_opportunities(id) ON DELETE CASCADE,
  city VARCHAR(100),
  state VARCHAR(5),
  zip VARCHAR(20),
  country_code VARCHAR(5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. API Sync Log Table
CREATE TABLE IF NOT EXISTS sam_api_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'full_sync', 'incremental', 'manual'
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
  total_records INTEGER,
  new_records INTEGER,
  updated_records INTEGER,
  errors TEXT,
  api_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_notice_id ON sam_opportunities(notice_id);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_posted_date ON sam_opportunities(posted_date);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_naics_code ON sam_opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_active ON sam_opportunities(active);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_last_synced ON sam_opportunities(last_synced);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_response_deadline ON sam_opportunities(response_deadline);
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_organization_type ON sam_opportunities(organization_type);

CREATE INDEX IF NOT EXISTS idx_sam_opportunity_awards_opportunity_id ON sam_opportunity_awards(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sam_opportunity_contacts_opportunity_id ON sam_opportunity_contacts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sam_opportunity_performance_locations_opportunity_id ON sam_opportunity_performance_locations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sam_opportunity_office_addresses_opportunity_id ON sam_opportunity_office_addresses(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_sam_api_sync_logs_status ON sam_api_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sam_api_sync_logs_sync_type ON sam_api_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sam_api_sync_logs_start_time ON sam_api_sync_logs(start_time);

-- Enable Row Level Security (RLS)
ALTER TABLE sam_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sam_opportunity_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sam_opportunity_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sam_opportunity_performance_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sam_opportunity_office_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sam_api_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON sam_opportunities FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sam_opportunity_awards FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sam_opportunity_contacts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sam_opportunity_performance_locations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sam_opportunity_office_addresses FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sam_api_sync_logs FOR SELECT USING (true);

-- Create policies for insert/update access (restrict to service role)
CREATE POLICY "Enable insert for service role" ON sam_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON sam_opportunities FOR UPDATE USING (true);
CREATE POLICY "Enable insert for service role" ON sam_opportunity_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON sam_opportunity_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON sam_opportunity_performance_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON sam_opportunity_office_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON sam_api_sync_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON sam_api_sync_logs FOR UPDATE USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_sam_opportunities_updated_at 
    BEFORE UPDATE ON sam_opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Full-text search index for opportunity titles and organizations
CREATE INDEX IF NOT EXISTS idx_sam_opportunities_search ON sam_opportunities 
USING gin(to_tsvector('english', title || ' ' || COALESCE(full_parent_path_name, '')));

-- Comments
COMMENT ON TABLE sam_opportunities IS 'Main table storing SAM.gov opportunity data';
COMMENT ON TABLE sam_opportunity_awards IS 'Award information for opportunities';
COMMENT ON TABLE sam_opportunity_contacts IS 'Point of contact information';
COMMENT ON TABLE sam_opportunity_performance_locations IS 'Place of performance locations';
COMMENT ON TABLE sam_opportunity_office_addresses IS 'Office addresses';
COMMENT ON TABLE sam_api_sync_logs IS 'Log of API synchronization operations';

-- Create view for opportunities with all related data
CREATE OR REPLACE VIEW sam_opportunities_full AS
SELECT 
    o.*,
    json_agg(DISTINCT jsonb_build_object(
        'id', a.id,
        'award_number', a.award_number,
        'award_amount', a.award_amount,
        'award_date', a.award_date,
        'awardee_name', a.awardee_name,
        'awardee_uei_sam', a.awardee_uei_sam,
        'location', jsonb_build_object(
            'street_address', a.awardee_street_address,
            'street_address2', a.awardee_street_address2,
            'city_code', a.awardee_city_code,
            'city_name', a.awardee_city_name,
            'state_code', a.awardee_state_code,
            'state_name', a.awardee_state_name,
            'country_code', a.awardee_country_code,
            'country_name', a.awardee_country_name,
            'zip', a.awardee_zip
        )
    )) FILTER (WHERE a.id IS NOT NULL) AS awards,
    json_agg(DISTINCT jsonb_build_object(
        'id', c.id,
        'contact_type', c.contact_type,
        'title', c.title,
        'full_name', c.full_name,
        'email', c.email,
        'phone', c.phone,
        'fax', c.fax,
        'additional_info', c.additional_info
    )) FILTER (WHERE c.id IS NOT NULL) AS contacts,
    json_agg(DISTINCT jsonb_build_object(
        'id', pl.id,
        'street_address', pl.street_address,
        'street_address2', pl.street_address2,
        'city_code', pl.city_code,
        'city_name', pl.city_name,
        'state_code', pl.state_code,
        'state_name', pl.state_name,
        'country_code', pl.country_code,
        'country_name', pl.country_name,
        'zip', pl.zip
    )) FILTER (WHERE pl.id IS NOT NULL) AS performance_locations,
    json_agg(DISTINCT jsonb_build_object(
        'id', oa.id,
        'city', oa.city,
        'state', oa.state,
        'zip', oa.zip,
        'country_code', oa.country_code
    )) FILTER (WHERE oa.id IS NOT NULL) AS office_addresses
FROM sam_opportunities o
LEFT JOIN sam_opportunity_awards a ON o.id = a.opportunity_id
LEFT JOIN sam_opportunity_contacts c ON o.id = c.opportunity_id
LEFT JOIN sam_opportunity_performance_locations pl ON o.id = pl.opportunity_id
LEFT JOIN sam_opportunity_office_addresses oa ON o.id = oa.opportunity_id
GROUP BY o.id;

COMMENT ON VIEW sam_opportunities_full IS 'Comprehensive view of opportunities with all related data';