-- Init schema for licensing backend
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS general_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT UNIQUE NOT NULL,
  stripe_percentage INTEGER NOT NULL,
  stripe_flat_fee INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    client_id TEXT UNIQUE NOT NULL,
    client_secret TEXT NOT NULL,
    tile_color TEXT,
    background_color TEXT,
    subscription_id UUID REFERENCES general_subscriptions(id),
    owner_id TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur',
    application_id UUID REFERENCES applications(id),
    stripe_session_id TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    one_time_use BOOLEAN DEFAULT false,
    num_days INTEGER,
    num_usages INTEGER,
    is_lifetime BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_subscription_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    stripe_session_id TEXT UNIQUE,
    application_subscription_id UUID REFERENCES application_subscriptions(id),
    owner_id TEXT REFERENCES users(id),
    num_usages INTEGER DEFAULT 0,
    page_id TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);