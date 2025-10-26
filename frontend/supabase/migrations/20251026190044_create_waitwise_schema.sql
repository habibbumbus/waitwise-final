/*
  # WaitWise Health Database Schema

  ## Overview
  Creates the core database structure for WaitWise Health - a healthcare queue management system.

  ## New Tables

  ### 1. users
  Patient information and triage data
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - Full name
  - `email` (text) - Contact email
  - `phone` (text) - Phone number for SMS notifications
  - `id_type` (text) - "Healthcard" or "GovID"
  - `urgency_level` (text) - Triage level: "low", "medium", "high"
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. clinics
  Healthcare facility information and capacity tracking
  - `id` (uuid, primary key) - Unique clinic identifier
  - `name` (text) - Clinic name
  - `address` (text) - Full address
  - `latitude` (numeric) - GPS coordinates for mapping
  - `longitude` (numeric) - GPS coordinates for mapping
  - `current_wait` (integer) - Estimated wait time in minutes
  - `capacity` (integer) - Maximum concurrent patients
  - `active_patients` (integer) - Current number of patients
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. appointments
  Queue management and appointment tracking
  - `id` (uuid, primary key) - Unique appointment identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `clinic_id` (uuid, foreign key) - Reference to clinics table
  - `status` (text) - "queued", "notified", "confirmed", "cancelled", "completed"
  - `position` (integer) - Queue position number
  - `symptoms` (text) - Patient-reported symptoms
  - `created_at` (timestamptz) - Booking timestamp
  - `updated_at` (timestamptz) - Last status update

  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Users can create appointments
  - Users can update their own appointments
  - All users can read clinic information
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  id_type text NOT NULL CHECK (id_type IN ('Healthcard', 'GovID')),
  urgency_level text DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  current_wait integer DEFAULT 0,
  capacity integer DEFAULT 20,
  active_patients integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'notified', 'confirmed', 'cancelled', 'completed')),
  position integer NOT NULL,
  symptoms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can create user account"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Clinics policies (public read access for discovery)
CREATE POLICY "Anyone can view clinics"
  ON clinics FOR SELECT
  TO anon, authenticated
  USING (true);

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clinics_location ON clinics(latitude, longitude);

-- Insert sample clinic data
INSERT INTO clinics (name, address, latitude, longitude, current_wait, capacity, active_patients)
VALUES
  ('Downtown Medical Centre', '123 Main St, Toronto, ON M5H 2N2', 43.6532, -79.3832, 15, 30, 8),
  ('North York Health Clinic', '456 Yonge St, North York, ON M2N 5S1', 43.7615, -79.4111, 25, 25, 12),
  ('Scarborough Walk-In Clinic', '789 Kennedy Rd, Scarborough, ON M1P 2L4', 43.7315, -79.2625, 10, 20, 4),
  ('Etobicoke Family Health', '321 Lakeshore Blvd W, Etobicoke, ON M8V 1A1', 43.6205, -79.4826, 30, 15, 14),
  ('Midtown Medical Services', '555 Eglinton Ave W, Toronto, ON M5N 1A9', 43.7075, -79.4090, 20, 35, 15)
ON CONFLICT DO NOTHING;