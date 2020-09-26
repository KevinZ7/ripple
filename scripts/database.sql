create schema if not exists ripple;
create table if not exists ripple.user (
    userid text primary key,
    age int
);
create table if not exists ripple.description (
    descid text primary key,
    content text,
    descencoding text,
    dt timestamp,
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