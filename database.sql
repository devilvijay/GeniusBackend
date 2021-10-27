CREATE DATABASE genius;

--\c into genius database
-- \l to get list of all databses
-- \dt to show the tables in database


CREATE TABLE student
(
    student_id serial PRIMARY KEY, 
    student_name VARCHAR(30) NOT NULL, 
    phone_no VARCHAR(10) UNIQUE NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL, 
    courses TEXT []
);
ALTER TABLE public.student
    ADD COLUMN field character varying(200);
ALTER TABLE public.student
    ADD COLUMN board character varying(20);
ALTER TABLE public.student
    ADD COLUMN standard character varying(20);





CREATE TABLE IF NOT EXISTS public.tutors
(
    tutor_id serial NOT NULL,
    tutor_name character varying(255) NOT NULL,
    phone_no character varying(10) NOT NULL,
    email character varying(255) NOT NULL,
    courses text[],
    PRIMARY KEY (tutor_id)
);


CREATE TABLE IF NOT EXISTS public.courses
(
    course_id serial NOT NULL,
    time_start time without time zone,
    time_end time without time zone,
    start_date date,
    end_date date,
    teacher character varying(255) NOT NULL,
    fees double precision,
    rating_stars integer,
    subjects character varying(30)[] ,
    class_ character varying(20)[] ,
    board character varying(5)[],
    location character varying(30),
    description character varying(500),
    teacher_id integer[],
    PRIMARY KEY (course_id)
);



CREATE TABLE IF NOT EXISTS public.users
(
    id serial,
    name character varying(200),
    email character varying(200),
    password character varying(200),
    phone_no character varying(200),
    is_admin boolean DEFAULT False,
    created_on date,
    PRIMARY KEY (id)
);