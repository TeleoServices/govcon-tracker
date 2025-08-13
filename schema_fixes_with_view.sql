-- Fix SAM.gov contact data field length issues
-- Handle view dependencies by dropping and recreating

-- First, drop the view that depends on the columns we need to modify
DROP VIEW IF EXISTS sam_opportunities_full;

-- Now we can safely alter the column types
-- Increase field lengths for sam_opportunity_contacts table
ALTER TABLE sam_opportunity_contacts 
ALTER COLUMN full_name TYPE TEXT;

ALTER TABLE sam_opportunity_contacts 
ALTER COLUMN additional_info TYPE TEXT;

ALTER TABLE sam_opportunity_contacts 
ALTER COLUMN title TYPE TEXT;

-- Also fix other potential length issues in the main opportunities table
ALTER TABLE sam_opportunities 
ALTER COLUMN title TYPE TEXT;

ALTER TABLE sam_opportunities 
ALTER COLUMN description_link TYPE TEXT;

ALTER TABLE sam_opportunities 
ALTER COLUMN ui_link TYPE TEXT;

ALTER TABLE sam_opportunities 
ALTER COLUMN additional_info_link TYPE TEXT;

-- Fix office names that might be long
ALTER TABLE sam_opportunities 
ALTER COLUMN office_name TYPE TEXT;

ALTER TABLE sam_opportunities 
ALTER COLUMN department_name TYPE TEXT;

-- Fix set aside descriptions that can be lengthy
ALTER TABLE sam_opportunities 
ALTER COLUMN set_aside_description TYPE TEXT;

-- Recreate the view with updated column types
-- This view likely joins opportunities with their related data
CREATE OR REPLACE VIEW sam_opportunities_full AS
SELECT 
    o.*,
    -- Aggregate contacts
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'contact_type', c.contact_type,
                'title', c.title,
                'full_name', c.full_name,
                'email', c.email,
                'phone', c.phone,
                'fax', c.fax,
                'additional_info', c.additional_info
            )
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[]'::json
    ) as contacts,
    -- Aggregate awards
    COALESCE(
        json_agg(
            json_build_object(
                'id', a.id,
                'award_number', a.award_number,
                'award_amount', a.award_amount,
                'award_date', a.award_date,
                'awardee_name', a.awardee_name,
                'awardee_uei_sam', a.awardee_uei_sam
            )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
    ) as awards,
    -- Aggregate performance locations
    COALESCE(
        json_agg(
            json_build_object(
                'id', pl.id,
                'street_address', pl.street_address,
                'city_name', pl.city_name,
                'state_name', pl.state_name,
                'country_name', pl.country_name,
                'zip', pl.zip
            )
        ) FILTER (WHERE pl.id IS NOT NULL),
        '[]'::json
    ) as performance_locations,
    -- Aggregate office addresses
    COALESCE(
        json_agg(
            json_build_object(
                'id', oa.id,
                'city', oa.city,
                'state', oa.state,
                'zip', oa.zip,
                'country_code', oa.country_code
            )
        ) FILTER (WHERE oa.id IS NOT NULL),
        '[]'::json
    ) as office_addresses
FROM sam_opportunities o
LEFT JOIN sam_opportunity_contacts c ON o.id = c.opportunity_id
LEFT JOIN sam_opportunity_awards a ON o.id = a.opportunity_id
LEFT JOIN sam_opportunity_performance_locations pl ON o.id = pl.opportunity_id
LEFT JOIN sam_opportunity_office_addresses oa ON o.id = oa.opportunity_id
GROUP BY o.id;