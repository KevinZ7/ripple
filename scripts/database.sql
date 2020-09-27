create schema if not exists ripple;
create table if not exists ripple.user (
    userid text primary key,
    age int
);
create table if not exists ripple.description (
    descid SERIAL primary key,
    content text,
    since date NOT NULL,
    userid text references ripple.user(userid) on delete cascade
);
create table if not exists ripple.quote (
    quoteid text primary key,
    quote text,
    userid text references ripple.user(userid) on delete cascade
);
create table if not exists ripple.journal(
    journalid text primary key,
    journal text,
    dt timestamp,
    userid text references ripple.user(userid) on delete cascade 
);
create table if not exists ripple.message(
    messageid text primary key,
    userid1 text references ripple.user(userid) on delete cascade,
    userid2 text references ripple.user(userid) on delete cascade,
    msg text
);
create table if not exists ripple.friend(
    userid1 text references ripple.user(userid) on delete cascade,
    userid2 text references ripple.user(userid) on delete cascade,
    accepted boolean
);
alter table if exists ripple.journal add category text;
alter table if exists ripple.message add cleared boolean;
alter table if exists ripple.message add since date not null;
alter table if exists ripple.message alter column since set DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS ripple.description ALTER COLUMN since SET DEFAULT CURRENT_DATE;
