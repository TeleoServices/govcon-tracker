-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'USER' NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Enable RLS (Row Level Security)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow operations (adjust as needed for security)
CREATE POLICY "Allow all operations on User table" ON "User" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Session table" ON "Session" FOR ALL USING (true);

-- Insert default admin user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
    'cl35g0836a9lemz46w6dadvwh',
    'admin@teleoservices.com',
    '$2b$12$NmyxwjLejAPEbBFQ.wvmx.SAndh6/AyRwUHkbnxJjosf1JlD6LhO6',
    'Administrator',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;