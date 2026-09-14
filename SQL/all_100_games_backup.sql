--
-- PostgreSQL database dump
--

\restrict 6mBefhjunwrTjqhCJjC9cEqbG1p483CFhu4nxRVPr7r2YdHlxDDmgabMRosGWUA

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: developers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.developers (
    developer_id integer NOT NULL,
    developer_name character varying(100) NOT NULL,
    country character varying(50),
    founded_year integer
);


ALTER TABLE public.developers OWNER TO postgres;

--
-- Name: developers_developer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.developers ALTER COLUMN developer_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.developers_developer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gamegenres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamegenres (
    game_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.gamegenres OWNER TO postgres;

--
-- Name: gamemodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamemodes (
    mode_id integer NOT NULL,
    mode_name character varying(50) NOT NULL
);


ALTER TABLE public.gamemodes OWNER TO postgres;

--
-- Name: gamemodes_mode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.gamemodes ALTER COLUMN mode_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.gamemodes_mode_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gamemodesrelation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamemodesrelation (
    game_id integer NOT NULL,
    mode_id integer NOT NULL
);


ALTER TABLE public.gamemodesrelation OWNER TO postgres;

--
-- Name: gameplatforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameplatforms (
    game_id integer NOT NULL,
    platform_id integer NOT NULL
);


ALTER TABLE public.gameplatforms OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    game_id integer NOT NULL,
    game_name character varying(150) NOT NULL,
    developer_id integer NOT NULL,
    publisher_id integer NOT NULL,
    release_date date,
    rating numeric(3,1),
    price numeric(8,2),
    is_free_to_play boolean DEFAULT false,
    description text,
    play_status character varying(20) DEFAULT 'not_started'::character varying,
    is_bookmarked boolean DEFAULT false,
    is_favorited boolean DEFAULT false,
    cover_image character varying(255),
    game_engine character varying(100),
    CONSTRAINT games_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT games_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: games_game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.games ALTER COLUMN game_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.games_game_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gamestory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamestory (
    game_id integer NOT NULL,
    story_id integer NOT NULL
);


ALTER TABLE public.gamestory OWNER TO postgres;

--
-- Name: genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genres (
    genre_id integer NOT NULL,
    genre_name character varying(50) NOT NULL
);


ALTER TABLE public.genres OWNER TO postgres;

--
-- Name: genres_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.genres ALTER COLUMN genre_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.genres_genre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platforms (
    platform_id integer NOT NULL,
    platform_name character varying(50) NOT NULL
);


ALTER TABLE public.platforms OWNER TO postgres;

--
-- Name: platforms_platform_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.platforms ALTER COLUMN platform_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.platforms_platform_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: publishers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publishers (
    publisher_id integer NOT NULL,
    publisher_name character varying(100) NOT NULL,
    country character varying(50)
);


ALTER TABLE public.publishers OWNER TO postgres;

--
-- Name: publishers_publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.publishers ALTER COLUMN publisher_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.publishers_publisher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: storytypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storytypes (
    story_id integer NOT NULL,
    story_type character varying(50) NOT NULL
);


ALTER TABLE public.storytypes OWNER TO postgres;

--
-- Name: storytypes_story_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.storytypes ALTER COLUMN story_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.storytypes_story_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: systemrequirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.systemrequirements (
    requirement_id integer NOT NULL,
    game_id integer NOT NULL,
    operating_system character varying(100),
    minimum_cpu character varying(100),
    minimum_gpu character varying(100),
    minimum_ram character varying(20),
    minimum_storage character varying(20),
    recommended_cpu character varying(100),
    recommended_gpu character varying(100),
    recommended_ram character varying(20),
    recommended_storage character varying(20)
);


ALTER TABLE public.systemrequirements OWNER TO postgres;

--
-- Name: systemrequirements_requirement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.systemrequirements ALTER COLUMN requirement_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.systemrequirements_requirement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: developers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.developers (developer_id, developer_name, country, founded_year) FROM stdin;
1	The Game Kitchen	Spain	2010
2	FromSoftware	Japan	1986
3	Larian Studios	Belgium	1996
4	Rockstar North	United Kingdom	1988
5	Rockstar Games	United States	1998
6	CD Projekt Red	Poland	2002
7	Game Science	China	2014
8	Team Cherry	Australia	2014
9	Supergiant Games	United States	2009
10	Motion Twin	France	2001
11	Mojang Studios	Sweden	2009
12	Re-Logic	United States	2011
13	ConcernedApe	United States	2012
14	Hello Games	United Kingdom	2008
15	Unknown Worlds Entertainment	United States	2002
16	Iron Gate Studio	Sweden	2018
17	Santa Monica Studio	United States	1999
18	Sucker Punch Productions	United States	1997
19	Insomniac Games	United States	1994
20	Guerrilla Games	Netherlands	2000
21	Round8 Studio	South Korea	2015
22	Capcom	Japan	1979
23	id Software	United States	1991
24	Atlus	Japan	1986
25	Square Enix	Japan	2003
26	Arrowhead Game Studios	Sweden	2008
27	Valve	United States	1996
28	Riot Games	United States	2006
29	Epic Games	United States	1991
30	PUBG Corporation	South Korea	2017
31	Respawn Entertainment	United States	2010
32	Ubisoft Montreal	Canada	1997
33	Maddy Makes Games	Canada	2013
34	Moon Studios	Austria	2010
35	Ubisoft Toronto	Canada	\N
36	Bethesda Game Studios	USA	\N
37	Obsidian Entertainment	USA	\N
38	Naughty Dog	USA	\N
39	Kojima Productions	Japan	\N
40	Remedy Entertainment	Finland	\N
41	BioWare	Canada	\N
42	Ubisoft Quebec	Canada	\N
43	Ubisoft Bordeaux	France	\N
44	Rocksteady Studios	UK	\N
45	Irrational Games	USA	\N
46	Arkane Studios	France	\N
47	IO Interactive	Denmark	\N
48	343 Industries	USA	\N
49	Infinity Ward	USA	\N
50	Raven Software	USA	\N
51	DICE	Sweden	\N
52	Playground Games	UK	\N
53	Criterion Games	UK	\N
54	Rare	UK	\N
55	Pocketpair	Japan	\N
56	Zeekerss	USA	\N
57	Ghost Ship Games	Denmark	\N
58	MegaCrit	USA	\N
59	LocalThunk	Canada	\N
60	Red Candle Games	Taiwan	\N
61	MINTROCKET	South Korea	\N
62	Studio MDHR	Canada	\N
63	Hazelight Studios	Sweden	\N
64	Mobius Digital	USA	\N
65	ZA/UM	UK	\N
\.


--
-- Data for Name: gamegenres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamegenres (game_id, genre_id) FROM stdin;
1	1
1	13
1	19
2	1
2	3
2	5
2	6
3	3
3	2
3	16
4	1
4	2
4	6
5	1
5	2
5	6
6	1
6	3
6	6
7	1
7	2
7	3
7	6
8	1
8	3
8	5
9	1
9	2
9	13
10	1
10	3
10	15
11	1
11	13
11	15
12	7
12	12
12	2
13	1
13	2
13	7
13	12
14	3
14	17
15	2
15	6
15	7
15	12
16	2
16	6
16	12
17	2
17	6
17	7
17	12
18	1
18	2
19	1
19	2
20	1
20	2
20	6
20	21
21	1
21	2
21	6
22	1
22	2
22	6
23	1
23	2
23	3
23	6
24	1
24	2
24	3
24	6
25	1
25	2
25	5
26	1
26	3
26	5
27	1
27	3
27	5
28	1
28	3
28	5
28	20
29	1
29	3
29	5
30	1
30	20
30	9
31	1
31	20
31	8
32	1
32	8
33	1
33	8
34	3
34	4
35	1
35	3
35	4
36	1
36	3
36	4
37	1
37	3
38	1
38	3
39	1
39	9
40	1
40	8
41	1
41	8
42	10
42	16
44	1
44	9
44	11
45	1
45	9
45	11
46	1
46	8
46	11
47	1
47	8
47	16
48	8
48	18
49	19
49	2
50	1
50	2
50	13
50	19
51	1
51	2
51	8
51	6
51	21
52	1
52	2
52	8
52	6
52	21
53	1
53	2
53	8
53	6
53	21
54	1
54	2
54	8
54	6
54	21
55	1
55	2
55	6
55	12
56	1
56	3
56	6
56	2
57	1
57	3
57	6
57	8
58	1
58	3
58	6
59	1
59	3
59	6
59	8
60	1
60	2
60	20
60	21
60	9
61	1
61	2
61	20
61	21
61	9
62	1
62	2
62	9
62	19
63	1
63	2
63	6
63	9
64	1
64	2
64	20
64	9
65	1
65	2
65	9
65	13
66	1
66	3
66	9
66	2
67	1
67	3
67	6
67	2
68	1
68	9
68	17
69	1
69	2
69	5
69	13
70	1
70	2
70	5
70	13
71	1
71	3
71	6
71	2
72	1
72	3
72	6
72	2
73	1
73	2
73	21
73	6
74	1
74	2
74	6
74	21
75	1
75	2
75	6
75	21
76	1
76	8
76	2
77	1
77	21
77	2
77	8
78	1
78	8
78	3
78	20
79	1
79	21
79	16
80	1
80	21
80	6
80	9
81	1
81	8
81	6
82	1
82	8
83	1
83	8
83	11
84	1
84	8
85	1
85	8
85	19
86	22
86	6
86	23
86	17
87	22
87	1
87	6
88	1
88	2
88	6
88	12
89	1
89	2
89	6
89	12
89	7
90	1
90	20
90	12
91	1
91	8
92	25
92	14
92	16
93	25
93	15
93	16
93	18
94	1
94	14
94	15
94	3
95	1
95	13
95	5
95	19
96	2
96	3
96	17
97	1
97	19
98	1
98	2
98	19
98	18
99	2
99	6
99	18
100	3
100	2
100	24
\.


--
-- Data for Name: gamemodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamemodes (mode_id, mode_name) FROM stdin;
1	Single Player
2	Multiplayer
3	Co-op
4	PvP
5	PvE
6	MMO
7	Local Co-op
\.


--
-- Data for Name: gamemodesrelation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamemodesrelation (game_id, mode_id) FROM stdin;
1	1
2	1
2	2
2	3
2	4
3	1
3	2
3	3
4	1
4	2
5	1
5	2
5	3
6	1
7	1
8	1
9	1
10	1
11	1
12	1
12	2
12	3
12	4
12	7
13	1
13	2
13	3
14	1
14	2
14	3
15	1
15	2
15	3
16	1
17	1
17	2
17	3
18	1
19	1
20	1
20	2
20	3
21	1
22	1
23	1
24	1
25	1
26	1
26	2
26	3
26	4
27	1
27	2
27	3
27	4
28	1
28	2
28	3
28	4
29	1
30	1
31	1
32	1
32	2
32	4
33	1
33	2
33	4
34	1
35	1
36	1
37	1
37	2
37	3
38	1
38	2
38	3
39	1
39	2
39	3
39	5
40	2
40	4
41	2
41	4
42	2
42	4
44	2
44	3
44	4
45	2
45	4
46	2
46	4
47	2
47	3
47	4
47	5
48	1
48	3
48	7
49	1
50	1
51	1
51	2
51	3
52	1
52	3
52	2
53	1
53	3
53	2
54	1
54	3
55	1
56	1
57	1
58	1
59	1
60	1
61	1
62	1
63	1
63	2
64	1
65	1
66	1
67	1
68	1
68	4
69	1
70	1
71	1
72	1
73	1
74	1
75	1
76	1
77	1
78	1
79	1
80	1
80	2
80	4
81	1
81	2
81	4
81	3
82	1
82	2
82	3
82	4
83	2
83	4
83	3
84	2
84	4
84	3
85	1
85	2
85	4
85	3
86	1
86	2
86	4
86	3
87	1
87	2
87	4
88	2
88	3
88	4
88	6
89	1
89	2
89	3
90	3
90	2
91	3
91	2
91	1
92	1
93	1
94	1
95	1
96	1
97	1
97	3
97	7
98	3
98	7
99	1
100	1
\.


--
-- Data for Name: gameplatforms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameplatforms (game_id, platform_id) FROM stdin;
1	1
1	2
1	4
1	6
2	1
2	2
2	3
2	4
2	5
3	1
3	2
3	4
4	1
4	3
4	5
5	1
5	2
5	3
5	4
5	5
6	1
6	2
6	3
6	4
6	5
7	1
7	2
7	3
7	4
7	5
7	6
8	1
8	2
9	1
9	3
9	5
9	6
10	1
10	2
10	3
10	4
10	5
10	6
11	1
11	3
11	5
11	6
11	7
11	8
12	1
12	2
12	3
12	4
12	5
12	6
12	7
12	8
13	1
13	3
13	5
13	6
13	7
13	8
14	1
14	3
14	5
14	6
14	7
14	8
15	1
15	2
15	3
15	4
15	5
15	6
16	1
16	2
16	3
16	4
16	5
16	6
17	1
17	4
17	5
18	1
18	3
19	1
19	2
19	3
20	1
20	2
20	3
21	1
21	2
22	1
22	2
23	1
23	3
24	1
24	2
24	3
25	1
25	3
25	5
26	1
26	3
26	5
26	6
27	1
27	3
27	5
28	3
29	1
29	2
29	3
29	4
29	5
30	1
30	2
30	3
30	4
31	1
31	2
31	3
31	4
31	5
32	1
32	2
32	3
32	4
32	5
32	6
33	1
33	3
33	5
33	6
34	1
34	2
34	3
34	4
34	5
34	6
35	1
35	2
35	3
36	1
36	2
37	1
37	3
37	5
38	1
38	2
38	3
38	4
38	5
38	6
39	1
39	2
40	1
41	1
41	2
41	4
42	1
44	1
44	2
44	3
44	4
44	5
44	6
44	7
45	1
45	2
45	3
45	4
45	5
46	1
46	2
46	3
46	4
46	5
46	6
47	1
47	2
47	3
47	4
47	5
48	1
49	1
49	3
49	5
49	6
50	1
50	4
50	5
50	6
51	1
51	3
51	5
52	1
52	3
52	5
53	1
53	3
53	5
54	1
54	2
54	3
54	4
54	5
55	1
55	3
55	5
56	1
56	2
56	3
56	4
56	5
56	6
57	1
57	2
57	3
57	4
57	5
58	1
58	5
59	1
59	4
60	1
60	2
61	2
62	1
62	2
63	1
63	2
63	8
64	1
64	2
64	4
65	1
65	2
65	3
65	4
65	5
66	1
66	3
66	5
67	1
67	2
67	4
68	1
68	2
68	3
68	4
68	5
69	1
69	2
69	3
69	4
69	5
70	1
70	2
70	4
71	1
71	3
71	5
71	6
72	1
72	2
72	3
72	4
72	5
73	1
73	2
73	3
73	4
73	5
73	8
74	1
74	3
74	5
74	6
75	1
75	3
75	5
76	1
76	3
76	5
76	6
77	1
77	3
77	5
78	1
78	3
78	5
79	1
79	2
79	3
79	4
79	5
79	6
80	1
80	3
80	5
81	1
81	4
81	5
82	1
82	2
82	3
82	4
82	5
83	1
83	2
83	3
83	4
83	5
84	1
84	2
84	3
84	4
84	5
85	1
85	3
85	5
86	1
86	4
86	5
87	1
87	2
87	4
88	1
88	2
88	4
88	5
89	1
89	2
89	4
89	5
90	1
91	1
91	2
91	3
91	4
91	5
92	1
92	3
92	5
92	6
92	7
92	8
93	1
93	2
93	3
93	4
93	6
93	7
93	8
94	1
95	1
95	2
95	4
95	6
96	1
96	2
96	3
96	6
97	1
97	3
97	5
97	6
98	1
98	2
98	3
98	4
98	5
98	6
99	1
99	2
99	3
99	4
99	5
99	6
100	1
100	2
100	3
100	4
100	5
100	6
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (game_id, game_name, developer_id, publisher_id, release_date, rating, price, is_free_to_play, description, play_status, is_bookmarked, is_favorited, cover_image, game_engine) FROM stdin;
2	Elden Ring	2	2	2022-02-25	9.5	59.99	f	An epic open-world action RPG created by FromSoftware and George R.R. Martin, set in the vast and mysterious Lands Between.	not_started	f	f	/static/images/game_2.jpg	\N
16	Subnautica	15	14	2018-01-23	8.8	29.99	f	An underwater survival adventure game set on an alien ocean world, where players must explore, craft, and survive in a beautiful yet dangerous environment.	not_started	f	f	/static/images/game_16.jpg	\N
17	Valheim	16	15	2021-02-02	8.5	19.99	f	A Viking survival and exploration game set in a procedurally generated purgatory inspired by Norse mythology.	not_started	f	f	/static/images/game_17.jpg	\N
18	God of War	17	16	2018-04-20	9.6	49.99	f	A cinematic action-adventure following Kratos and his son Atreus on a deeply personal journey through the realms of Norse mythology.	not_started	f	f	/static/images/game_18.jpg	\N
19	God of War Ragnarok	17	16	2022-11-09	9.4	59.99	f	The epic conclusion to the Norse saga follows Kratos and Atreus as they face the prophesied end of the world, Ragnarok.	not_started	f	f	/static/images/game_19.jpg	\N
20	Ghost of Tsushima	18	16	2020-07-17	9.3	59.99	f	An open-world action-adventure set in feudal Japan during the Mongol invasion, following samurai Jin Sakai as he becomes the legendary Ghost.	not_started	f	f	/static/images/game_20.jpg	\N
21	Marvel's Spider-Man Remastered	19	16	2020-11-12	9.0	59.99	f	An open-world action-adventure where players swing through a stunning recreation of Marvel's New York City as the iconic Spider-Man.	not_started	f	f	/static/images/game_21.jpg	\N
22	Marvel's Spider-Man 2	19	16	2023-10-20	9.0	69.99	f	An expanded open-world adventure featuring both Peter Parker and Miles Morales as they face new threats across Marvel's New York.	not_started	f	f	/static/images/game_22.jpg	\N
23	Horizon Zero Dawn	20	16	2017-02-28	8.9	49.99	f	An action RPG set in a post-apocalyptic world overrun by robotic creatures, following hunter Aloy as she uncovers her mysterious origins.	not_started	f	f	/static/images/game_23.jpg	\N
24	Horizon Forbidden West	20	16	2022-02-18	8.7	59.99	f	Aloy ventures into the deadly Forbidden West to find the source of a mysterious plague threatening all life, facing new machines and factions.	not_started	f	f	/static/images/game_24.jpg	\N
25	Sekiro: Shadows Die Twice	2	17	2019-03-22	9.2	59.99	f	A punishing action-adventure set in Sengoku-era Japan, following a shinobi on a quest to rescue his kidnapped lord and exact revenge.	not_started	f	f	/static/images/game_25.jpg	\N
26	Dark Souls Remastered	2	2	2018-05-25	8.5	39.99	f	The definitive edition of the genre-defining action RPG set in the dark fantasy kingdom of Lordran, known for its challenging combat and interconnected world.	not_started	f	f	/static/images/game_26.jpg	\N
27	Dark Souls III	2	2	2016-04-12	9.1	59.99	f	The final entry in the acclaimed Dark Souls trilogy, featuring faster combat and expansive, interconnected dark fantasy environments.	not_started	f	f	/static/images/game_27.jpg	\N
29	Lies of P	21	18	2023-09-19	8.4	59.99	f	A Soulslike action RPG inspired by the story of Pinocchio, set in a dark Belle Epoque world overrun by rogue puppets.	not_started	f	f	/static/images/game_29.jpg	\N
30	Resident Evil 4 Remake	22	19	2023-03-24	9.3	59.99	f	A reimagining of the survival horror classic, following Leon S. Kennedy on a mission to rescue the president's daughter from a sinister rural cult.	not_started	f	f	/static/images/game_30.jpg	\N
31	Resident Evil Village	22	19	2021-05-07	8.5	39.99	f	A first-person survival horror game following Ethan Winters as he searches for his kidnapped daughter in a mysterious European village.	not_started	f	f	/static/images/game_31.jpg	\N
32	DOOM Eternal	23	20	2020-03-20	9.0	39.99	f	A relentless first-person shooter where the Doom Slayer battles the demonic hordes of Hell across dimensions in fast-paced, brutal combat.	not_started	f	f	/static/images/game_32.jpg	\N
33	DOOM	23	20	2016-05-13	8.8	19.99	f	A return to the franchise's roots, delivering fast, brutal first-person combat as the Doom Slayer rips and tears through Hell's forces on Mars.	not_started	f	f	/static/images/game_33.jpg	\N
34	Persona 5 Royal	24	21	2020-03-31	9.5	59.99	f	A stylish JRPG following a group of high school students who awaken to supernatural powers and fight corruption as the Phantom Thieves.	not_started	f	f	/static/images/game_34.jpg	\N
35	Final Fantasy VII Remake	25	22	2020-04-10	8.9	69.99	f	A stunning reimagining of the classic JRPG, expanding the story of Cloud Strife and the eco-terrorist group AVALANCHE in the city of Midgar.	not_started	f	f	/static/images/game_35.jpg	\N
36	Final Fantasy XVI	25	22	2023-06-22	8.5	69.99	f	An action-oriented RPG set in the realm of Valisthea, following Clive Rosfield on a dark, politically charged quest for revenge and redemption.	not_started	f	f	/static/images/game_36.jpg	\N
37	Monster Hunter: World	22	19	2018-01-26	9.1	29.99	f	An action RPG where players hunt massive monsters across diverse ecosystems, crafting powerful gear from their spoils.	not_started	f	f	/static/images/game_37.jpg	\N
38	Monster Hunter Rise	22	19	2021-03-26	8.3	39.99	f	A fast-paced action RPG featuring new Wirebug mechanics and the ability to ride monsters in thrilling hunts across stunning environments.	not_started	f	f	/static/images/game_38.jpg	\N
39	Helldivers 2	26	16	2024-02-08	8.5	39.99	f	A cooperative third-person shooter where players fight for Super Earth against alien threats in chaotic, friendly-fire-enabled missions.	not_started	f	f	/static/images/game_39.jpg	\N
40	Counter-Strike 2	27	23	2023-09-27	7.5	0.00	t	The latest evolution of the legendary tactical FPS, featuring upgraded visuals, responsive smokes, and refined competitive gameplay.	not_started	f	f	/static/images/game_40.jpg	\N
45	PUBG: Battlegrounds	30	26	2017-12-20	7.2	0.00	t	The pioneering battle royale shooter that drops 100 players onto a shrinking map to fight for survival using scavenged weapons and equipment.	not_started	t	f	/static/images/game_45.jpg	\N
46	Apex Legends	31	27	2019-02-04	8.0	0.00	t	A free-to-play battle royale FPS featuring unique Legends with powerful abilities, squad-based gameplay, and fluid movement mechanics.	not_started	f	f	/static/images/game_46.jpg	\N
47	Rainbow Six Siege	32	28	2015-12-01	8.0	19.99	f	A tactical FPS focused on environmental destruction, team coordination, and operator abilities in intense close-quarters combat scenarios.	playing	t	t	/static/images/game_47.jpg	\N
43	Dota 2	27	23	2013-07-09	8.5	\N	t	A complex MOBA featuring over 100 unique heroes, deep strategic gameplay, and one of the largest esports scenes in gaming.	not_started	t	f	/static/images/game_43.jpg	\N
74	Batman: Arkham Knight	44	31	2015-06-23	9.1	19.99	f	The explosive finale to the Arkham trilogy. Scarecrow returns to unite an imposing roster of super villains, while Batman pilots the legendary drivable Batmobile.	completed	t	t	/static/images/game_74.jpg	Unreal Engine 3
1	Blasphemous 2	1	1	2023-08-24	8.2	29.99	f	A brutal action-platformer set in a dark fantasy world of twisted religious imagery, featuring intense Metroidvania exploration and challenging combat.	playing	t	t	/static/images/game_1.jpg	\N
3	Baldur's Gate 3	3	3	2023-08-03	9.6	59.99	f	A sprawling RPG based on Dungeons & Dragons, offering deep character customization, turn-based combat, and a richly branching narrative.	not_started	f	f	/static/images/game_3.jpg	\N
4	Red Dead Redemption 2	5	4	2018-10-26	9.7	39.99	f	An epic tale of life in America's unforgiving heartland, following outlaw Arthur Morgan and the Van der Linde gang on the run across a vast open world.	not_started	f	f	/static/images/game_4.jpg	\N
5	Grand Theft Auto V	4	4	2013-09-17	9.5	29.99	f	An ambitious open-world action game set in the sprawling city of Los Santos, following three protagonists through an interconnected criminal underworld.	not_started	f	f	/static/images/game_5.jpg	\N
6	Cyberpunk 2077	6	5	2020-12-10	8.6	29.99	f	An open-world RPG set in the dystopian Night City, where players take on the role of V, a mercenary outlaw going after a one-of-a-kind implant.	not_started	f	f	/static/images/game_6.jpg	\N
7	The Witcher 3: Wild Hunt	6	5	2015-05-19	9.5	39.99	f	An award-winning open-world RPG following Geralt of Rivia as he searches for his adopted daughter while navigating a war-torn fantasy world.	not_started	f	f	/static/images/game_7.jpg	\N
8	Black Myth: Wukong	7	6	2024-08-20	8.8	59.99	f	An action RPG rooted in Chinese mythology, following the Destined One on a journey inspired by the classic novel Journey to the West.	not_started	f	f	/static/images/game_8.jpg	\N
9	Hollow Knight	8	7	2017-02-24	9.3	14.99	f	A beautifully crafted action-adventure Metroidvania set in the vast, interconnected underground kingdom of Hallownest.	not_started	f	f	/static/images/game_9.jpg	\N
10	Hades	9	8	2020-09-17	9.3	24.99	f	A roguelite dungeon crawler where you defy the god of the dead as you hack and slash your way out of the Underworld of Greek myth.	not_started	f	f	/static/images/game_10.jpg	\N
11	Dead Cells	10	9	2018-08-07	8.7	24.99	f	A roguelite Metroidvania action-platformer featuring procedurally generated levels and intense, fast-paced combat.	not_started	f	f	/static/images/game_11.jpg	\N
12	Minecraft	11	10	2011-11-18	9.0	29.99	f	A sandbox survival game where players explore, gather resources, craft tools, and build anything they can imagine in a procedurally generated block world.	not_started	f	f	/static/images/game_12.jpg	\N
13	Terraria	12	11	2011-05-16	9.2	9.99	f	A 2D sandbox adventure game featuring exploration, crafting, building, and combat in a procedurally generated world.	not_started	f	f	/static/images/game_13.jpg	\N
14	Stardew Valley	13	12	2016-02-26	9.4	14.99	f	A farming simulation RPG where players inherit a run-down farm and work to restore it while building relationships in a charming rural community.	not_started	f	f	/static/images/game_14.jpg	\N
28	Bloodborne	2	16	2015-03-24	9.4	19.99	f	A gothic action RPG set in the nightmarish city of Yharnam, featuring aggressive, fast-paced combat and Lovecraftian horror.	not_started	f	f	/static/images/game_28.jpg	\N
41	Valorant	28	24	2020-06-02	7.8	0.00	t	A tactical 5v5 character-based FPS where precise gunplay meets unique agent abilities in competitive team-based matches.	not_started	t	f	/static/images/game_41.jpg	\N
42	League of Legends	28	24	2009-10-27	8.0	0.00	t	A team-based MOBA where two teams of five champions compete to destroy the opposing team's Nexus in strategic, fast-paced battles.	wont_play	f	f	/static/images/game_42.jpg	\N
44	Fortnite	29	25	2017-07-25	7.5	0.00	t	A free-to-play battle royale game featuring building mechanics, vibrant visuals, and frequent crossover events with popular culture franchises.	not_started	f	f	/static/images/game_44.jpg	\N
15	No Man's Sky	14	13	2016-08-09	8.0	59.99	f	A space exploration survival game set in a procedurally generated universe with billions of planets to discover and explore.	not_started	f	f	/static/images/game_15.jpg	\N
75	Batman: Arkham City	44	31	2011-10-18	9.6	19.99	f	Fly across the super-prison city containing Gotham's most notorious criminals. Featuring an all-star rogue's gallery including Joker, Two-Face, Penguin, and Mr. Freeze.	completed	t	t	/static/images/game_75.jpg	Unreal Engine 3
76	BioShock Infinite	45	32	2013-03-26	9.4	29.99	f	Booker DeWitt must rescue Elizabeth, a mysterious girl imprisoned in the airborne floating city of Columbia. Unravel mind-bending twists of quantum mechanics and devotion.	completed	f	t	/static/images/game_76.jpg	Unreal Engine 3
77	Dishonored 2	46	20	2016-11-11	9.0	29.99	f	Play as Emily Kaldwin or Corvo Attano in the coastal city of Karnaca. Use supernatural abilities and gadgetry to combine lethal assassinations or non-lethal stealth.	completed	f	t	/static/images/game_77.jpg	Void Engine
78	Prey	46	20	2017-05-05	8.8	29.99	f	Awaken aboard Talos I, a lavish space station overrun by shapeshifting alien Typhon. Use your wits, weapons, and mind-bending abilities to survive.	play_later	t	f	/static/images/game_78.jpg	CryEngine
79	Hitman World of Assassination	47	33	2021-01-20	9.1	69.99	f	Enter the world of the ultimate assassin. Become Agent 47 in the definitive assassination sandbox featuring over 20 lavish international locations, disguises, and creative kills.	playing	t	t	/static/images/game_79.jpg	Glacier Engine
80	Metal Gear Solid V: The Phantom Pain	39	34	2015-09-01	9.3	19.99	f	Big Boss awakens from a nine-year coma to establish a private army known as Diamond Dogs. Experience groundbreaking open-world stealth tactical freedom across Afghanistan and Africa.	completed	f	t	/static/images/game_80.jpg	Fox Engine
81	Halo Infinite	48	10	2021-11-15	8.5	59.99	f	When all hope is lost, Master Chief confronts the ruthless Banished on the open ringworld Zeta Halo, wielding the grappleshot to revolutionize combat traversal.	playing	f	f	/static/images/game_81.jpg	Slipspace Engine
82	Call of Duty: Modern Warfare II	49	17	2022-10-28	8.0	69.99	f	Task Force 141 returns with Captain Price, Ghost, and Soap tackling international cartel smuggling across a cinematic globe-spanning campaign and competitive multiplayer.	playing	f	f	/static/images/game_82.jpg	IW 9.0
83	Call of Duty: Warzone	50	17	2020-03-10	7.9	0.00	t	Massive free-to-play battle royale featuring up to 150 players, the Gulag redeployment arena, weapon loadouts, and intense extraction shootouts.	playing	f	f	/static/images/game_83.jpg	IW 9.0
84	Battlefield 2042	51	27	2021-11-19	7.1	59.99	f	Experience massive 128-player multiplayer battles with dynamic storms, environmental hazards, wingsuits, and destructive vehicular combat.	not_started	f	f	/static/images/game_84.jpg	Frostbite
85	Titanfall 2	31	27	2016-10-28	9.3	29.99	f	Pilot Jack Cooper and Vanguard-class Titan BT-7274 form an unbreakable bond across one of the highest-rated single-player shooter campaigns in gaming history.	completed	t	t	/static/images/game_85.jpg	Source Engine
86	Forza Horizon 5	52	10	2021-11-09	9.2	59.99	f	Drive hundreds of the world's greatest cars across vibrant Mexican deserts, lush jungles, historic cities, hidden ruins, and an active caldera volcano.	playing	t	t	/static/images/game_86.jpg	ForzaTech
87	Need for Speed Unbound	53	27	2022-12-02	7.6	69.99	f	Tear up the streets of Lakeshore with graffiti-inspired visual bursts, high-speed cop chases, and underground drift meets.	not_started	f	f	/static/images/game_87.jpg	Frostbite
88	Sea of Thieves	54	10	2018-03-20	8.6	39.99	f	Sail, fight, dig for treasure, and drink grog on the open seas with your crew in this ultimate pirate sandbox where every ship on the horizon is player-controlled.	playing	f	t	/static/images/game_88.jpg	Unreal Engine 4
89	Palworld	55	35	2024-01-19	8.7	29.99	f	Collect mysterious creatures called Pals to fight, build bases, automate factories, and explore a vast wilderness in this explosive viral survival phenomenon.	playing	t	f	/static/images/game_89.jpg	Unreal Engine 5
48	Portal 2	27	23	2011-04-19	9.6	9.99	f	A brilliant first-person puzzle game featuring innovative portal mechanics, witty writing, and a cooperative campaign alongside a compelling single-player story.	not_started	f	f	/static/images/game_48.jpg	\N
49	Celeste	33	29	2018-01-25	9.2	19.99	f	A critically acclaimed precision platformer following Madeline as she climbs the titular mountain, tackling themes of mental health and self-discovery.	completed	t	f	/static/images/game_49.jpg	\N
50	Ori and the Will of the Wisps	34	10	2020-03-11	9.2	29.99	f	A visually stunning action-platformer Metroidvania following the spirit Ori on an emotional quest through a beautiful yet dangerous forest.	play_later	t	t	/static/images/game_50.jpg	\N
51	Far Cry 3	32	28	2012-11-29	8.8	19.99	f	Beyond the reach of civilization lies an island governed by violence and suffering where Jason Brody must fight for survival against Vaas Montenegro.	completed	t	t	/static/images/game_51.jpg	Dunia Engine 2
52	Far Cry 4	32	28	2014-11-18	8.5	29.99	f	Hidden in the towering Himalayas lies Kyrat, a country steeped in tradition and violence under the despotic rule of self-appointed king Pagan Min.	not_started	f	f	/static/images/game_52.jpg	Dunia Engine 2
53	Far Cry 5	32	28	2018-03-27	8.2	59.99	f	Welcome to Hope County, Montana, land of the free and the brave, but also home to a fanatical doomsday cult known as Eden's Gate led by Joseph Seed.	play_later	t	f	/static/images/game_53.jpg	Dunia Engine 2
54	Far Cry 6	35	28	2021-10-07	7.9	59.99	f	Welcome to Yara, a tropical paradise frozen in time. As dictator Anton Castillo vows to restore his nation, a modern guerrilla revolution ignites.	not_started	f	f	/static/images/game_54.jpg	Dunia Engine 2
55	Far Cry Primal	32	28	2016-02-23	7.7	29.99	f	Welcome to the Stone Age, an era of extreme danger where giant mammoths and sabretooth tigers rule the Earth and humanity is at the bottom of the food chain.	not_started	f	f	/static/images/game_55.jpg	Dunia Engine 2
56	The Elder Scrolls V: Skyrim Special Edition	36	20	2016-10-28	9.5	39.99	f	Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life with remastered art, volumetric god rays, and dynamic depth of field.	completed	t	t	/static/images/game_56.jpg	Creation Engine
57	Fallout 4	36	20	2015-11-10	8.8	19.99	f	As the sole survivor of Vault 111, enter a post-apocalyptic Boston wasteland destroyed by nuclear war. Rebuild settlements, craft weapons, and decide the fate of the Commonwealth.	playing	t	f	/static/images/game_57.jpg	Creation Engine
58	Fallout: New Vegas	37	20	2010-10-19	9.2	9.99	f	Welcome to New Vegas. It is the kind of town where you dig your own grave prior to being shot in the head and left for dead. Battle for control of the Mojave wasteland and the Hoover Dam.	completed	t	t	/static/images/game_58.jpg	Gamebryo
59	Starfield	36	20	2023-09-06	7.8	69.99	f	Starfield is the first new universe in over 25 years from Bethesda Game Studios. In this next-generation role-playing game set amongst the stars, journey through over 1,000 planets.	play_later	f	f	/static/images/game_59.jpg	Creation Engine 2
60	The Last of Us Part I	38	16	2022-09-02	9.7	69.99	f	Experience the emotional storytelling and unforgettable characters of Joel and Ellie in a ravaged civilization infested with fungal infected and ruthless human survivors.	completed	t	t	/static/images/game_60.jpg	Naughty Dog Engine
61	The Last of Us Part II Remastered	38	16	2024-01-19	9.3	49.99	f	Five years after their dangerous journey across post-pandemic America, Ellie and Joel settle in Wyoming until a traumatic event sends Ellie on an unrelenting quest for vengeance.	playing	t	t	/static/images/game_61.jpg	Naughty Dog Engine
62	Uncharted: Legacy of Thieves Collection	38	16	2022-01-28	9.0	49.99	f	Seek your fortune and leave your mark across cinematic globe-trotting action in remastered editions of Uncharted 4: A Thief's End and Uncharted: The Lost Legacy.	completed	f	t	/static/images/game_62.jpg	Naughty Dog Engine
63	Death Stranding Director's Cut	39	16	2021-09-24	8.9	39.99	f	From visionary creator Hideo Kojima comes a genre-defying journey. Carrying the remnants of our future, Sam Porter Bridges must brave supernatural threats to reconnect a fractured world.	playing	t	f	/static/images/game_63.jpg	Decima Engine
64	Alan Wake 2	40	25	2023-10-27	9.2	49.99	f	A psychological survival horror masterpiece featuring dual perspectives: FBI agent Saga Anderson investigating ritual murders and writer Alan Wake trapped in the Dark Place.	playing	t	t	/static/images/game_64.jpg	Northlight Engine
65	Control	40	30	2019-08-27	8.8	39.99	f	When an otherworldly force invades the Federal Bureau of Control, Jesse Faden becomes the new Director, wielding telekinetic powers and a morphing Service Weapon.	completed	f	t	/static/images/game_65.jpg	Northlight Engine
66	Mass Effect Legendary Edition	41	27	2021-05-14	9.4	59.99	f	Relive the cinematic space opera that defined a generation. Includes all three acclaimed games of Commander Shepard's fight against the Reaper invasion across the galaxy.	completed	t	t	/static/images/game_66.jpg	Unreal Engine 3
67	Dragon's Dogma 2	22	19	2024-03-22	8.6	69.99	f	A narrative-driven action-RPG that challenges players to choose their own journey. Explore a richly detailed fantasy world alongside Pawns, otherworldly AI companions.	not_started	t	f	/static/images/game_67.jpg	RE Engine
68	Armored Core VI: Fires of Rubicon	2	2	2023-08-25	8.9	59.99	f	Assemble and pilot your custom mech through 3D omnidirectional battles on the remote planet Rubicon 3, taking on high-risk mercenary missions for rival corporations.	playing	t	t	/static/images/game_68.jpg	FromSoftware Engine
69	Star Wars Jedi: Fallen Order	31	27	2019-11-15	8.7	39.99	f	An abandoned Padawan must complete his training, develop powerful new Force abilities, and master the art of the lightsaber while staying one step ahead of the Empire's Inquisitors.	completed	f	t	/static/images/game_69.jpg	Unreal Engine 4
70	Star Wars Jedi: Survivor	31	27	2023-04-28	8.8	69.99	f	No longer a Padawan, Cal Kestis has matured into a powerful Jedi Knight. Pushed to the edges of the galaxy by the Empire, he must fight for a sanctuary in the darkness.	playing	t	f	/static/images/game_70.jpg	Unreal Engine 4
71	Assassin's Creed Odyssey	42	28	2018-10-05	8.9	59.99	f	Choose your fate as Alexios or Kassandra. From outcast Spartan mercenary to living Greek hero, embark on an epic journey across ancient Greece during the Peloponnesian War.	completed	t	t	/static/images/game_71.jpg	AnvilNext 2.0
72	Assassin's Creed Valhalla	32	28	2020-11-10	8.4	59.99	f	Lead legendary Viking raids against Saxon strongholds across Dark Age England. Build settlements, customize your raider clan, and secure your clan's glory in Valhalla.	playing	f	f	/static/images/game_72.jpg	AnvilNext 2.0
73	Assassin's Creed Mirage	43	28	2023-10-05	8.1	49.99	f	A heartfelt tribute to the roots of the franchise. Experience the journey of Basim from clever street thief to master assassin through the vibrant golden age of Baghdad.	play_later	t	f	/static/images/game_73.jpg	Ubisoft Anvil
90	Lethal Company	56	36	2023-10-23	9.3	9.99	f	Scavenge industrial scrap on hazardous moons to meet the Company's quota while avoiding terrifying monsters lurking in claustrophobic corridors with proximity voice chat.	playing	t	t	/static/images/game_90.jpg	Unity
91	Deep Rock Galactic	57	15	2020-05-13	9.4	29.99	f	Rock and Stone! 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible procedural alien caves, rich mineral mining, and relentless swarms.	completed	t	t	/static/images/game_91.jpg	Unreal Engine 4
92	Slay the Spire	58	37	2019-01-23	9.6	24.99	f	The definitive deck-building roguelike. Craft a custom deck from hundreds of cards, discover relics of unimaginable power, and scale the ever-shifting Spire.	completed	t	t	/static/images/game_92.jpg	LibGDX
93	Balatro	59	38	2024-02-20	9.7	14.99	f	Hypnotically addictive roguelike poker deckbuilder. Play illegal poker hands, discover 150+ game-breaking jokers, and trigger chain reactions to beat the blinds.	playing	t	t	/static/images/game_93.jpg	LOVE2D
94	Hades II	9	8	2024-05-06	9.5	29.99	f	Play as Melinoe, Princess of the Underworld and sister of Zagreus. Channel ancient witchery to defeat the Titan of Time Chronos in this stunning roguelike sequel.	playing	t	t	/static/images/game_94.jpg	Supergiant Engine
95	Nine Sols	60	39	2024-05-29	9.4	29.99	f	A lore-rich Tao-punk 2D action platformer featuring Sekiro-inspired deflection combat. Explore the forgotten realm of New Kunlun and slay the 9 ancient rulers.	playing	t	t	/static/images/game_95.jpg	Unity
96	Dave the Diver	61	40	2023-06-28	9.3	19.99	f	Explore the mystical Blue Hole by day spearfishing exotic marine life, and manage a buzzing sushi restaurant by night alongside an eccentric cast of friends.	completed	f	t	/static/images/game_96.jpg	Unity
97	Cuphead	62	41	2017-09-29	9.3	19.99	f	Classic run-and-gun action game heavily inspired by 1930s rubber-hose animation. Battle colossal bosses in handcrafted watercolor environments to repay your debt to the Devil.	completed	t	t	/static/images/game_97.jpg	Unity
98	It Takes Two	63	27	2021-03-26	9.6	39.99	f	Game of the Year winner 2021. An inventive pure co-op platform adventure where clashing couple Cody and May are magically transformed into dolls.	completed	f	t	/static/images/game_98.jpg	Unreal Engine 4
99	Outer Wilds	64	42	2019-05-28	9.6	24.99	f	Winner of BAFTA Best Game. Strap on your boots and pilot your ship into an open-world solar system locked in an endless 22-minute time loop. Uncover the secrets of the Nomai.	completed	t	t	/static/images/game_99.jpg	Unity
100	Disco Elysium - The Final Cut	65	43	2021-03-30	9.7	39.99	f	A legendary isometric detective RPG set in the impoverished city of Revachol. Interrogate unforgettable characters, crack murders, or take bribes with full voice acting.	completed	t	t	/static/images/game_100.jpg	Unity
\.


--
-- Data for Name: gamestory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamestory (game_id, story_id) FROM stdin;
1	1
2	2
3	2
4	1
5	1
6	2
7	2
8	1
9	1
10	4
11	4
12	3
13	3
14	3
15	3
16	1
17	3
18	1
19	1
20	1
21	1
22	1
23	1
24	1
25	2
26	2
27	2
28	2
29	2
30	1
31	1
32	1
33	1
34	1
35	1
36	1
37	1
38	1
39	5
40	5
41	5
42	5
44	5
45	5
46	5
47	5
48	1
49	1
50	1
51	1
52	1
53	2
54	1
55	1
56	2
57	2
58	2
59	2
60	1
61	1
62	1
63	1
64	2
65	1
66	2
67	2
68	2
69	1
70	1
71	2
72	2
73	1
74	1
75	1
76	1
77	2
78	2
79	1
80	1
81	1
82	1
83	5
84	5
85	1
86	3
87	1
88	3
89	3
90	4
91	4
92	4
93	5
94	2
95	1
96	1
97	1
98	1
99	2
100	2
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genres (genre_id, genre_name) FROM stdin;
1	Action
2	Adventure
3	RPG
4	JRPG
5	Soulslike
6	Open World
7	Sandbox
8	FPS
9	TPS
10	MOBA
11	Battle Royale
12	Survival
13	Metroidvania
14	Roguelike
15	Roguelite
16	Strategy
17	Simulation
18	Puzzle
19	Platformer
20	Horror
21	Stealth
22	Racing
23	Sports
24	Visual Novel
25	Card Game
\.


--
-- Data for Name: platforms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platforms (platform_id, platform_name) FROM stdin;
1	PC
2	PlayStation 5
3	PlayStation 4
4	Xbox Series X/S
5	Xbox One
6	Nintendo Switch
7	Android
8	iOS
\.


--
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publishers (publisher_id, publisher_name, country) FROM stdin;
1	Team17	United Kingdom
2	Bandai Namco Entertainment	Japan
3	Larian Studios	Belgium
4	Rockstar Games	United States
5	CD Projekt	Poland
6	Game Science	China
7	Team Cherry	Australia
8	Supergiant Games	United States
9	Motion Twin	France
10	Xbox Game Studios	United States
11	Re-Logic	United States
12	ConcernedApe	United States
13	Hello Games	United Kingdom
14	Unknown Worlds Entertainment	United States
15	Coffee Stain Publishing	Sweden
16	Sony Interactive Entertainment	Japan
17	Activision	United States
18	Neowiz Games	South Korea
19	Capcom	Japan
20	Bethesda Softworks	United States
21	Atlus	Japan
22	Square Enix	Japan
23	Valve	United States
24	Riot Games	United States
25	Epic Games	United States
26	Krafton	South Korea
27	Electronic Arts	United States
28	Ubisoft	France
29	Maddy Makes Games	Canada
30	505 Games	Italy
31	Warner Bros. Games	USA
32	2K Games	USA
33	IO Interactive	Denmark
34	Konami	Japan
35	Pocketpair	Japan
36	Zeekerss	USA
37	Humble Games	USA
38	Playstack	UK
39	Red Candle Games	Taiwan
40	MINTROCKET	South Korea
41	Studio MDHR	Canada
42	Annapurna Interactive	USA
43	ZA/UM	UK
\.


--
-- Data for Name: storytypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storytypes (story_id, story_type) FROM stdin;
1	Linear
2	Branching
3	Sandbox
4	Procedural
5	No Story
\.


--
-- Data for Name: systemrequirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.systemrequirements (requirement_id, game_id, operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage, recommended_cpu, recommended_gpu, recommended_ram, recommended_storage) FROM stdin;
1	1	Windows 10	Intel Core i5-4590	NVIDIA GeForce GTX 960 2GB	8 GB	12 GB	Intel Core i7-6700	NVIDIA GeForce GTX 1060 6GB	8 GB	12 GB
2	2	Windows 10	Intel Core i5-8400	NVIDIA GeForce GTX 1060 3GB	12 GB	60 GB	Intel Core i7-8700K	NVIDIA GeForce GTX 1070 8GB	16 GB	60 GB
3	3	Windows 10	Intel Core i5-4690	NVIDIA GeForce GTX 970	8 GB	150 GB	Intel Core i7-8700K	NVIDIA GeForce RTX 2060 Super	16 GB	150 GB
4	4	Windows 10	Intel Core i5-2500K	NVIDIA GeForce GTX 770 2GB	8 GB	150 GB	Intel Core i7-4770K	NVIDIA GeForce GTX 1060 6GB	12 GB	150 GB
5	5	Windows 10	Intel Core 2 Quad Q6600	NVIDIA GeForce 9800 GT 1GB	4 GB	72 GB	Intel Core i5-3470	NVIDIA GeForce GTX 660 2GB	8 GB	72 GB
6	6	Windows 10	Intel Core i7-6700	NVIDIA GeForce GTX 1060 6GB	12 GB	70 GB	Intel Core i7-12700	NVIDIA GeForce RTX 2060	16 GB	70 GB
7	7	Windows 7	Intel Core i5-2500K	NVIDIA GeForce GTX 660	6 GB	50 GB	Intel Core i7-3770	NVIDIA GeForce GTX 770	8 GB	50 GB
8	8	Windows 10	Intel Core i5-8400	NVIDIA GeForce GTX 1060 6GB	16 GB	130 GB	Intel Core i7-12700	NVIDIA GeForce RTX 4060	16 GB	130 GB
9	9	Windows 7	Intel Core 2 Duo E5200	NVIDIA GeForce 9800 GTX+	4 GB	9 GB	Intel Core i5-2300	NVIDIA GeForce GTX 560	8 GB	9 GB
10	10	Windows 7	Intel Core 2 Duo E8400	NVIDIA GeForce GTX 460 1GB	4 GB	15 GB	Intel Core i5-6400	NVIDIA GeForce GTX 1050 2GB	8 GB	15 GB
11	11	Windows 7	Intel Core i5-2300	NVIDIA GeForce GTX 460 1GB	2 GB	2 GB	Intel Core i5-6600	NVIDIA GeForce GTX 660 2GB	4 GB	2 GB
12	12	Windows 10	Intel Core i3-3210	NVIDIA GeForce 400 Series	4 GB	4 GB	Intel Core i5-4690	NVIDIA GeForce 700 Series	8 GB	4 GB
13	13	Windows 7	Intel Core 2 Duo 2.0 GHz	NVIDIA GeForce 9500 GT	4 GB	1 GB	Intel Core i5-2400	NVIDIA GeForce GTX 560	8 GB	1 GB
14	14	Windows 7	Intel Core 2 Duo 2.0 GHz	NVIDIA GeForce 8800 GT 256MB	2 GB	500 MB	Intel Core i5-2400	NVIDIA GeForce GTX 560	4 GB	500 MB
15	15	Windows 10	Intel Core i3-3210	NVIDIA GeForce GTX 480	8 GB	15 GB	Intel Core i5-4690	NVIDIA GeForce GTX 1060 6GB	16 GB	15 GB
16	16	Windows 7	Intel Core i3-530	NVIDIA GeForce GTX 550 Ti	4 GB	20 GB	Intel Core i5-4590	NVIDIA GeForce GTX 970 4GB	8 GB	20 GB
17	17	Windows 7	Intel Core 2 Duo E6550	NVIDIA GeForce GTX 500 Series	4 GB	6 GB	Intel Core i5-6600K	NVIDIA GeForce GTX 970 4GB	8 GB	6 GB
18	18	Windows 10	Intel Core i5-6600K	NVIDIA GeForce GTX 1060 6GB	8 GB	70 GB	Intel Core i7-7700K	NVIDIA GeForce GTX 1070 8GB	16 GB	70 GB
19	19	Windows 10	Intel Core i5-8600	NVIDIA GeForce GTX 1070 8GB	8 GB	90 GB	Intel Core i7-10700K	NVIDIA GeForce RTX 3070	16 GB	90 GB
20	20	Windows 10	Intel Core i5-8600	NVIDIA GeForce GTX 1060 6GB	8 GB	75 GB	Intel Core i7-10700K	NVIDIA GeForce RTX 3070	16 GB	75 GB
21	21	Windows 10	Intel Core i5-6600	NVIDIA GeForce GTX 1060 6GB	8 GB	75 GB	Intel Core i5-10600K	NVIDIA GeForce RTX 3070	16 GB	75 GB
22	22	Windows 10	Intel Core i5-8400	NVIDIA GeForce GTX 1070	8 GB	90 GB	Intel Core i7-12700K	NVIDIA GeForce RTX 3080	16 GB	90 GB
23	23	Windows 10	Intel Core i5-2500K	NVIDIA GeForce GTX 780 3GB	8 GB	100 GB	Intel Core i7-4770K	NVIDIA GeForce GTX 1060 6GB	16 GB	100 GB
24	24	Windows 10	Intel Core i5-8600	NVIDIA GeForce GTX 1060 6GB	16 GB	150 GB	Intel Core i7-10700K	NVIDIA GeForce RTX 3070	16 GB	150 GB
25	25	Windows 7	Intel Core i5-2500K	NVIDIA GeForce GTX 760	4 GB	25 GB	Intel Core i5-4690K	NVIDIA GeForce GTX 970	8 GB	25 GB
26	26	Windows 7	Intel Core i5-2300	NVIDIA GeForce GTX 460 1GB	6 GB	8 GB	Intel Core i5-4570	NVIDIA GeForce GTX 660 2GB	8 GB	8 GB
27	27	Windows 7	Intel Core i5-2500K	NVIDIA GeForce GTX 750 Ti	4 GB	25 GB	Intel Core i7-3770	NVIDIA GeForce GTX 970	8 GB	25 GB
28	29	Windows 10	Intel Core i5-7500	NVIDIA GeForce GTX 1050 Ti	8 GB	40 GB	Intel Core i7-10700	NVIDIA GeForce RTX 2060	16 GB	40 GB
29	30	Windows 10	Intel Core i5-8400	NVIDIA GeForce GTX 1060 3GB	8 GB	60 GB	Intel Core i7-8700	NVIDIA GeForce RTX 2070	16 GB	60 GB
30	31	Windows 10	Intel Core i5-7500	NVIDIA GeForce GTX 1050 Ti	8 GB	45 GB	Intel Core i7-8700	NVIDIA GeForce GTX 1070	16 GB	45 GB
31	32	Windows 10	Intel Core i5-4590	NVIDIA GeForce GTX 1050 Ti	8 GB	50 GB	Intel Core i7-6700K	NVIDIA GeForce GTX 1080 8GB	8 GB	50 GB
32	33	Windows 7	Intel Core i5-2400	NVIDIA GeForce GTX 670 2GB	8 GB	55 GB	Intel Core i7-3770	NVIDIA GeForce GTX 970 4GB	8 GB	55 GB
33	34	Windows 10	Intel Core i5-2500	NVIDIA GeForce GTX 950	8 GB	41 GB	Intel Core i7-4790	NVIDIA GeForce GTX 1060 6GB	16 GB	41 GB
34	35	Windows 10	Intel Core i5-3330	NVIDIA GeForce GTX 780 3GB	8 GB	100 GB	Intel Core i7-8700	NVIDIA GeForce RTX 2070	12 GB	100 GB
35	36	Windows 10	Intel Core i5-8600	NVIDIA GeForce GTX 1070 8GB	16 GB	170 GB	Intel Core i7-10700	NVIDIA GeForce RTX 2080	16 GB	170 GB
36	37	Windows 7	Intel Core i5-4460	NVIDIA GeForce GTX 760	8 GB	48 GB	Intel Core i7-3770	NVIDIA GeForce GTX 1060 6GB	8 GB	48 GB
37	38	Windows 10	Intel Core i5-4460	NVIDIA GeForce GTX 1060 3GB	8 GB	36 GB	Intel Core i5-10600	NVIDIA GeForce RTX 2060 6GB	8 GB	36 GB
38	39	Windows 10	Intel Core i7-4790K	NVIDIA GeForce GTX 1050 Ti	8 GB	100 GB	Intel Core i9-10900K	NVIDIA GeForce RTX 2060	16 GB	100 GB
39	40	Windows 10	Intel Core i5-6600K	NVIDIA GeForce GTX 1060 6GB	8 GB	85 GB	Intel Core i5-9600K	NVIDIA GeForce RTX 2070	16 GB	85 GB
40	41	Windows 10	Intel Core i3-4150	NVIDIA GeForce GT 730	4 GB	30 GB	Intel Core i5-9400F	NVIDIA GeForce GTX 1050 Ti	8 GB	30 GB
41	42	Windows 7	Intel Core i5-3300	NVIDIA GeForce GTX 560 SE	4 GB	22 GB	Intel Core i5-3570K	NVIDIA GeForce GTX 660	8 GB	22 GB
43	44	Windows 10	Intel Core i3-3225	NVIDIA GeForce GT 420	4 GB	30 GB	Intel Core i5-7300U	NVIDIA GeForce GTX 960	8 GB	30 GB
44	45	Windows 10	Intel Core i5-4430	NVIDIA GeForce GTX 960 2GB	8 GB	40 GB	Intel Core i5-6600K	NVIDIA GeForce GTX 1060 3GB	16 GB	40 GB
45	46	Windows 10	Intel Core i3-6300	NVIDIA GeForce GT 640	6 GB	56 GB	Intel Core i5-3570K	NVIDIA GeForce GTX 970 4GB	8 GB	56 GB
46	47	Windows 10	Intel Core i3-560	NVIDIA GeForce GTX 460	6 GB	61 GB	Intel Core i5-2500K	NVIDIA GeForce GTX 670	8 GB	61 GB
47	48	Windows 7	Intel Core 2 Duo E6600	NVIDIA GeForce 8600 GT 256MB	2 GB	8 GB	Intel Core i5-2400	NVIDIA GeForce GTX 560	4 GB	8 GB
48	49	Windows 7	Intel Core i3-2100	Intel HD Graphics 5200	2 GB	2 GB	Intel Core i5-4590	NVIDIA GeForce GTX 750 Ti	4 GB	2 GB
49	50	Windows 10	Intel Core i5-3570	NVIDIA GeForce GTX 950 2GB	8 GB	20 GB	Intel Core i7-6700K	NVIDIA GeForce GTX 1070 8GB	8 GB	20 GB
42	43	Windows 7	Intel Core 2 Duo E7400	NVIDIA GeForce 8600 GT	4 GB	15 GB	Intel Core i5-4590	NVIDIA GeForce GTX 960	8 GB	15 GB
50	51	Windows 10 64-bit	Intel Core i3-530 2.9 GHz / AMD Phenom II X2	Nvidia GeForce GTX 8800 / AMD Radeon HD 2900	4 GB	15 GB	Intel Core i3-530 2.9 GHz / AMD Phenom II X2	Nvidia GeForce GTX 8800 / AMD Radeon HD 2900	4 GB	15 GB
51	52	Windows 10 64-bit	Intel Core i5-750 2.6 GHz / AMD Phenom II X4 955	Nvidia GeForce GTX 680 / AMD Radeon R9 290X	8 GB	30 GB	Intel Core i5-750 2.6 GHz / AMD Phenom II X4 955	Nvidia GeForce GTX 680 / AMD Radeon R9 290X	8 GB	30 GB
52	53	Windows 10 64-bit	Intel Core i7-4770 3.4 GHz / AMD Ryzen 5 1600	Nvidia GeForce GTX 970 / AMD R9 290X 4GB	8 GB	40 GB	Intel Core i7-4770 3.4 GHz / AMD Ryzen 5 1600	Nvidia GeForce GTX 970 / AMD R9 290X 4GB	8 GB	40 GB
53	54	Windows 10 64-bit	AMD Ryzen 5 3600X / Intel i7-7700	Nvidia GeForce GTX 1080 / AMD RX Vega 64	16 GB	60 GB	AMD Ryzen 5 3600X / Intel i7-7700	Nvidia GeForce GTX 1080 / AMD RX Vega 64	16 GB	60 GB
54	55	Windows 10 64-bit	Intel Core i7-2600K / AMD FX-8350	Nvidia GeForce GTX 780 / AMD Radeon R9 280X	8 GB	20 GB	Intel Core i7-2600K / AMD FX-8350	Nvidia GeForce GTX 780 / AMD Radeon R9 280X	8 GB	20 GB
55	56	Windows 10 64-bit	Intel i5-2400 / AMD FX-8320	Nvidia GTX 780 3GB / AMD R9 290 4GB	8 GB	12 GB	Intel i5-2400 / AMD FX-8320	Nvidia GTX 780 3GB / AMD R9 290 4GB	8 GB	12 GB
56	57	Windows 10 64-bit	Intel Core i7 4790 3.6 GHz / AMD FX-9590 4.7 GHz	NVIDIA GTX 780 3GB / AMD Radeon R9 290X 4GB	8 GB	30 GB	Intel Core i7 4790 3.6 GHz / AMD FX-9590 4.7 GHz	NVIDIA GTX 780 3GB / AMD Radeon R9 290X 4GB	8 GB	30 GB
57	58	Windows 10 64-bit	Dual Core 2.0 GHz	NVIDIA GeForce 6 series / ATI 1300XT series	2 GB	10 GB	Dual Core 2.0 GHz	NVIDIA GeForce 6 series / ATI 1300XT series	2 GB	10 GB
58	59	Windows 10 64-bit	AMD Ryzen 5 3600X / Intel Core i5-10600K	AMD Radeon RX 6800 XT / NVIDIA GeForce RTX 2080	16 GB	125 GB	AMD Ryzen 5 3600X / Intel Core i5-10600K	AMD Radeon RX 6800 XT / NVIDIA GeForce RTX 2080	16 GB	125 GB
59	60	Windows 10 64-bit	AMD Ryzen 5 3600X / Intel Core i7-8700	AMD Radeon RX 6600 XT / NVIDIA GeForce RTX 2070 SUPER	16 GB	100 GB	AMD Ryzen 5 3600X / Intel Core i7-8700	AMD Radeon RX 6600 XT / NVIDIA GeForce RTX 2070 SUPER	16 GB	100 GB
60	61	PlayStation 5 OS	AMD Zen 2 8-core 3.5GHz	AMD RDNA 2 10.28 TFLOPs	16 GB	90 GB	AMD Zen 2 8-core 3.5GHz	AMD RDNA 2 10.28 TFLOPs	16 GB	90 GB
61	62	Windows 10 64-bit	Intel i7-4770 / AMD Ryzen 5 1500X	NVIDIA GTX 1060 6GB / AMD RX 570 4GB	16 GB	126 GB	Intel i7-4770 / AMD Ryzen 5 1500X	NVIDIA GTX 1060 6GB / AMD RX 570 4GB	16 GB	126 GB
62	63	Windows 10 64-bit	Intel Core i7-3770 / AMD Ryzen 5 1600	GeForce GTX 1060 6 GB / AMD Radeon RX 590	8 GB	80 GB	Intel Core i7-3770 / AMD Ryzen 5 1600	GeForce GTX 1060 6 GB / AMD Radeon RX 590	8 GB	80 GB
63	64	Windows 10 64-bit	Ryzen 7 3700X / Intel Core i7-10700K	GeForce RTX 3070 / Radeon RX 6700 XT	16 GB	90 GB	Ryzen 7 3700X / Intel Core i7-10700K	GeForce RTX 3070 / Radeon RX 6700 XT	16 GB	90 GB
64	65	Windows 10 64-bit	Intel Core i5-7600K / AMD Ryzen 5 1600X	Nvidia GeForce GTX 1660 / AMD RX 580	16 GB	42 GB	Intel Core i5-7600K / AMD Ryzen 5 1600X	Nvidia GeForce GTX 1660 / AMD RX 580	16 GB	42 GB
65	66	Windows 10 64-bit	Intel Core i7-7700 / AMD Ryzen 7 3700X	NVIDIA GTX 1070 / Radeon Vega 56	16 GB	120 GB	Intel Core i7-7700 / AMD Ryzen 7 3700X	NVIDIA GTX 1070 / Radeon Vega 56	16 GB	120 GB
66	67	Windows 10 64-bit	Intel Core i7-10700 / AMD Ryzen 5 3600X	NVIDIA GeForce RTX 2080 / AMD Radeon RX 6700	16 GB	100 GB	Intel Core i7-10700 / AMD Ryzen 5 3600X	NVIDIA GeForce RTX 2080 / AMD Radeon RX 6700	16 GB	100 GB
67	68	Windows 10 64-bit	Intel Core i7-7700 / AMD Ryzen 7 2700X	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590	12 GB	60 GB	Intel Core i7-7700 / AMD Ryzen 7 2700X	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590	12 GB	60 GB
68	69	Windows 10 64-bit	Intel i7-6700K / AMD Ryzen 7 1700	GTX 1070 / Radeon RX Vega 56	16 GB	55 GB	Intel i7-6700K / AMD Ryzen 7 1700	GTX 1070 / Radeon RX Vega 56	16 GB	55 GB
69	70	Windows 10 64-bit	Intel Core i5 11600K / Ryzen 5 5600X	RTX 2070 / RX 6700 XT	16 GB	155 GB	Intel Core i5 11600K / Ryzen 5 5600X	RTX 2070 / RX 6700 XT	16 GB	155 GB
70	71	Windows 10 64-bit	AMD FX-8350 / Intel Core i7-3770	AMD Radeon R9 290 / NVIDIA GeForce GTX 970 4GB	8 GB	46 GB	AMD FX-8350 / Intel Core i7-3770	AMD Radeon R9 290 / NVIDIA GeForce GTX 970 4GB	8 GB	46 GB
71	72	Windows 10 64-bit	AMD Ryzen 5 3600XT / Intel i7-8700K	AMD RX 5700XT / NVIDIA GeForce GTX 1080 8GB	16 GB	50 GB	AMD Ryzen 5 3600XT / Intel i7-8700K	AMD RX 5700XT / NVIDIA GeForce GTX 1080 8GB	16 GB	50 GB
72	73	Windows 10 64-bit	Intel Core i7-8700K / AMD Ryzen 5 3600	Intel Arc A750 8GB / NVIDIA GeForce GTX 1660 Ti 6GB	16 GB	40 GB	Intel Core i7-8700K / AMD Ryzen 5 3600	Intel Arc A750 8GB / NVIDIA GeForce GTX 1660 Ti 6GB	16 GB	40 GB
73	74	Windows 10 64-bit	Intel Core i7-3770 3.4 GHz / AMD FX-8350 4.0 GHz	NVIDIA GeForce GTX 760 3GB	8 GB	45 GB	Intel Core i7-3770 3.4 GHz / AMD FX-8350 4.0 GHz	NVIDIA GeForce GTX 760 3GB	8 GB	45 GB
74	75	Windows 10 64-bit	Dual-Core 2.4 GHz	NVIDIA GeForce 8800 GTS / 512MB VRAM	4 GB	17 GB	Dual-Core 2.4 GHz	NVIDIA GeForce 8800 GTS / 512MB VRAM	4 GB	17 GB
75	76	Windows 10 64-bit	Quad Core Processor	ATI Radeon HD 6950 / NVIDIA GeForce GTX 560	4 GB	20 GB	Quad Core Processor	ATI Radeon HD 6950 / NVIDIA GeForce GTX 560	4 GB	20 GB
76	77	Windows 10 64-bit	Intel Core i7-4770 / AMD FX-8350	NVIDIA GTX 1060 6GB / AMD Radeon RX 480 8GB	16 GB	60 GB	Intel Core i7-4770 / AMD FX-8350	NVIDIA GTX 1060 6GB / AMD Radeon RX 480 8GB	16 GB	60 GB
77	78	Windows 10 64-bit	Intel i7-2600K / AMD FX-8350	GTX 970 4GB / AMD R9 290 4GB	16 GB	20 GB	Intel i7-2600K / AMD FX-8350	GTX 970 4GB / AMD R9 290 4GB	16 GB	20 GB
78	79	Windows 10 64-bit	Intel Core i7 4790 4 GHz	AMD Radeon RX Vega 56 8GB / Nvidia GeForce GTX 1070	16 GB	80 GB	Intel Core i7 4790 4 GHz	AMD Radeon RX Vega 56 8GB / Nvidia GeForce GTX 1070	16 GB	80 GB
79	80	Windows 10 64-bit	Intel Core i7-4790 3.60GHz	NVIDIA GeForce GTX 760 2GB	8 GB	28 GB	Intel Core i7-4790 3.60GHz	NVIDIA GeForce GTX 760 2GB	8 GB	28 GB
80	81	Windows 10 64-bit	AMD Ryzen 7 3700X / Intel i7-9700k	Radeon RX 5700 XT / Nvidia RTX 2070	16 GB	50 GB	AMD Ryzen 7 3700X / Intel i7-9700k	Radeon RX 5700 XT / Nvidia RTX 2070	16 GB	50 GB
81	82	Windows 10 64-bit	Intel Core i5-6600K / AMD Ryzen 5 1400	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	12 GB	125 GB	Intel Core i5-6600K / AMD Ryzen 5 1400	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	12 GB	125 GB
82	83	Windows 10 64-bit	Intel Core i5-6600K / AMD Ryzen 5 1400	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	12 GB	125 GB	Intel Core i5-6600K / AMD Ryzen 5 1400	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	12 GB	125 GB
83	84	Windows 10 64-bit	AMD Ryzen 7 2700X / Intel Core i7 4790	AMD Radeon RX 6600 XT / Nvidia GeForce RTX 3060	16 GB	100 GB	AMD Ryzen 7 2700X / Intel Core i7 4790	AMD Radeon RX 6600 XT / Nvidia GeForce RTX 3060	16 GB	100 GB
84	85	Windows 10 64-bit	Intel Core i5-6600 or equivalent	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 8GB	16 GB	45 GB	Intel Core i5-6600 or equivalent	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 8GB	16 GB	45 GB
85	86	Windows 10 64-bit	Intel i5-8400 / AMD Ryzen 5 1500X	NVidia GTX 1070 / AMD RX 590	16 GB	110 GB	Intel i5-8400 / AMD Ryzen 5 1500X	NVidia GTX 1070 / AMD RX 590	16 GB	110 GB
86	87	Windows 10 64-bit	Ryzen 5 3600 / Core i7-8700	Radeon RX 5700 / GeForce RTX 2070	16 GB	50 GB	Ryzen 5 3600 / Core i7-8700	Radeon RX 5700 / GeForce RTX 2070	16 GB	50 GB
87	88	Windows 10 64-bit	Intel i5 4690 3.5GHz / AMD FX-8150 3.6GHz	Nvidia GeForce GTX 770 / AMD Radeon R9 380x	8 GB	50 GB	Intel i5 4690 3.5GHz / AMD FX-8150 3.6GHz	Nvidia GeForce GTX 770 / AMD Radeon R9 380x	8 GB	50 GB
88	89	Windows 10 64-bit	i9-9900K 3.6GHz 8 Core	GeForce RTX 2070	32 GB	40 GB	i9-9900K 3.6GHz 8 Core	GeForce RTX 2070	32 GB	40 GB
89	90	Windows 10 64-bit	Intel Core i5-7400 3.00GHz	NVIDIA GeForce GTX 1050	4 GB	1 GB	Intel Core i5-7400 3.00GHz	NVIDIA GeForce GTX 1050	4 GB	1 GB
90	91	Windows 10 64-bit	Intel i5 3rd Gen	NVIDIA GeForce GTX 970 / AMD Radeon R9 290	8 GB	3 GB	Intel i5 3rd Gen	NVIDIA GeForce GTX 970 / AMD Radeon R9 290	8 GB	3 GB
91	92	Windows 10 64-bit	2.0 Ghz	1GB VRAM / OpenGL 3.0+ support	2 GB	1 GB	2.0 Ghz	1GB VRAM / OpenGL 3.0+ support	2 GB	1 GB
92	93	Windows 10 64-bit	Intel Core i3	OpenGL 2.1 compatible	1 GB	200 MB	Intel Core i3	OpenGL 2.1 compatible	1 GB	200 MB
93	94	Windows 10 64-bit	Dual Core 2.4 GHz	GeForce GTX 950 / Radeon HD 7870	8 GB	10 GB	Dual Core 2.4 GHz	GeForce GTX 950 / Radeon HD 7870	8 GB	10 GB
94	95	Windows 10 64-bit	AMD FX-4350 / Intel Core i3-4160	GeForce GTX 950 / Radeon HD 7950	8 GB	15 GB	AMD FX-4350 / Intel Core i3-4160	GeForce GTX 950 / Radeon HD 7950	8 GB	15 GB
95	96	Windows 10 64-bit	Intel Core i3-540	NVIDIA Geforce GTS 450	8 GB	5 GB	Intel Core i3-540	NVIDIA Geforce GTS 450	8 GB	5 GB
96	97	Windows 10 64-bit	Intel Core2 Duo E8400 3.0GHz	Geforce 9600 GT / AMD HD 3870 512MB	3 GB	4 GB	Intel Core2 Duo E8400 3.0GHz	Geforce 9600 GT / AMD HD 3870 512MB	3 GB	4 GB
97	98	Windows 10 64-bit	Intel Core i5-3570K / AMD FX-6100	Nvidia GeForce GTX 660 / AMD Radeon R7 260x	8 GB	50 GB	Intel Core i5-3570K / AMD FX-6100	Nvidia GeForce GTX 660 / AMD Radeon R7 260x	8 GB	50 GB
98	99	Windows 10 64-bit	Intel Core i5-2300 / AMD FX-4300	Nvidia GeForce GTX 660 / AMD Radeon HD 7870	6 GB	8 GB	Intel Core i5-2300 / AMD FX-4300	Nvidia GeForce GTX 660 / AMD Radeon HD 7870	6 GB	8 GB
99	100	Windows 10 64-bit	Intel Core i5-4670K / AMD FX-8350	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	8 GB	22 GB	Intel Core i5-4670K / AMD FX-8350	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	8 GB	22 GB
\.


--
-- Name: developers_developer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.developers_developer_id_seq', 66, false);


--
-- Name: gamemodes_mode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gamemodes_mode_id_seq', 8, false);


--
-- Name: games_game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_game_id_seq', 101, false);


--
-- Name: genres_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genres_genre_id_seq', 26, false);


--
-- Name: platforms_platform_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platforms_platform_id_seq', 9, false);


--
-- Name: publishers_publisher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publishers_publisher_id_seq', 44, false);


--
-- Name: storytypes_story_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.storytypes_story_id_seq', 6, false);


--
-- Name: systemrequirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.systemrequirements_requirement_id_seq', 100, false);


--
-- Name: developers developers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT developers_pkey PRIMARY KEY (developer_id);


--
-- Name: gamegenres gamegenres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_pkey PRIMARY KEY (game_id, genre_id);


--
-- Name: gamemodes gamemodes_mode_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamemodes
    ADD CONSTRAINT gamemodes_mode_name_key UNIQUE (mode_name);


--
-- Name: gamemodes gamemodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamemodes
    ADD CONSTRAINT gamemodes_pkey PRIMARY KEY (mode_id);


--
-- Name: gamemodesrelation gamemodesrelation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_pkey PRIMARY KEY (game_id, mode_id);


--
-- Name: gameplatforms gameplatforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_pkey PRIMARY KEY (game_id, platform_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (game_id);


--
-- Name: gamestory gamestory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_pkey PRIMARY KEY (game_id, story_id);


--
-- Name: genres genres_genre_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_genre_name_key UNIQUE (genre_name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (platform_id);


--
-- Name: platforms platforms_platform_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_platform_name_key UNIQUE (platform_name);


--
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (publisher_id);


--
-- Name: storytypes storytypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storytypes
    ADD CONSTRAINT storytypes_pkey PRIMARY KEY (story_id);


--
-- Name: storytypes storytypes_story_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storytypes
    ADD CONSTRAINT storytypes_story_type_key UNIQUE (story_type);


--
-- Name: systemrequirements systemrequirements_game_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_game_id_key UNIQUE (game_id);


--
-- Name: systemrequirements systemrequirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_pkey PRIMARY KEY (requirement_id);


--
-- Name: gamegenres gamegenres_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamegenres gamegenres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id) ON DELETE CASCADE;


--
-- Name: gamemodesrelation gamemodesrelation_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamemodesrelation gamemodesrelation_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_mode_id_fkey FOREIGN KEY (mode_id) REFERENCES public.gamemodes(mode_id) ON DELETE CASCADE;


--
-- Name: gameplatforms gameplatforms_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gameplatforms gameplatforms_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(platform_id) ON DELETE CASCADE;


--
-- Name: games games_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_developer_id_fkey FOREIGN KEY (developer_id) REFERENCES public.developers(developer_id);


--
-- Name: games games_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(publisher_id);


--
-- Name: gamestory gamestory_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamestory gamestory_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.storytypes(story_id) ON DELETE CASCADE;


--
-- Name: systemrequirements systemrequirements_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6mBefhjunwrTjqhCJjC9cEqbG1p483CFhu4nxRVPr7r2YdHlxDDmgabMRosGWUA

