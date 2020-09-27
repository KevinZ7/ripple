create schema if not exists ripple;
<<<<<<< HEAD

=======
>>>>>>> 6de6f2d7242696319889956455c8d71bb76103b5
drop table if exists ripple.friend;
drop table if exists ripple.message;
drop table if exists ripple.journal;
drop table if exists ripple.quote;
drop table if exists ripple.description;
drop table if exists ripple.user;
<<<<<<< HEAD
drop table if exists ripple.recentmsg;

=======
>>>>>>> 6de6f2d7242696319889956455c8d71bb76103b5
create table if not exists ripple.user (
    userid text primary key,
    age int not null
);
create table if not exists ripple.description (
    descid SERIAL primary key,
    content text not null,
    since TIMESTAMP NOT null,
<<<<<<< HEAD
    userid text references ripple.user(userid) on delete cascade
=======
    userid text references ripple.user(userid) on delete cascade,
    unique (userid)
>>>>>>> 6de6f2d7242696319889956455c8d71bb76103b5
);

create table if not exists ripple.quote (
    quoteid SERIAL primary key,
    quote text not null,
    author text,
    since TIMESTAMP NOT null,
    userid text references ripple.user(userid) on delete cascade
);
create table if not exists ripple.journal(
    journalid SERIAL primary key,
    journal text not null,
    since TIMESTAMP NOT null,
    category text NOT null,
    userid text references ripple.user(userid) on delete cascade 
);
create table if not exists ripple.message(
    messageid SERIAL primary key,
    userid1 text references ripple.user(userid) on delete cascade,
    userid2 text references ripple.user(userid) on delete cascade,
    since TIMESTAMP NOT null,
    msg text,
    checked boolean
);
create table if not exists ripple.friend(
    userid1 text references ripple.user(userid) on delete cascade,
    userid2 text references ripple.user(userid) on delete cascade,
    accepted boolean
);

create table if not exists ripple.recentmsg(
    msgid SERIAL,
    context text,
    since TIMESTAMP not null,
    userid1 text,
    userid2 text,
    primary key(userid1,userid2)
);



