-- Init schema for licensing backend
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE NOT NULL,
  stripe_account_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS general_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  list_text TEXT,
  type TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT,
  percentage DECIMAL(6, 2) NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    redirect_uri TEXT NULL,
    client_id TEXT UNIQUE NOT NULL,
    client_secret TEXT NOT NULL,
    tile_color TEXT,
    background_color TEXT,
    stripe_session_id TEXT,
    subscription_id UUID REFERENCES general_subscriptions(id),
    owner_id UUID REFERENCES users(id),
    active boolean default true,
    started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    list_text TEXT,
    price INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur',
    order_number INTEGER NOT NULL,
    application_id UUID REFERENCES applications(id),
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
    owner_id UUID REFERENCES users(id),
    price DECIMAL(15, 5) NOT NULL,
    currency TEXT DEFAULT 'eur',
    exchange_rate DECIMAL(15, 5) NOT NULL,
    fee DECIMAL(15, 5) NOT NULL,
    percentage_fee DECIMAL(15, 5) NOT NULL,
    net DECIMAL(15, 5) NOT NULL,
    num_usages INTEGER DEFAULT 0,
    page_id TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_tax_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_subscription_keys_id UUID REFERENCES application_subscription_keys(id),
    amount DECIMAL(15, 5) NOT NULL,
    currency TEXT NOT NULL,
    description TEXT NOT NULL
);

insert into general_subscriptions(name, description, list_text, type, stripe_product_id, percentage, price) values
('Almost free', 'A super affordable way for creators to experiment with new ideas, test their product, and grow without the pressure.', 'Includes one-time tokens\n50 tokens per month total\nToken pricing options between €5–€40\n3 pricing types available\n3 features per pricing type\nPlatform fee: 35%\nPayment handling fee between 1.5% – 3%', 'FREE', null, 35, 2),
('Basic', 'Perfect for creators who’ve started making sales and are ready to level up with additional options for their audience.', 'Supports one-time, lifetime, and multi-use tokens\n400 tokens per month total\nToken pricing options between €5–€250\nToken recovery if stolen\n6 pricing types, each with up to 10 features\nRevenue analytics with dashboard graphs\nPlatform fee: 28%\nPayment handling fee between 1.5% – 3%', 'BASIC', 'prod_TJQyNAJoh0M1gS', 28, 7),
('Pro', 'If you already have products or offers and want to introduce subscriptions, this plan is the perfect fit.', 'Supports one-time, lifetime, multi-use tokens, plus subscriptions\nUnlimited tokens\nToken pricing options between €2–€2000\nToken recovery if stolen\n15 pricing types (contact us for more)\nUnlimited feature options\nRevenue analytics with dashboard graphs\nPlatform fee: 15%\nPayment handling fee between 1.5% – 3%', 'PRO', 'prod_TJQyzhxeM5wz1Z',15, 40);
