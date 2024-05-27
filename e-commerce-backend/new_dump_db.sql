--
-- PostgreSQL database dump
--

-- Dumped from database version 14.11 (Homebrew)
-- Dumped by pg_dump version 14.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);


--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    amount NUMERIC,
    available BOOLEAN DEFAULT FALSE
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image VARCHAR(255),
    category_id INTEGER REFERENCES public.categories(id),
    collection_id INTEGER REFERENCES public.collections(id),
    new_price NUMERIC,
    old_price NUMERIC,
    date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    available BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    cart_data JSONB,
    date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id),
    total_amount NUMERIC,
    status VARCHAR(50)
);

CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id),
    product_id INTEGER REFERENCES public.products(id),
    quantity INTEGER,
    price NUMERIC
);

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories (name) VALUES ('men'), ('women'), ('kids');

--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.collections (name) VALUES ('womenCollection1'), ('menCollection1');


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.coupons (name, amount, available) VALUES ('testcoupon20',0.2,TRUE);

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (name, email, password, date, is_admin) VALUES
('TestUser', 'test@test.com', 'test1234', '2024-05-06 15:29:57.132183', false),
('admin', 'admin@admin.com', 'admin', '2024-05-06 15:29:57.13414', true),
('beispiel', 'beispiel3@beispiel.com', 'beispiel', '2024-05-06 15:29:57.13414', true),
('beispiel4', 'beispiel4@beispiel.com', 'beispiel', '2024-05-06 15:29:57.13414', true),
('beispiel', 'beispiel@beispiel.com', 'beispiel', '2024-05-06 15:29:57.13414', true);

--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (name, image, category_id, collection_id, new_price, old_price, date, available) VALUES
('Beispielprodukt 1', '/images/dress.png', 2, 1, 49.99, 59.99, '2024-05-06 15:31:03.660153', true),
('Beispielprodukt 2', '/images/shirt.png', 1, 2, 29.99, 39.99, '2024-05-06 15:31:03.662069', true);


-- Assuming the first user (id = 1) is the user for the order
INSERT INTO public.orders (user_id, total_amount, status) VALUES
(2, 1, 'pending');

--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Assuming the first order (id = 1) and first product (id = 1)
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 49.99);
