-- Fix SAM.gov contact data field length issues
-- These columns are currently VARCHAR(255) but need to handle longer data

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