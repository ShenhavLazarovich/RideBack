ALTER TABLE theft_reports
ADD COLUMN latitude TEXT NOT NULL DEFAULT '',
ADD COLUMN longitude TEXT NOT NULL DEFAULT '';

-- Remove the default values after adding the columns
ALTER TABLE theft_reports
ALTER COLUMN latitude DROP DEFAULT,
ALTER COLUMN longitude DROP DEFAULT; 