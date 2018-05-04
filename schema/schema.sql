

CREATE TYPE vehicle AS ENUM ('CAR', 'AIRPLANE', 'SHIP', 'ROCKET');

CREATE TABLE owners (
  id  serial primary key,
  owners_code   VARCHAR(40) UNIQUE not null,
  owners_name   VARCHAR(100) not null,
  password      VARCHAR(100) not null,
  date_inst    TIMESTAMPTZ not null,
  date_mod     TIMESTAMPTZ
);

CREATE TABLE drone_info (
  id  serial primary key,
  id_owner   serial  NOT NULL REFERENCES owners (id),
  queue_name   VARCHAR(40) UNIQUE not null,
  drone_type   vehicle not null,
  is_active boolean default true,
  date_inst    TIMESTAMPTZ not null,
  date_mod  TIMESTAMPTZ
);

CREATE TABLE drone_status (
  time      TIMESTAMPTZ       NOT NULL,
  id_queue   serial  NOT NULL REFERENCES drone_info (id),
  lat       DOUBLE PRECISION  NULL,
  lon       DOUBLE PRECISION  NULL,
  alt       DOUBLE PRECISION  NULL,
  groundspeed  DOUBLE PRECISION NULL,
  yaw       DOUBLE PRECISION  NULL,
  roll       DOUBLE PRECISION  NULL,
  pitch       DOUBLE PRECISION  NULL
);



CREATE TABLE drone_status_BAK (
  time      TIMESTAMPTZ       NOT NULL,
  queue     TEXT              NOT NULL,
  lat       DOUBLE PRECISION  NULL,
  lon       DOUBLE PRECISION  NULL,
  alt       DOUBLE PRECISION  NULL,
  groundspeed  DOUBLE PRECISION NULL,
  yaw       DOUBLE PRECISION  NULL,
  roll       DOUBLE PRECISION  NULL,
  pitch       DOUBLE PRECISION  NULL
);

CREATE TABLE sessions (
  id_client uuid primary key,
  owners_code VARCHAR(40) not null,
  date_log  TIMESTAMPTZ   NOT NULL,
  date_upd TIMESTAMPTZ,
  date_lout TIMESTAMPTZ
)


