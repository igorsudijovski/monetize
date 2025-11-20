CREATE TABLE IF NOT EXISTS users
(
    id                uuid      default gen_random_uuid() not null
        primary key,
    email             text                                not null
        unique,
    name              text,
    google_id         text                                not null
        unique,
    stripe_account_id text,
    created_at        timestamp default now(),
    onboard_complete  boolean   default false             not null
);

CREATE TABLE IF NOT EXISTS general_subscriptions
(
    id                uuid      default gen_random_uuid() not null
        primary key,
    name              text                                not null,
    description       text,
    list_text         text,
    type              text                                not null
        unique,
    stripe_product_id text,
    percentage        numeric(6, 2)                       not null,
    fix_fee           numeric(15, 5)                      not null,
    price             integer                             not null,
    currency          text      default 'eur'::text,
    active            boolean   default true,
    expires_at        timestamp,
    created_at        timestamp default now()
);

CREATE TABLE IF NOT EXISTS applications
(
    id                uuid      default gen_random_uuid() not null
        primary key,
    name              text                                not null,
    url_name          text                                not null unique,
    redirect_url      text,
    client_id         text                                not null
        unique,
    client_secret     text                                not null,
    button_color      text,
    background_color  text,
    stripe_session_id text,
    subscription_id   uuid  references general_subscriptions(id),
    owner_id          uuid  references users(id),
    expired_at        timestamp,
    created_at        timestamp default now(),
    font_color        text
);


CREATE TABLE IF NOT EXISTS application_subscriptions
(
    id             uuid      default gen_random_uuid() not null
        primary key,
    name           text                                not null,
    description    text,
    list_text      text,
    price          integer                             not null,
    currency       text      default 'eur'::text,
    application_id uuid
        references applications(id),
    stripe_product_id text,
    active         boolean   default false,
    one_time_use   boolean   default false,
    num_days       integer,
    num_usages     integer,
    is_lifetime    boolean   default false,
    created_at     timestamp default now(),
    order_number   integer                             not null,
    disabled       boolean   default false             not null
);

CREATE TABLE IF NOT EXISTS application_subscription_keys
(
    id                          uuid      default gen_random_uuid() not null
        primary key,
    app_key                     text                                not null
        constraint application_subscription_keys_key_key
            unique,
    stripe_session_id           text
        unique,
    application_subscription_id uuid
        references application_subscriptions(id),
    owner_id                    uuid
        references users(id),
    price                       numeric(15, 5)                      not null,
    currency                    text      default 'eur'::text,
    exchange_rate               numeric(15, 5),
    fee                         numeric(15, 5)                      not null,
    net                         numeric(15, 5),
    num_usages                  integer   default 0                 not null,
    page_id                     text,
    active                      boolean   default false              not null,
    expires_at                  timestamp,
    last_used_at                timestamp,
    created_at                  timestamp default now(),
    paid                        boolean   default false             not null
);

insert into general_subscriptions(name, description, list_text, type, stripe_product_id, percentage, price, fix_fee) values
                                                                                                                ('Almost free', 'A super affordable way for creators to experiment with new ideas, test their product, and grow without the pressure.', 'Includes one-time tokens\n50 tokens per month total\nToken pricing options between €5–€40\n3 pricing types available\n3 features per pricing type\nPlatform fee: 35%\nPayment handling fee is €0.4', 'FREE', 'prod_TQVmvFoOgT4nBt', 35, 2, 0.4),
                                                                                                                ('Basic', 'Perfect for creators who’ve started making sales and are ready to level up with additional options for their audience.', 'Supports one-time, lifetime, and multi-use tokens\n400 tokens per month total\nToken pricing options between €5–€250\nToken recovery if stolen\n6 pricing types, each with up to 10 features\nRevenue analytics with dashboard graphs\nPlatform fee: 28%\nPayment handling fee is €0.3', 'BASIC', 'prod_TQVrWIuzpSPyAM', 28, 7, 0.3),
                                                                                                                ('Pro', 'If you already have products or offers and want to introduce subscriptions, this plan is the perfect fit.', 'Supports one-time, lifetime, multi-use tokens, plus subscriptions\nUnlimited tokens\nToken pricing options between €2–€2000\nToken recovery if stolen\n15 pricing types (contact us for more)\nUnlimited feature options\nRevenue analytics with dashboard graphs\nPlatform fee: 15%\nPayment handling fee  is €0.25', 'PRO', 'prod_TQWBYh768HH5Oc',15, 40, 0.25);

