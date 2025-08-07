-- Tenkasi District Petition Redressal System Database Schema

-- Create petitions table
CREATE TABLE IF NOT EXISTS petitions (
    id SERIAL PRIMARY KEY,
    petition_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated unique ID like TNK-2025-001
    from_name VARCHAR(100) NOT NULL,
    to_department VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(15) NOT NULL,
    petition_text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    petition_id INTEGER REFERENCES petitions(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_final BOOLEAN DEFAULT false,
    responded_by VARCHAR(20) DEFAULT 'official' CHECK (responded_by IN ('official', 'admin'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petitions_petition_id ON petitions(petition_id);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_department ON petitions(to_department);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_petition_id ON responses(petition_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_petitions_updated_at 
    BEFORE UPDATE ON petitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample departments (can be modified as needed)
-- This is handled in the application code to allow dynamic management