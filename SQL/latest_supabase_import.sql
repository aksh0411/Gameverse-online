--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

ALTER TABLE IF EXISTS ONLY public.systemrequirements DROP CONSTRAINT IF EXISTS systemrequirements_game_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamestory DROP CONSTRAINT IF EXISTS gamestory_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamestory DROP CONSTRAINT IF EXISTS gamestory_game_id_fkey;
ALTER TABLE IF EXISTS ONLY public.games DROP CONSTRAINT IF EXISTS games_publisher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.games DROP CONSTRAINT IF EXISTS games_developer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gameplatforms DROP CONSTRAINT IF EXISTS gameplatforms_platform_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gameplatforms DROP CONSTRAINT IF EXISTS gameplatforms_game_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamemodesrelation DROP CONSTRAINT IF EXISTS gamemodesrelation_mode_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamemodesrelation DROP CONSTRAINT IF EXISTS gamemodesrelation_game_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamegenres DROP CONSTRAINT IF EXISTS gamegenres_genre_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gamegenres DROP CONSTRAINT IF EXISTS gamegenres_game_id_fkey;
ALTER TABLE IF EXISTS ONLY public.systemrequirements DROP CONSTRAINT IF EXISTS systemrequirements_pkey;
ALTER TABLE IF EXISTS ONLY public.systemrequirements DROP CONSTRAINT IF EXISTS systemrequirements_game_id_key;
ALTER TABLE IF EXISTS ONLY public.storytypes DROP CONSTRAINT IF EXISTS storytypes_story_type_key;
ALTER TABLE IF EXISTS ONLY public.storytypes DROP CONSTRAINT IF EXISTS storytypes_pkey;
ALTER TABLE IF EXISTS ONLY public.publishers DROP CONSTRAINT IF EXISTS publishers_pkey;
ALTER TABLE IF EXISTS ONLY public.platforms DROP CONSTRAINT IF EXISTS platforms_platform_name_key;
ALTER TABLE IF EXISTS ONLY public.platforms DROP CONSTRAINT IF EXISTS platforms_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_genre_name_key;
ALTER TABLE IF EXISTS ONLY public.gamestory DROP CONSTRAINT IF EXISTS gamestory_pkey;
ALTER TABLE IF EXISTS ONLY public.games DROP CONSTRAINT IF EXISTS games_pkey;
ALTER TABLE IF EXISTS ONLY public.gameplatforms DROP CONSTRAINT IF EXISTS gameplatforms_pkey;
ALTER TABLE IF EXISTS ONLY public.gamemodesrelation DROP CONSTRAINT IF EXISTS gamemodesrelation_pkey;
ALTER TABLE IF EXISTS ONLY public.gamemodes DROP CONSTRAINT IF EXISTS gamemodes_pkey;
ALTER TABLE IF EXISTS ONLY public.gamemodes DROP CONSTRAINT IF EXISTS gamemodes_mode_name_key;
ALTER TABLE IF EXISTS ONLY public.gamegenres DROP CONSTRAINT IF EXISTS gamegenres_pkey;
ALTER TABLE IF EXISTS ONLY public.developers DROP CONSTRAINT IF EXISTS developers_pkey;
DROP TABLE IF EXISTS public.systemrequirements;
DROP TABLE IF EXISTS public.storytypes;
DROP TABLE IF EXISTS public.publishers;
DROP TABLE IF EXISTS public.platforms;
DROP TABLE IF EXISTS public.genres;
DROP TABLE IF EXISTS public.gamestory;
DROP TABLE IF EXISTS public.games;
DROP TABLE IF EXISTS public.gameplatforms;
DROP TABLE IF EXISTS public.gamemodesrelation;
DROP TABLE IF EXISTS public.gamemodes;
DROP TABLE IF EXISTS public.gamegenres;
DROP TABLE IF EXISTS public.developers;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: developers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.developers (
    developer_id integer NOT NULL,
    developer_name character varying(100) NOT NULL,
    country character varying(50),
    founded_year integer
);


--
-- Name: developers_developer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: gamegenres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gamegenres (
    game_id integer NOT NULL,
    genre_id integer NOT NULL
);


--
-- Name: gamemodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gamemodes (
    mode_id integer NOT NULL,
    mode_name character varying(50) NOT NULL
);


--
-- Name: gamemodes_mode_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: gamemodesrelation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gamemodesrelation (
    game_id integer NOT NULL,
    mode_id integer NOT NULL
);


--
-- Name: gameplatforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gameplatforms (
    game_id integer NOT NULL,
    platform_id integer NOT NULL
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
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
    detailed_description text,
    CONSTRAINT games_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT games_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


--
-- Name: games_game_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: gamestory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gamestory (
    game_id integer NOT NULL,
    story_id integer NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    genre_id integer NOT NULL,
    genre_name character varying(50) NOT NULL
);


--
-- Name: genres_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platforms (
    platform_id integer NOT NULL,
    platform_name character varying(50) NOT NULL
);


--
-- Name: platforms_platform_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: publishers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publishers (
    publisher_id integer NOT NULL,
    publisher_name character varying(100) NOT NULL,
    country character varying(50)
);


--
-- Name: publishers_publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: storytypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storytypes (
    story_id integer NOT NULL,
    story_type character varying(50) NOT NULL
);


--
-- Name: storytypes_story_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: systemrequirements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: systemrequirements_requirement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Data for Name: developers; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: gamegenres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gamegenres (game_id, genre_id) FROM stdin;
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
\.


--
-- Data for Name: gamemodes; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: gamemodesrelation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gamemodesrelation (game_id, mode_id) FROM stdin;
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
\.


--
-- Data for Name: gameplatforms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gameplatforms (game_id, platform_id) FROM stdin;
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
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.games (game_id, game_name, developer_id, publisher_id, release_date, rating, price, is_free_to_play, description, play_status, is_bookmarked, is_favorited, cover_image, game_engine, detailed_description) FROM stdin;
46	Apex Legends	31	27	2019-02-04	8.0	0.00	t	A free-to-play battle royale FPS featuring unique Legends with powerful abilities, squad-based gameplay, and fluid movement mechanics.	not_started	f	f	/static/images/game_46.jpg	\N	### The Story & Premise\nSet in the Outlands thirty years after the Frontier War depicted in Titanfall, the Apex Games are a televised bloodsport organized by the Mercenary Syndicate. Outlaws, soldiers, misfits, and misanthropesâ€”known as Legendsâ€”compete for fame, glory, and fortune while unraveling their own interconnected personal mysteries and corporate espionage.\n\n### World & Exploration\nHigh-speed, vertical battle royale arenas such as Kings Canyon, World's Edge, Olympus, and Storm Point. Environments are interconnected by redeploy balloons, gravity cannons, trident hover vehicles, and zipline networks designed for rapid repositioning.\n\n### Gameplay & Mechanics\nBlistering movement tech including slide-jumping, wall bouncing, and zip jumping combined with legendary Respawn gunplay. Squads of three select distinct Legendsâ€”each equipped with a passive trait, tactical ability, and game-changing ultimateâ€”utilizing the pioneering smart Ping Communication system.
26	Dark Souls Remastered	2	2	2018-05-25	8.5	39.99	f	The definitive edition of the genre-defining action RPG set in the dark fantasy kingdom of Lordran, known for its challenging combat and interconnected world.	not_started	f	f	/static/images/game_26.jpg	\N	### The Story & Premise\nIn the Age of Ancients, the world was unformed and shrouded by fog, ruled by everlasting dragons. Then came Fire, and with Fire came Disparityâ€”heat and cold, life and death, light and dark. Four Lord Souls were unearthed, sparking the Age of Fire. But as the First Flame now dies and humanity is cursed with the Darksign of Undead, you are the Chosen Undead, escaping the Undead Asylum to journey to Lordran and decide whether to rekindle the flame or usher in the Age of Dark.\n\n### World & Exploration\nLordran is renowned as one of the greatest masterpieces of 3D level architecture in video game history. A dizzying, interconnected vertical labyrinth connects the sunlit parapets of the Undead Burg, the poisonous depths of Blighttown, the subterranean molten ruins of Lost Izalith, and the golden cathedral spires of Anor Londo with ingenious shortcuts and elevator shafts.\n\n### Gameplay & Mechanics\nPioneered the Souls-like genre with unforgiving, stamina-driven tactical combat. Master shield parries, backstabs, rolling invincibility frames, and spell-casting across pyromancies, miracles, and sorceries. Bonfires serve as vital checkpoints where estus flasks and health replenish, but so too do all slain monsters.
33	DOOM	23	20	2016-05-13	8.8	19.99	f	A return to the franchise's roots, delivering fast, brutal first-person combat as the Doom Slayer rips and tears through Hell's forces on Mars.	not_started	f	f	/static/images/game_33.jpg	\N	### The Story & Premise\nOn a massive Union Aerospace Corporation (UAC) research facility on Mars, Dr. Olivia Pierce makes a pact with demonic entities, opening a portal directly to Hell in an attempt to harness Argent Energy. You awaken strapped to a stone sarcophagus as the Doom Marineâ€”a mythical demon slayer awakened from millenia of slumber with only one directive: rip and tear until it is done.\n\n### World & Exploration\nIndustrial sci-fi industrial halls collide with grotesque biomechanical demonic flesh. Explore multi-level Martian extraction facilities, foundry reactors, and ancient barren bonefields in Hell. Secrets, classic retro DOOM maps, and Praetor suit upgrade tokens are hidden behind clever environmental puzzles.\n\n### Gameplay & Mechanics\nReinvigorated the FPS genre with pure, unadulterated momentum: no reloading, no cover mechanics, and no health regeneration. Defeating staggered demons with melee Glory Kills rewards vital health pickups, forcing players to sprint headfirst into the gunfire and maintain constant aggressive forward momentum.
38	Monster Hunter Rise	22	19	2021-03-26	8.3	39.99	f	A fast-paced action RPG featuring new Wirebug mechanics and the ability to ride monsters in thrilling hunts across stunning environments.	not_started	f	f	/static/images/game_38.jpg	\N	### The Story & Premise\nKamura Village, a peaceful hamlet famed for its Tatara steel and vibrant ninja culture, faces imminent catastrophe: the "Rampage." A terrifying catastrophe that struck fifty years ago is recurring, driving dozens of monsters into a synchronized frenzy that stampedes toward the village walls. Newly certified as Kamura's newest hunter, you must defend the ramparts and discover what sinister wyvern is driving the horde mad.\n\n### World & Exploration\nInfused with traditional Japanese yokai folklore, the world features shrines, flooded forests, volcanic caverns, and frosty islands designed with total vertical freedom. Scale cliffs and run up walls seamlessly using the revolutionary Wirebug tool, reaching ancient relics and hidden lookout camps.\n\n### Gameplay & Mechanics\nFastest-paced hunting in the franchise. The Wirebug allows mid-air recoveries, wirefall dashes, and unique Silkbind weapon attacks. Introduce Wyvern Riding, which allows hunters to lasso and ride weakened monsters to slam them into walls or command their breath attacks against other beasts in Rampage horde-defense missions.
4	Red Dead Redemption 2	5	4	2018-10-26	9.7	39.99	f	An epic tale of life in America's unforgiving heartland, following outlaw Arthur Morgan and the Van der Linde gang on the run across a vast open world.	not_started	f	f	/static/images/game_4.jpg	\N	### The Story & Premise\nAmerica, 1899. The end of the Wild West era has begun as lawmen hunt down the last remaining outlaw gangs. Following a botched ferry heist in the town of Blackwater, Arthur Morgan and the Van der Linde gang are forced to flee eastward into an unforgiving frontier. As internal divisions deepen and modern civilization closes in, Arthur must choose between his lifelong loyalty to Dutch van der Linde and his own redemption.\n\n### World & Exploration\nA breathtaking recreation of the American heartland spanning snowy mountain peaks of the Grizzlies, humid bayous of Lemoyne, sweeping heartland plains, and the bustling smoke-filled metropolis of Saint Denis. The ecosystem is alive with over 200 species of animals, dynamic weather systems, and emergent stranger encounters that unfold naturally without scripted artificiality.\n\n### Gameplay & Mechanics\nFeatures deliberate, visceral third-person gunplay enhanced by the signature Dead Eye targeting system. Survival elements such as weapon maintenance, horse bonding, camp morale, hunting, and an evolving moral honor gauge ensure that every action leaves a lasting impression on how NPCs perceive and react to Arthur.
9	Hollow Knight	8	7	2017-02-24	9.3	14.99	f	A beautifully crafted action-adventure Metroidvania set in the vast, interconnected underground kingdom of Hallownest.	play_later	t	f	/static/images/game_9.jpg	\N	### The Story & Premise\nDescend into the forgotten underground insect kingdom of Hallownest, an ancient ruined civilization slumbering beneath the fading town of Dirtmouth. A mysterious infection of glowing orange madness has seeped through the caverns, robbing bugs of their reason. As a silent, nameless wanderer armed with only an old nail, you must unravel the tragedy of the pale king, the vessel seals, and the radiance sleeping in the dream realm.\n\n### World & Exploration\nWidely celebrated as one of the finest Metroidvanias ever created, Hallownest is a vast, melancholic labyrinth of hand-drawn gothic environments. From the verdant overgrown flora of Greenpath and the luminescent fungi of the Fungal Wastes to the desolate rainy spires of the City of Tears, discovery is organic, non-linear, and soaked in mournful atmosphere.\n\n### Gameplay & Mechanics\nTight, responsive 2D platforming and demanding nail combat. Defeat foes to gather Soul, which can be channeled either to cast destructive spells or focus and heal your shell. Customize your capabilities with dozens of unique Charms, unlocking synergized playstyles, nail pogo extensions, and dash mechanics to conquer brutal boss gauntlets.
68	Armored Core VI	2	2	2023-08-25	8.9	59.99	f	Assemble and pilot your custom mech through 3D omnidirectional battles on the remote planet Rubicon 3, taking on high-risk mercenary missions for rival corporations.	not_started	f	f	/static/images/game_68.jpg	FromSoftware Engine	### The Story & Premise\nOn the remote frontier planet Rubicon 3, a volatile new energy substance known as Coral caused a cataclysmic cosmic storm that engulfed the entire planetary system in flames half a century ago. When Coral activity resurfaces, megacorporations and resistance factions wage war for control. Entering the warzone as an unauthorized augmented mercenary under the handler Walter, you take the callsign "Raven" to sell your combat skills to the highest bidder.\n\n### World & Exploration\nA bleak, towering industrial dystopia featuring colossal megastructures, frozen tundra battlefields, and subterranean geothermal reactors. The scale of the environments emphasizes the sheer might and agility of mechanized warfare under FromSoftware's dark industrial aesthetic.\n\n### Gameplay & Mechanics\nBlistering omnidirectional three-dimensional mech combat. Freely customize your Armored Core (AC) with hundreds of chassis parts, thrusters, generator cores, and four weapon slots (dual arm and dual shoulder weapons). Master energy management, high-speed assault boosts, and the critical Stagger mechanic to vanquish punishing boss machines.
2	Elden Ring	2	2	2022-02-25	9.5	59.99	f	An epic open-world action RPG created by FromSoftware and George R.R. Martin, set in the vast and mysterious Lands Between.	not_started	f	f	/static/images/game_2.jpg	\N	### The Story & Premise\nRise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. In the aftermath of Queen Marika's shattering of the Elden Ring, her demigod offspring claimed the shards known as Great Runes, descending into the madness of a ruinous war known as The Shattering. Cast out from grace long ago, you return to a broken realm ruled by fallen demigods to forge destiny or burn it to ashes.\n\n### World & Exploration\nThe Lands Between is a staggering open-world expanse where natural landscapes blend seamlessly with mythic fantasy. From the golden canopies of Limgrave and the eerie mist-choked swamps of Liurnia of the Lakes to the crimson rot-blighted wastes of Caelid and the monumental spires of Leyndell, every horizon beckons with hidden crypts, subterranean starscapes, roaming dragons, and colossal legacy dungeons.\n\n### Gameplay & Mechanics\nFromSoftware's legendary combat reaches its pinnacle with total player freedom. Ride the spectral steed Torrent across sprawling vistas, engage in mounted combat, summon Spirit Ashes to turn the tide against ferocious bosses, and craft build archetypes spanning colossal strength colossal blades, intricate sorceries, and stealth-based bleed assassins.
7	The Witcher 3: Wild Hunt	6	5	2015-05-19	9.5	39.99	f	An award-winning open-world RPG following Geralt of Rivia as he searches for his adopted daughter while navigating a war-torn fantasy world.	play_later	f	f	/static/images/game_7.jpg	\N	### The Story & Premise\nIn a war-torn continent caught between the invading Nilfgaardian Empire and northern kingdoms, Geralt of Riviaâ€”a mutated monster slayer known as a Witcherâ€”is hired to track down Ciri, the Child of Prophecy. Hunted relentlessly by the otherworldly and spectral cavalcade known as the Wild Hunt, Ciri holds the power to alter the fabric of the world, compelling Geralt on a deeply personal odyssey across monster-infested realms.\n\n### World & Exploration\nA dark fantasy realm of staggering scale and narrative richness. Wander the war-ravaged swamps of Velen, the cosmopolitan streets and criminal backalleys of Novigrad, the windswept Nordic archipelago of Skellige, and the idyllic sunlit vineyards of Toussaint. Witcher contracts offer self-contained detective mysteries with complex moral dilemmas where no choice is purely black or white.\n\n### Gameplay & Mechanics\nCombines fluid dual-sword martial combat (steel for mortals, silver for beasts) with five versatile magical Witcher signs: Aard, Igni, Quen, Yrden, and Axii. Preparation is paramountâ€”researching the Bestiary, brewing specialized decoctions, crafting blade oils, and setting tactical traps are essential to conquering legendary beasts.
3	Baldur's Gate 3	3	3	2023-08-03	9.6	59.99	f	A sprawling RPG based on Dungeons & Dragons, offering deep character customization, turn-based combat, and a richly branching narrative.	play_later	t	f	/static/images/game_3.jpg	\N	### The Story & Premise\nAbducted, infected, and lost, you find yourself turning into a monster as an Illithid mind flayer tadpole burrows behind your eye. Yet as the corruption grows within you, so does mysterious power. Set against the rich backdrop of the Dungeons & Dragons Forgotten Realms, Baldur's Gate 3 delivers an epic saga of fellowship, betrayal, survival, and the ultimate lure of absolute power as the shadow of the Absolute threatens Faerun.\n\n### World & Exploration\nEvery forest trail, subterranean Underdark cavern, and cobblestone alley in the city of Baldur's Gate is handcrafted with unprecedented verticality and environmental interactivity. Speak with animals, converse with the dead, manipulate gravity with telekinesis, or find unexpected non-lethal solutions to complex moral disputes across dozens of interconnected biomes.\n\n### Gameplay & Mechanics\nBuilt on the D&D 5th Edition ruleset, turn-based tactical combat rewards boundless creativity. Stack elemental surfaces, push enemies from precarious cliffs, synergize spell combinations, and command an unforgettable cast of companions whose approvals, romances, and personal destinies react dynamically to every choice you make.
5	Grand Theft Auto V	4	4	2013-09-17	9.5	29.99	f	An ambitious open-world action game set in the sprawling city of Los Santos, following three protagonists through an interconnected criminal underworld.	not_started	f	f	/static/images/game_5.jpg	\N	### The Story & Premise\nWhen a young street hustler, a retired bank robber, and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, the U.S. government, and the entertainment industry, they must pull off a series of dangerous heists to survive in a ruthless city where they can trust nobodyâ€”least of all each other.\n\n### World & Exploration\nSet in the sprawling, sun-soaked satire metropolis of Los Santos and the rural desert badlands of Blaine County, GTA V offers one of the most vibrant urban playgrounds ever built. From coastal beaches and luxury Vinewood Hills estates to military bases and treacherous mountain trails of Mount Chiliad, the world is bustling with life, radio stations, and satirical humor.\n\n### Gameplay & Mechanics\nPioneered an innovative three-protagonist character switching mechanic that allows seamless transitions between Michael, Franklin, and Trevor during both free-roaming exploration and intricate, multi-stage heist missions requiring tactical planning, getaway driving, and synchronized gunfire.
6	Cyberpunk 2077	6	5	2020-12-10	8.6	29.99	f	An open-world RPG set in the dystopian Night City, where players take on the role of V, a mercenary outlaw going after a one-of-a-kind implant.	not_started	f	f	/static/images/game_6.jpg	\N	### The Story & Premise\nStep into the chrome-plated shoes of V, a mercenary outlaw navigating the neon-drenched streets of Night Cityâ€”a megalopolis obsessed with power, glamour, and body modification. After a heist against the Arasaka megacorporation goes catastrophically wrong, a prototype biochip carrying the rebellious digital engram of rockerboy Johnny Silverhand is slotted into your brain, triggering a race against time before your mind is overwritten.\n\n### World & Exploration\nNight City is an architectural marvel of vertical cyberpunk ambition, split into six distinct districts ranging from the corporate monoliths of City Center and the gang-controlled tenements of Pacifica to the lawless Badlands surrounding the urban sprawl. Verticality, dense pedestrian crowds, holographic advertisements, and moody synthwave soundscapes create an unmatched sensory immersion.\n\n### Gameplay & Mechanics\nA first-person action-RPG providing boundless flexibility through cyberware implants, quickhacking protocols, and diverse weapon loadouts. Unleash devastating Sandevistan-fueled blade blitzes, rain smart-targeting bullets around corners, or silently bypass security networks by uploading daemons and frying neural circuitry from afar.
8	Black Myth: Wukong	7	6	2024-08-20	8.8	59.99	f	An action RPG rooted in Chinese mythology, following the Destined One on a journey inspired by the classic novel Journey to the West.	not_started	f	f	/static/images/game_8.jpg	\N	### The Story & Premise\nRooted deeply in classical Chinese mythology and the 16th-century masterpiece *Journey to the West*, you step into the fur of the Destined One. Set years after Sun Wukong's legendary pilgrimage, the Monkey King's mythical relics have been scattered across enchanted realms. As the Destined One, you embark on an arduous journey to uncover the truth behind a glorious legend veiled in ancient tragedy and celestial intrigue.\n\n### World & Exploration\nBuilt using cutting-edge Unreal Engine 5, the world showcases breathtaking ancient temples, misty bamboo forests, volcanic peaks, and snow-laden mountain pagodas. The game brings Chinese architectural heritage and folklore to life with photorealistic detail, environmental secret passages, and eccentric mythical hermits who impart martial secrets.\n\n### Gameplay & Mechanics\nFast-paced martial arts combat revolves around the iconic staff, featuring three versatile fighting stances: Smash, Pillar, and Thrust. Channel legendary magical spells including Immobilize, Cloud Step, and Rock Solid, alongside shapeshifting transformations that grant the movesets and powers of defeated mythical yaoguai chiefs.
10	Hades	9	8	2020-09-17	9.3	24.99	f	A roguelite dungeon crawler where you defy the god of the dead as you hack and slash your way out of the Underworld of Greek myth.	not_started	f	f	/static/images/game_10.jpg	\N	### The Story & Premise\nDefy the god of the dead as Zagreus, Prince of the Underworld, as you hack and slash your way out of your tyrannical father Hades' subterranean domain. Aided by your distant Olympian relativesâ€”Zeus, Athena, Poseidon, and moreâ€”who bestow powerful divine blessings, Zagreus strives to reach the mortal surface and uncover the truth about his estranged mother, Nyx's secrets, and his true heritage.\n\n### World & Exploration\nThe Underworld is partitioned into four vividly stylized chambers of mythic Greek afterlife: the scorched dungeons of Tartarus, the magma seas of Asphodel, the warrior paradise of Elysium, and the grim surface gateway of the Temple of Styx. Death is not failure, but an essential narrative beat where Zagreus returns to the House of Hades to chat with mythological icons like Achilles, Medusa, and Cerberus.\n\n### Gameplay & Mechanics\nA masterclass in roguelike action featuring six distinct Infernal Arms, each harboring four unique hidden Aspects. Every run offers unpredictable synergies through randomized Olympian Boons, Daedalus Hammer weapon augmentations, and customizable Pact of Punishment heat modifiers that ensure infinite replayability.
87	Need for Speed Unbound	53	27	2022-12-02	7.6	69.99	f	Tear up the streets of Lakeshore with graffiti-inspired visual bursts, high-speed cop chases, and underground drift meets.	not_started	f	f	/static/images/game_87.jpg	Frostbite	### The Story & Premise\nAfter a family auto-shop robbery tears two childhood friends apart, a rookie street racer must rise through the ranks of Lakeshore City's underground racing scene to win "The Grand"â€”the ultimate street raceâ€”and reclaim the priceless stolen custom car that started it all, while evading an aggressive, militarized police task force.\n\n### World & Exploration\nLakeshore City is an electric, neon-lit playground inspired by Chicago. Roam through downtown financial skyscraper canyons, industrial shipping docks, and curving mountain switchback highways under a striking aesthetic that blends photorealistic cars and city streets with stylish, cel-shaded anime character models and graffiti street-art VFX.\n\n### Gameplay & Mechanics\nRisk versus reward racing at its finest. Enter underground street races by putting up hard cash buy-ins and side-bets against rivals. As you win, your Heat level spikes, unleashing high-speed police pursuits with tactical roadblocks and spike strips. Earn Burst Nitrous by executing perfect drifts and drafting opponents.
66	Mass Effect Legendary Edition	41	27	2021-05-14	9.4	59.99	f	Relive the cinematic space opera that defined a generation. Includes all three acclaimed games of Commander Shepard's fight against the Reaper invasion across the galaxy.	not_started	f	f	/static/images/game_66.jpg	Unreal Engine 3	### The Story & Premise\nThe definitive compilation of the legendary sci-fi RPG trilogy spanning Mass Effect, Mass Effect 2, and Mass Effect 3. As Commander Shepard of the Systems Alliance, you lead the elite crew of the SSV Normandy across the Milky Way Galaxy to rally alien civilizations and unite a fractured council against the Reapersâ€”an ancient synthetic dreadnought race that harvests all advanced organic life every 50,000 years.\n\n### World & Exploration\nExplore iconic galactic hubs including the towering cosmopolitan Citadel, the lawless asteroid station of Omega, and the corporate spires of Illium. Land the Mako rover or shuttle craft on dozens of uncharted planetary systems across the galaxy map, discovering ancient Prothean relics and alien cultures.\n\n### Gameplay & Mechanics\nYour choices carry forward seamlessly across all three epic chapters, deciding the survival of squadmates and the extinction or salvation of entire alien species. Tactical cover shooting blends gunplay with devastating biotic telekinesis and tech abilities, complemented by deep dialogue wheels featuring Paragon and Renegade moral alignments.
52	Far Cry 4	32	28	2014-11-18	8.5	29.99	f	Hidden in the towering Himalayas lies Kyrat, a country steeped in tradition and violence under the despotic rule of self-appointed king Pagan Min.	not_started	f	f	/static/images/game_52.jpg	Dunia Engine 2	### The Story & Premise\nAjay Ghale, an Americanized Kyrati native, travels to the fictional Himalayan country of Kyrat to fulfill his late mother's dying wish: to scatter her ashes at Lakshmana. Upon arrival, he is swept into a violent civil war between the tyrannical dictator Pagan Min and the Golden Path rebellion founded by his own estranged father, forcing him to choose the political future of a war-torn nation.\n\n### World & Exploration\nA gorgeous vertical Himalayan realm showcasing snow-draped alpine peaks, Buddhist monasteries, prayer flag-strewn bridges, and verdant valleys. Traversal is elevated with the buzzer gyrocopter, grappling hooks, and wingsuit gliding, alongside surreal hallucinatory journeys into the mythical spirit paradise of Shangri-La.\n\n### Gameplay & Mechanics\nExpands on chaotic sandbox combat. Ajay can ride battle elephants to smash through outpost gates, call in mercenary support or cooperative companions, and bait wild predators like snow leopards and honey badgers into enemy garrisons with thrown meat.
11	Dead Cells	10	9	2018-08-07	8.7	24.99	f	A roguelite Metroidvania action-platformer featuring procedurally generated levels and intense, fast-paced combat.	play_later	f	f	/static/images/game_11.jpg	\N	### The Story & Premise\nYou are the Prisoner, an immortal blob of sentient cellular tissue that reanimates a headless corpse inside an ever-shifting island fortress. The island has been devastated by the Malaise, a plague that turned the kingdom's citizens into mindless grotesque aberrations while the tyrannical King locked himself away in his sanctuary. Trapped in a loop of perpetual demise, you fight to liberate the realm or shatter it completely.\n\n### World & Exploration\nA frantic "RogueVania" offering procedural castle ramparts, toxic sewers, clock towers, ossuaries, and ancient arboretums. Permanent upgrades unlocked via collected cells open up persistent runes like Vine, Teleportation, and Ram runes, allowing you to branch off into alternate, increasingly challenging traversal paths across successive runs.\n\n### Gameplay & Mechanics\nLightning-fast hack-and-slash combat emphasizing dodge rolls, parries, and aerial combos. Experiment with hundreds of combinations of primary weapons, shields, deployable traps, turrets, and grenades, fine-tuning your build across three stat disciplines: Brutality, Tactics, and Survival.
13	Terraria	12	11	2011-05-16	9.2	9.99	f	A 2D sandbox adventure game featuring exploration, crafting, building, and combat in a procedurally generated world.	completed	f	f	/static/images/game_13.jpg	\N	### The Story & Premise\nDig, fight, explore, and build in this legendary 2D action-adventure sandbox. What begins as a modest struggle to construct a wooden shelter before zombies and floating eye demons emerge under the cover of night rapidly escalates into a grand quest against ancient celestial horrors, mechanical abominations, and the apocalyptic Wall of Flesh.\n\n### World & Exploration\nEvery newly generated 2D world hides layer upon layer of subterranean wonders. Delve through the surface into the underground caverns, uncover glowing mushroom biomes, explore marble temples, brave the infested Corruption or Crimson chasms, and descend into the molten Underworld before ascending into floating sky islands.\n\n### Gameplay & Mechanics\nBoasts one of the deepest progression ladders in gaming with hundreds of weapons, armor sets, accessories, and summoner tools categorized into Melee, Ranged, Magic, and Summoner classes. Transition your world into Hardmode to unleash brand new ores, deadly eclipses, and monumental boss battles like the Moon Lord.
14	Stardew Valley	13	12	2016-02-26	9.4	14.99	f	A farming simulation RPG where players inherit a run-down farm and work to restore it while building relationships in a charming rural community.	not_started	f	f	/static/images/game_14.jpg	\N	### The Story & Premise\nInheriting your grandfather's overgrown, neglected plot of land in Pelican Town, you leave behind the soul-crushing corporate cubicle life at Joja Corporation with a pocketful of hand-me-down tools. Set in the tranquil valley of Stardew Valley, you set out to clear the weeds, revitalize the homestead, and become a cherished pillar of a quirky and warmhearted rural community.\n\n### World & Exploration\nPelican Town and its scenic surroundings shift dynamically through four distinct seasons, each accompanied by unique crops, foraging items, festivals, and fish. Explore the mysterious local Community Center, venture down the monster-filled floors of the mountain Mines, and unlock the tropical wonders of Ginger Island.\n\n### Gameplay & Mechanics\nBalances relaxing agricultural management with deep social roleplaying. Cultivate crops, raise livestock, brew artisan goods, decorate your farmstead, and build lasting bonds or romances with over thirty town residents through thoughtful gifts, heart events, and seasonal holiday festivals.
15	No Man's Sky	14	13	2016-08-09	8.0	59.99	f	A space exploration survival game set in a procedurally generated universe with billions of planets to discover and explore.	not_started	f	f	/static/images/game_15.jpg	\N	### The Story & Premise\nAwaken on a hostile alien frontier with a broken exosuit and a damaged starship. Guided by the enigmatic signal of the Atlas entity and the cosmic path toward the galactic center, No Man's Sky casts you as a Traveler navigating an infinite universe to uncover the true nature of reality, simulated worlds, and the sentinels watching over every orbit.\n\n### World & Exploration\nPowered by revolutionary procedural generation, the universe contains over 18 quintillion unique planets, each with its own alien ecosystems, flora, fauna, weather phenomena, and geography. Fly seamlessly from the depths of uncharted alien oceans up into orbit and pulse-drive across planetary systems with no loading screens.\n\n### Gameplay & Mechanics\nCombines space flight dogfights, planetary base building, trade fleet management, and deep resource crafting. Construct planetary bases, pilot living starships, command a capital freighter with accompanying frigates, and team up with fellow Travelers in the multiplayer Space Anomaly hub.
17	Valheim	16	15	2021-02-02	8.5	19.99	f	A Viking survival and exploration game set in a procedurally generated purgatory inspired by Norse mythology.	not_started	f	f	/static/images/game_17.jpg	\N	### The Story & Premise\nA battle-slain warrior transported to Valheim, the tenth Norse realm, by the Valkyries. To earn Odin's favor and secure your place in the golden halls of Valhalla, you must tame this wild, untamed purgatory and vanquish the ancient primeval rivals of the Allfather that threaten the cosmic order of Yggdrasil.\n\n### World & Exploration\nA vast, procedurally generated wilderness inspired by Norse myth. Set sail on handcrafted longships across stormy oceans, trek through tranquil Meadows, brave the troll-infested Black Forest, endure the toxic mists of the Swamps, freeze upon snowy Mountain peaks, and face goblin warlords in the golden Plains.\n\n### Gameplay & Mechanics\nCombines an intuitive physics-based structural building system with visceral stamina-based combat. Chop trees, construct fortified mead halls complete with chimney ventilation, brew protective meads, craft bronze and black metal weaponry, and summon towering mythical deities for pulse-pounding cooperative boss fights.
18	God of War	17	16	2018-04-20	9.6	49.99	f	A cinematic action-adventure following Kratos and his son Atreus on a deeply personal journey through the realms of Norse mythology.	not_started	f	f	/static/images/game_18.jpg	\N	### The Story & Premise\nHis vengeance against the gods of Olympus far behind him, Kratos now lives as a man in the realm of Norse gods and monsters. Following the passing of his wife Faye, Kratos and his young son Atreus must embark on a perilous pilgrimage to the highest peak of the nine realms to scatter her ashes, forcing the Ghost of Sparta to confront his bloody past and teach his son how to survive.\n\n### World & Exploration\nCenters on the mystical Lake of Nine in Midgard, which expands dynamically as the World Serpent shifts within the waters. Journey through magical gateways into ethereal realms like the elven sanctuary of Alfheim and the frozen underworld of Helheim, solving ancient runic puzzles and discovering legendary Valkyrie chambers.\n\n### Gameplay & Mechanics\nA seamless, single continuous camera shot anchors cinematic, brutally satisfying close-quarters combat. Wield the frost-infused Leviathan Axeâ€”which can be hurled across battlefields and recalled with the touch of a buttonâ€”alongside the devastating Blades of Chaos and Atreus's precision runic bow support.
19	God of War Ragnarok	17	16	2022-11-09	9.4	59.99	f	The epic conclusion to the Norse saga follows Kratos and Atreus as they face the prophesied end of the world, Ragnarok.	not_started	f	t	/static/images/game_19.jpg	\N	### The Story & Premise\nFimbulwinter is well underway, chilling Midgard to its core. Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare for a prophesied war that will bring about the end of the world. Along the way, they will explore stunning, mythical landscapes, and face fearsome enemies in the form of Norse gods and monsters as the threat of Ragnarok draws closer.\n\n### World & Exploration\nUnlocks all Nine Realms of Norse mythology in their full glory, including the dwarven geyser springs of Svartalfheim, the lush jungles of Vanaheim, and the golden halls of Asgard itself. Travel across frozen tundra via wolf sled, navigate riverboats through winding canyons, and uncover countless realm tears and secret bosses.\n\n### Gameplay & Mechanics\nExpands combat depth with high vertical mobility, grappling points, and the addition of the legendary Draupnir Spearâ€”a weapon capable of infinite duplication and explosive remote detonation. Playable segments with Atreus introduce agile acrobatic archery and mystical shapeshifting abilities.
22	Marvel's Spider-Man 2	19	16	2023-10-20	9.0	69.99	f	An expanded open-world adventure featuring both Peter Parker and Miles Morales as they face new threats across Marvel's New York.	not_started	f	f	/static/images/game_22.jpg	\N	### The Story & Premise\nSpider-Men Peter Parker and Miles Morales return for an exhilarating adventure. Both heroes are navigating tricky personal crossroadsâ€”Peter grappling with the weight of adulthood and Miles balancing college applicationsâ€”when Kraven the Hunter arrives in New York hunting superhumans. The situation spirals into horror when the sinister alien Symbiote bonds with Peter, amplifying his darkest instincts and giving rise to the monstrous Venom.\n\n### World & Exploration\nDoubles the playable map size by expanding across the East River into Queens and Brooklyn. Swoop beneath bridge trusses and through neighborhood avenues using the revolutionary Web Wings, which leverage wind tunnels to propel heroes across city skylines at supersonic speeds with zero fast-travel loading times.\n\n### Gameplay & Mechanics\nSwitch between Peter and Miles almost instantly. Peter harnesses the raw, aggressive tendril strikes of the Symbiote suit, while Miles commands explosive bio-electric Venom powers and camouflage stealth. Combined with parry mechanics and dual-takedowns, the combat is more explosive and dynamic than ever.
23	Horizon Zero Dawn	20	16	2017-02-28	8.9	49.99	f	An action RPG set in a post-apocalyptic world overrun by robotic creatures, following hunter Aloy as she uncovers her mysterious origins.	not_started	f	f	/static/images/game_23.jpg	\N	### The Story & Premise\nIn a lush, post-apocalyptic world where nature has reclaimed the ruins of a forgotten civilization, colossal animal-like machines roam the wilderness while surviving humanity lives in primitive tribal cultures. Cast out from the Nora tribe at birth, the spirited young hunter Aloy embarks on a quest to discover her origins, uncover why the machines have grown increasingly deranged, and solve the cataclysm of the "Old Ones."\n\n### World & Exploration\nA stunning collision of prehistoric wilderness and decaying technological ruins. Wander through towering redwood forests, snowbound alpine peaks, and arid desert canyons dotted with rusting skyscrapers and subterranean Cauldronsâ€”robotic manufacturing facilities where machine secrets are forged.\n\n### Gameplay & Mechanics\nTactical, high-stakes hunting combat. Scan machines with Aloy's Focus device to highlight elemental weaknesses, armor plates, and component canisters. Detach weapons from mechanical beasts using precision bows, set tripwire traps, and override robotic codes to turn fearsome mechanical predators into loyal mounts.
24	Horizon Forbidden West	20	16	2022-02-18	8.7	59.99	f	Aloy ventures into the deadly Forbidden West to find the source of a mysterious plague threatening all life, facing new machines and factions.	not_started	f	f	/static/images/game_24.jpg	\N	### The Story & Premise\nAloy's saga continues as she travels west to a majestic but dangerous frontier to confront a mysterious and catastrophic red blight that is choking wildlife, starving tribes, and poisoning the biosphere. In the forbidden lands of the Pacific coast, she must unite fractious warrior tribes, confront high-tech remnants of Far Zenith, and restore the terraforming AI GAIA before Earth suffers total extinction.\n\n### World & Exploration\nEncompasses the American West from Utah to the ruins of San Francisco. Explore sun-drenched beaches, crumbling submerged cities with complete underwater diving mechanics, dense jungles, and soaring peaks. Players take to the skies on the back of a flying Sunwing machine, experiencing vertical exploration with absolute freedom.\n\n### Gameplay & Mechanics\nGreatly expanded melee combos with the spear, new weapon classes like the Shredder Gauntlet and Spike Thrower, and the Pullcaster grapple. Valor Surges trigger devastating temporary combat buffs, while deep weapon customization and machine part harvesting make every encounter a tactical spectacle.
25	Sekiro: Shadows Die Twice	2	17	2019-03-22	9.2	59.99	f	A punishing action-adventure set in Sengoku-era Japan, following a shinobi on a quest to rescue his kidnapped lord and exact revenge.	play_later	f	f	/static/images/game_25.jpg	\N	### The Story & Premise\nSet in a reimagined late 1500s Sengoku period Japan, you are the "One-Armed Wolf"â€”a disgraced and disfigured shinobi bound by duty to protect the young Divine Heir Kuro, whose bloodline carries the miraculous gift of dragon immortality. When Kuro is kidnapped by the desperate warlord Genichiro Ashina, the Wolf embarks on a blood-soaked quest of vengeance and redemption to uphold his master's honor.\n\n### World & Exploration\nAshina is a breathtaking, vertically designed mountain fortress filled with ancient pagodas, snow-covered battlements, subterranean poisons, and the mystical realm of Fountainhead Palace. Wolf's Shinobi Prosthetic grappling hook transforms exploration into high-speed aerial acrobatics across temple rooftops.\n\n### Gameplay & Mechanics\nDiscards traditional RPG leveling in favor of intense, rhythmic swordplay centered on posture and deflection. Clash steel against steel to deplete the enemy's Posture bar before delivering a lethal Shinobi Deathblow. Equip the prosthetic arm with firecrackers, loaded axes, shurikens, and flame vents to turn the tide against ruthless samurai and supernatural terrors.
27	Dark Souls III	2	2	2016-04-12	9.1	59.99	f	The final entry in the acclaimed Dark Souls trilogy, featuring faster combat and expansive, interconnected dark fantasy environments.	not_started	f	f	/static/images/game_27.jpg	\N	### The Story & Premise\nAs fires fade and the world falls into ruin, the bell tolls, awakening the Lords of Cinder from their graves to link the First Flame once more. However, the lords have abandoned their thrones, choosing to let the fire burn out. You awaken as the Ashen Oneâ€”an Unkindled ash unfit even to be cinderâ€”tasked with hunting down the fallen Lords and reclaiming their embers to resolve the fate of a dying cosmos.\n\n### World & Exploration\nSet across Lothric, where distorted lands from throughout history converge like tectonic plates. Explore the decaying ramparts of the High Wall of Lothric, the icy gothic cathedrals of Irithyll of the Boreal Valley, and the abyss-tainted swamps of Farron Keep. The visual design paints an unforgettable portrait of an ancient world collapsing under its own weight.\n\n### Gameplay & Mechanics\nRefines the series' combat into a faster, more fluid experience. Weapon Skills (Arts) introduce unique battle stances, lunges, and magical attacks to every weapon class. Features some of the most celebrated and cinematic boss fights in gaming history, including the Abyss Watchers, Nameless King, and Slave Knight Gael.
28	Bloodborne	2	16	2015-03-24	9.4	19.99	f	A gothic action RPG set in the nightmarish city of Yharnam, featuring aggressive, fast-paced combat and Lovecraftian horror.	not_started	f	f	/static/images/game_28.jpg	\N	### The Story & Premise\nA lone traveler arrives in the ancient gothic city of Yharnam seeking "Paleblood" to cure a terminal affliction. Instead, you find the city locked in the throes of the annual Hunt, its citizens driven mad and mutated into rabid beasts by the blood ministration of the Healing Church. Bound to the surreal refuge of the Hunter's Dream, you must unravel cosmic truths and confront eldritch Great Ones lurking beyond human perception.\n\n### World & Exploration\nA chilling Victorian and Lovecraftian gothic nightmare. From the towering cobblestone spires of Central Yharnam and the plague-ridden depths of Old Yharnam to the eerie cosmic research facilities of the Grand Cathedral and the surreal nightmare realms, the atmosphere is saturated in madness, blood, and haunting cosmic dread.\n\n### Gameplay & Mechanics\nReplaces cautious shielding with relentless aggression. Trick Weapons transform dynamically between two distinct modesâ€”such as a cane converting into a razor whip or a sword docking into a colossal hammer. The Regain Rally system rewards immediate retaliatory strikes to recover recently lost vitality, complemented by firearms used to parry attacking horrors mid-swing.
29	Lies of P	21	18	2023-09-19	8.4	59.99	f	A Soulslike action RPG inspired by the story of Pinocchio, set in a dark Belle Epoque world overrun by rogue puppets.	not_started	f	f	/static/images/game_29.jpg	\N	### The Story & Premise\nInspired by the familiar tale of Pinocchio, Lies of P is a dark fantasy soulslike set in the Belle Ã‰poque city of Krat. Once a beacon of scientific innovation powered by Ergo energy, Krat has fallen into ruin following the "Puppet Frenzy," where mechanical servants slaughtered their human masters, followed by the terrifying Petrification Disease. You awaken as Geppetto's puppet, armed and driven by a single decree: find your creator and choose whether to lie to become human.\n\n### World & Exploration\nThe opulent 19th-century European architecture of Krat contrasts elegance with blood-soaked mechanical carnage. Navigate grand opera houses, industrial factories, rain-drenched tram stations, and crumbling seaside ruins filled with tragic environmental notes and survivor sanctuaries like Hotel Krat.\n\n### Gameplay & Mechanics\nDemands precision parrying and guard regain mechanics. Features an innovative Weapon Assemble system that lets players combine distinct blades and handles to customize damage types, scaling, and Fable Arts. The Legion Arm prosthetic provides modular tactical tools including grapple hooks, flamethrowers, and electric shocks.
30	Resident Evil 4 Remake	22	19	2023-03-24	9.3	59.99	f	A reimagining of the survival horror classic, following Leon S. Kennedy on a mission to rescue the president's daughter from a sinister rural cult.	not_started	f	f	/static/images/game_30.jpg	\N	### The Story & Premise\nSix years after the biological catastrophe of Raccoon City, special agent Leon S. Kennedy is dispatched on a covert mission to a secluded European rural village to rescue Ashley Graham, the abducted daughter of the U.S. President. Leon quickly discovers that the villagers are not mindless zombies, but hosts controlled by a parasitic mind-altering ancient organism known as *Las Plagas*, led by a fanatical cult.\n\n### World & Exploration\nA total ground-up remake of the survival-horror benchmark. Navigate mist-shrouded hillside villages, murky lake caverns, a decadent medieval castle ruled by Ramon Salazar, and a heavily fortified island military research base. Atmospherics and sound design are rebuilt with modern fidelity, dialing up the tension and claustrophobic dread.\n\n### Gameplay & Mechanics\nTight over-the-shoulder third-person gunplay elevated with combat knife parriesâ€”allowing Leon to deflect chainsaws, redirect thrown axes, and deliver devastating roundhouse kicks. Manage the iconic attache case grid inventory, upgrade weapons with the mysterious Merchant, and protect Ashley in intense co-op escape sequences.
31	Resident Evil Village	22	19	2021-05-07	8.5	39.99	f	A first-person survival horror game following Ethan Winters as he searches for his kidnapped daughter in a mysterious European village.	not_started	f	f	/static/images/game_31.jpg	\N	### The Story & Premise\nSet three years after Resident Evil 7, Ethan Winters and his wife Mia are living peacefully in Europe with their baby daughter Rose. Their tranquility is violently shattered when Chris Redfield storms their home, abducts Rose, and leaves Ethan battered. Ethan awakens in a snow-covered, fog-drenched European village ruled by Mother Miranda and her four monstrous lords, igniting a desperate battle to save his child.\n\n### World & Exploration\nAn atmospheric hub-and-spoke gothic sandbox framed around four horrific lords: the towering vampire Lady Dimitrescu in Castle Dimitrescu, the horrific puppet-master Donna Beneviento in House Beneviento, the grotesque aquatic mutant Moreau in the reservoir, and the cybernetic genius Heisenberg in his industrial factory.\n\n### Gameplay & Mechanics\nFirst-person survival horror blending fast-paced shooting with defensive blocking, crafting on the fly, and inventory organization. The eccentric traveling merchant, The Duke, offers weapon tuning, specialized ammo recipes, and gourmet dishes prepared from hunted local livestock that permanently boost Ethan's physical attributes.
32	DOOM Eternal	23	20	2020-03-20	9.0	39.99	f	A relentless first-person shooter where the Doom Slayer battles the demonic hordes of Hell across dimensions in fast-paced, brutal combat.	not_started	f	f	/static/images/game_32.jpg	\N	### The Story & Premise\nHell's armies have invaded Earth, wiping out 60% of the human population under the demonic conquest orchestrated by the Khan Maykr and the Deag priests. As the Doom Slayer, an ancient warrior resurrected with god-like wrath and an unquenchable thirst for demon slaying, you are the only entity that stands between humanity's complete annihilation and eternal damnation across dimensions.\n\n### World & Exploration\nA jaw-dropping visual tour de force traversing burning ruins of Earth, ancient Martian sentinel citadels, subterranean lava temples, and the ethereal angelic architecture of Urdak. Exploration features tight first-person platforming using monkey bars, dash mechanics, and wall-climbing to discover secret combat gauntlets and cheat discs.\n\n### Gameplay & Mechanics\nA masterclass in "combat chess" pushed to blistering speed. Every weapon serves a crucial tactical counter: the Flame Belch yields armor, the Chainsaw replenishes ammunition, and visceral Glory Kills harvest health. Juggle the Super Shotgun's Meathook grapple, the shoulder-mounted grenade launcher, and the Crucible blade to dissect demon hordes in flow-state synergy.
34	Persona 5 Royal	24	21	2020-03-31	9.5	59.99	f	A stylish JRPG following a group of high school students who awaken to supernatural powers and fight corruption as the Phantom Thieves.	not_started	f	f	/static/images/game_34.jpg	\N	### The Story & Premise\nWrongfully accused of a crime and placed on probation, a quiet high school student transfers to Shujin Academy in modern Tokyo. Discovering the Metaverseâ€”a surreal supernatural realm formed by humanity's subconscious desiresâ€”he unlocks his Persona and forms the "Phantom Thieves of Hearts" alongside fellow outcast classmates. Together, they infiltrate the palaces of corrupt adults to steal their distorted desires and reform society.\n\n### World & Exploration\nBlends stylish urban Tokyo life across vibrant neighborhoods like Shibuya, Shinjuku, and Akihabara with whimsical, puzzle-filled cognitive Palaces. Explore museum heists, bank vaults, and pirate castles, alongside the procedurally generated subterranean subway labyrinth known as Mementos.\n\n### Gameplay & Mechanics\nCombines turn-based JRPG combat with deep daily life calendar management. Strike enemy elemental weaknesses to trigger the satisfying "Baton Pass" and "All-Out Attack" sequences. Spend school afternoons attending classes, working part-time jobs, and building intimate Confidant relationships that unlock powerful passive combat abilities.
35	Final Fantasy VII Remake	25	22	2020-04-10	8.9	69.99	f	A stunning reimagining of the classic JRPG, expanding the story of Cloud Strife and the eco-terrorist group AVALANCHE in the city of Midgar.	not_started	f	f	/static/images/game_35.jpg	\N	### The Story & Premise\nIn the dystopian industrial metropolis of Midgar, the Shinra Electric Power Company bleeds the planet dry by siphoning its life energy, Mako. Cloud Strife, a cynical ex-SOLDIER mercenary wielded with a colossal Buster Sword, joins the eco-terrorist resistance cell Avalanche led by Barret Wallace and Tifa Lockhart. What begins as a mission to bomb a Mako reactor spirals into an epic confrontation with the legendary fallen hero, Sephiroth.\n\n### World & Exploration\nReimagines the opening act of the legendary 1997 classic with cinematic detail. Explore the eight sectors of Midgar, from the impoverished slums of Sector 7 and the neon entertainment district of Wall Market to the high-tech corporate corridors of Shinra Headquarters.\n\n### Gameplay & Mechanics\nA hybrid battle system that seamlessly blends real-time hack-and-slash combat with strategic turn-based command selection. Fill the Active Time Battle (ATB) gauge to pause time and cast Materia spells, execute tactical weapon abilities, summon colossal deities like Ifrit and Bahamut, and unleash devastating Limit Breaks.
36	Final Fantasy XVI	25	22	2023-06-22	8.5	69.99	f	An action-oriented RPG set in the realm of Valisthea, following Clive Rosfield on a dark, politically charged quest for revenge and redemption.	not_started	f	f	/static/images/game_36.jpg	\N	### The Story & Premise\nIn the war-torn realm of Valisthea, peace is maintained by the Mothercrystalsâ€”towering mountains of crystal that bless the lands with aether. However, the spreading Blight threatens all life, driving rival empires into conflict for the remaining crystals. Clive Rosfield, First Shield of Rosaria, witnesses the brutal destruction of his homeland and embarks on a dark, vengeance-fueled crusade against fate and the godlike Eikons.\n\n### World & Exploration\nA dark, mature medieval fantasy world inspired by gritty feudal politics. Roam through the Grand Duchy of Rosaria, the Holy Empire of Sanbreque, and the desert kingdoms of the Dhalmekian Republic, experiencing grand war camps, ruined bastions, and royal intrigue.\n\n### Gameplay & Mechanics\nA full real-time action-RPG crafted under the combat direction of Ryota Suzuki (Devil May Cry 5). Clive channels the elemental affinities of multiple Eikonsâ€”including Phoenix, Garuda, Titan, and Bahamutâ€”swapping movesets instantly for dizzying aerial juggles, precision parries, and earth-shattering screen-filling boss clashes.
37	Monster Hunter: World	22	19	2018-01-26	9.1	29.99	f	An action RPG where players hunt massive monsters across diverse ecosystems, crafting powerful gear from their spoils.	not_started	f	f	/static/images/game_37.jpg	\N	### The Story & Premise\nAs part of the Fifth Fleet dispatched by the Research Commission, you set sail for the untamed continent known as the New World to investigate the Elder Crossingâ€”a mysterious phenomenon where legendary Elder Dragons migrate across the ocean every decade. You must track and study these titanic beasts, safeguard research outposts, and uncover the cosmic purpose behind the crossing of the bio-energy colossus, Zorah Magdaros.\n\n### World & Exploration\nPioneered seamless, open ecosystem hunting grounds devoid of area transition loading screens. The Ancient Forest, Wildspire Waste, Coral Highlands, and Rotten Vale feature dynamic food chains where predatory wyverns actively hunt prey and engage in dramatic turf wars against rival apex monsters.\n\n### Gameplay & Mechanics\nChoose between 14 iconic weapon categoriesâ€”from the massive Great Sword and agile Dual Blades to technical weapons like the Charge Blade and Insect Glaive. Track quarry using Scoutflies, trap monsters with environmental hazards and the Clutch Claw, and harvest scales, teeth, and gems to forge intricate armor sets and weaponry.
39	Helldivers 2	26	16	2024-02-08	8.5	39.99	f	A cooperative third-person shooter where players fight for Super Earth against alien threats in chaotic, friendly-fire-enabled missions.	not_started	f	f	/static/images/game_39.jpg	\N	### The Story & Premise\nEnlist in the Helldiversâ€”the premier offensive shock troops of Super Earthâ€”and spread Managed Democracy across the galaxy! In a satirical sci-fi universe, Super Earth faces existential threats from two merciless galactic fronts: the swarm of voracious Terminid alien bugs and the cold, mechanical socialist legions of the Automaton cyborgs. Grab a cape, dive into the meat grinder, and fight for freedom!\n\n### World & Exploration\nCooperative four-player missions take place on dynamically contested alien planets featuring volatile planetary hazardsâ€”including fire tornadoes, meteor showers, ion storms, and blinding blizzards. Coordinate orbital drop pod insertions into hostile territory to destroy bug nests, eradicate bot factories, and extract with vital research samples.\n\n### Gameplay & Mechanics\nIntense third-person cooperative gunplay with ever-present friendly fire. Call down devastating Stratagems via directional D-pad input codesâ€”summoning 500kg bombs, orbital railcannon strikes, patriot mech walkers, and automated sentry turrets to survive against terrifying Bile Titans and Automaton Factory Striders.
40	Counter-Strike 2	27	23	2023-09-27	7.5	0.00	t	The latest evolution of the legendary tactical FPS, featuring upgraded visuals, responsive smokes, and refined competitive gameplay.	not_started	f	f	/static/images/game_40.jpg	\N	### The Story & Premise\nThe premier competitive tactical first-person shooter evolved. Built on Valve's Source 2 engine, Counter-Strike 2 represents the largest technical leap forward in Counter-Strike history. Two teams of fiveâ€”Terrorists and Counter-Terroristsâ€”clash in high-stakes rounds of bomb defusal and hostage rescue, where every round demands supreme spatial awareness, teamwork, and surgical aim.\n\n### World & Exploration\nRefreshed, modernized iterations of legendary esports arenas including Dust II, Mirage, Inferno, Nuke, and Overpass. Enhanced with physically based rendering, realistic lighting, and completely overhauled Source 2 material shaders that provide clear visual clarity across all competitive sightlines.\n\n### Gameplay & Mechanics\nPioneered revolutionary volumetric responsive smoke grenades that interact dynamically with the environment, light, and gunfireâ€”momentarily clearing when shot or blasted with HE grenades. Powered by sub-tick architecture that registers movement, shooting, and grenade throws with instantaneous precision.
44	Fortnite	29	25	2017-07-25	7.5	0.00	t	A free-to-play battle royale game featuring building mechanics, vibrant visuals, and frequent crossover events with popular culture franchises.	not_started	f	f	/static/images/game_44.jpg	\N	### The Story & Premise\nDrop from the iconic Battle Bus onto a vibrant, ever-evolving island where 100 players fight to be the last one standing. Beyond its chaotic battle royale premise, Fortnite's universe is governed by the mysterious Zero Pointâ€”a nexus that bridges endless dimensions, pop-culture multiverse crossovers, and reality-altering seasonal narratives.\n\n### World & Exploration\nThe Island continuously transforms with each seasonal chapter, presenting diverse biomes ranging from futuristic neon skylines and ancient temples to medieval citadels and underground vault bunkers. Zip lines, launch pads, vehicles, and grind rails provide endless traversal excitement.\n\n### Gameplay & Mechanics\nPioneered the on-the-fly structural building mechanicâ€”allowing players to harvest wood, stone, and metal to construct walls, ramps, and forts under heavy fire. Also features the immensely popular "Zero Build" mode for pure tactical gunplay, sprint mantling, and gadget mastery alongside Creative sandbox experiences.
45	PUBG: Battlegrounds	30	26	2017-12-20	7.2	0.00	t	The pioneering battle royale shooter that drops 100 players onto a shrinking map to fight for survival using scavenged weapons and equipment.	not_started	f	f	/static/images/game_45.jpg	\N	### The Story & Premise\nThe genre-defining pioneer of battle royale. One hundred players parachute onto a remote, abandoned battleground with zero equipment. Driven by the relentless contraction of an electric blue "Playzone" circle, players must scavenge abandoned houses, military compounds, and airfields for weaponry, armor, and vehicles while hunting down every rival survivor.\n\n### World & Exploration\nFeatures realistic, large-scale tactical maps including the Eastern European forests of Erangel, the vast arid desert of Miramar, the tropical jungles of Sanhok, and the frozen peaks of Vikendi. The expansive scale makes long-range scouting, compound holding, and vehicle rotations crucial.\n\n### Gameplay & Mechanics\nGrounded, military-simulation ballistic gunplay. Weapons feature realistic bullet drop, travel velocity, and intense recoil that requires manual spray control. Scavenge attachments like compensators, extended mags, and 8x scopes while coordinating team callouts, smoke screens, and tactical ambushes.
42	League of Legends	28	24	2009-10-27	8.0	0.00	t	A team-based MOBA where two teams of five champions compete to destroy the opposing team's Nexus in strategic, fast-paced battles.	not_started	f	f	/static/images/game_42.jpg	\N	### The Story & Premise\nSet in the vast fantasy world of Runeterra, heroes, mages, monsters, and divine entities from across warring nationsâ€”such as Demacia, Noxus, Ionia, Piltover, and Zaunâ€”clash in the iconic arena of Summoner's Rift. As a Summoner, you guide legendary champions into 5v5 team battles to shatter the enemy nexus and claim ultimate dominance.\n\n### World & Exploration\nSummoner's Rift is a classic three-lane MOBA battlefield bordered by a dense jungle, neutral monster camps, and river crossings. Dynamic elemental drakes reshape the map's terrain mid-gameâ€”opening new pathways, spawning brush, or summoning wind currents depending on the ruling elemental soul.\n\n### Gameplay & Mechanics\nBoasts a roster of over 160 unique champions across roles including Top, Jungle, Mid, ADC, and Support. Balance last-hitting minions, resource management, vision warding, and item itemization to scale into late-game teamfight deciders capable of unleashing synchronized ultimate ability combos.
48	Portal 2	27	23	2011-04-19	9.6	9.99	f	A brilliant first-person puzzle game featuring innovative portal mechanics, witty writing, and a cooperative campaign alongside a compelling single-player story.	not_started	f	f	/static/images/game_48.jpg	\N	### The Story & Premise\nAwakening hundreds of years after the original game in the decayed, overgrown Aperture Science Enrichment Center, silent protagonist Chell is guided by the chatty, inept personality core Wheatley. However, their escape attempt inadvertently reawakens the vindictive, sardonic artificial intelligence GLaDOS. Tossed into the forgotten bowels of 1950s Aperture, Chell must navigate decades of test chambers to unravel the tragic history of founder Cave Johnson.\n\n### World & Exploration\nA brilliant narrative descent through the architectural history of Aperture Science. From the sanitized, modern robotic test chambers to the cavernous salt-mine depths of the mid-20th century underground complex, every room is filled with sharp environmental storytelling, hilarious voice acting, and puzzle logic.\n\n### Gameplay & Mechanics\nWield the iconic Aperture Science Handheld Portal Device to create interconnected blue and orange wormholes on flat surfaces. Experiment with momentum preservation ("speedy thing goes in, speedy thing comes out"), hard-light bridges, aerial faith plates, excursion funnels, and three distinct mobility gels (Repulsion, Propulsion, and Conversion). Also includes a dedicated cooperative two-player campaign starring robots Atlas and P-Body.
49	Celeste	33	29	2018-01-25	9.2	19.99	f	A critically acclaimed precision platformer following Madeline as she climbs the titular mountain, tackling themes of mental health and self-discovery.	not_started	f	f	/static/images/game_49.jpg	\N	### The Story & Premise\nMadeline is a young woman struggling with severe anxiety, depression, and self-doubt. In a bid to confront her inner demons and prove something to herself, she sets out to climb the treacherous, mystical peak of Celeste Mountain. Along the way, she is forced to confront "Part of Her"â€”a manifestation of her self-loathing and panic attacksâ€”learning that self-compassion, rather than repression, is the only path forward.\n\n### World & Exploration\nCeleste Mountain features eight distinct chapters spanning dilapidated abandoned cities, haunted hotels run by eccentric phantoms, windy golden ridges, and glowing crystal mirror temples. Each chapter introduces clever environmental mechanics like jump pads, moving traffic blocks, and blowing gale winds.\n\n### Gameplay & Mechanics\nPrecision platforming refined to near perfection. Madeline possesses a simple yet deep movement toolkit: jump, wall-climb with limited stamina, and an eight-directional mid-air dash. Every death is instantaneous and instructive, accompanied by an uplifting assist mode that makes the emotional triumph accessible to all players.
54	Far Cry 6	35	28	2021-10-07	7.9	59.99	f	Welcome to Yara, a tropical paradise frozen in time. As dictator Anton Castillo vows to restore his nation, a modern guerrilla revolution ignites.	not_started	f	f	/static/images/game_54.jpg	Dunia Engine 2	### The Story & Premise\nSet on the tropical Caribbean island of Yaraâ€”frozen in time under the authoritarian regime of dictator Anton Castillo (played by Giancarlo Esposito). Anton grooms his reluctant young son Diego to inherit his iron throne, fueling the nation's economy through a miracle cancer drug called Viviro, produced via forced labor. As local revolutionary Dani Rojas, you join the Libertad guerrilla rebellion to overthrow the regime.\n\n### World & Exploration\nThe most expansive Far Cry world to date, boasting Yara's diverse landscapes from tobacco farmlands and dense mangrove swamps to the bustling, heavily occupied capital metropolis of Esperanza. Navigate hidden guerrilla trails (*los senderos*) to bypass military checkpoints undetected.\n\n### Gameplay & Mechanics\nEmbraces DIY guerrilla improvisation known as *Resolver* philosophy. Craft bizarre improvised weaponryâ€”such as CD-launching guns playing 90s pop tracks and fireworks rocket launchersâ€”and equip devastating *Supremo* backpacks that unleash EMP pulses, homing missiles, or healing clouds.
56	The Elder Scrolls V: Skyrim Special Edition	36	20	2016-10-28	9.5	39.99	f	Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life with remastered art, volumetric god rays, and dynamic depth of field.	not_started	f	f	/static/images/game_56.jpg	Creation Engine	### The Story & Premise\nThe Empire of Tamriel is on the brink. The High King of Skyrim has been assassinated, sparking a bloody civil war between the Imperial Legion and the nationalist Stormcloak rebellion. Worse still, ancient dragonsâ€”long believed to be mythical relics of the pastâ€”have returned to scorch the world, led by Alduin the World-Eater. As the prophesied Last Dragonborn (Dovahkiin), only you can speak the dragon language and save the realm from eternal destruction.\n\n### World & Exploration\nSkyrim stands as the definitive milestone of western fantasy open worlds. From the tundras of Whiterun and the autumn canopies of the Rift to the glacier-choked coast of Winterhold and subterranean Dwemer wonders like Blackreach, the world is saturated with endless dungeons, forgotten ruins, and dynamic random events.\n\n### Gameplay & Mechanics\nTotal freedom of character development with no rigid class restrictions: advance skills simply by using them. Master magical schools, heavy two-handed weaponry, dual-wielding, archery, or stealth assassination. Unleash game-altering Dragon Shouts (*Thu'um*) like Unrelenting Force (Fus Ro Dah) and Slow Time.
59	Starfield	36	20	2023-09-06	7.8	69.99	f	Starfield is the first new universe in over 25 years from Bethesda Game Studios. In this next-generation role-playing game set amongst the stars, journey through over 1,000 planets.	not_started	f	f	/static/images/game_59.jpg	Creation Engine 2	### The Story & Premise\nSet in the year 2330, humanity has expanded beyond the solar system, settling new worlds across the Settled Systems. Working as a humble mineral miner, you touch an enigmatic gravitational artifact that triggers kaleidoscopic cosmic visions. Recruited by Constellationâ€”the last group of dedicated space explorers in the galaxyâ€”you embark on a journey across uncharted stars to discover the origins and destiny of the universe.\n\n### World & Exploration\nFeatures over 1,000 planets and moons across dozens of star systems. Explore bustling neon cities like New Atlantis, the cyberpunk underworld of Neon, the rugged frontier town of Akila City, and uncharted alien biomes brimming with bizarre wildlife, abandoned research labs, and ancient alien temples.\n\n### Gameplay & Mechanics\nPilot fully customizable starships, participate in zero-gravity firefights, and engage in high-speed space dogfights. Build planetary mining outposts, harvest resources, research weapon modifications, and unlock reality-bending Starborn gravitational powers across a game-altering New Game Plus cycle.
60	The Last of Us Part I	38	16	2022-09-02	9.7	69.99	f	Experience the emotional storytelling and unforgettable characters of Joel and Ellie in a ravaged civilization infested with fungal infected and ruthless human survivors.	not_started	f	f	/static/images/game_60.jpg	Naughty Dog Engine	### The Story & Premise\nTwenty years after a fungal Cordyceps pandemic obliterates modern civilizationâ€”transforming infected humans into ravenous, mutated horrorsâ€”hardened black-market smuggler Joel is hired to escort a fourteen-year-old girl named Ellie out of an oppressive military quarantine zone. What begins as a routine smuggling job evolves into a profoundly moving cross-country pilgrimage across a ruined America where Ellie may hold the immunological secret to a cure.\n\n### World & Exploration\nRebuilt with breathtaking fidelity using Naughty Dog's modern engine. Journey through overgrown urban ruins where nature has reclaimed Boston, Pittsburgh, Colorado, and Salt Lake City. Decaying skyscrapers, flooded subway concourses, and snow-choked pine forests evoke a poignant sense of fallen beauty.\n\n### Gameplay & Mechanics\nTense, visceral third-person survival combat. Scavenge scarce ammunition, medical supplies, and weapon parts to craft shivs, smoke bombs, and medkits in real time. Use Listen Mode to detect the chilling clicks of blind Clickers and coordinate tactical stealth takedowns against desperate human raiders.
67	Dragon's Dogma 2	22	19	2024-03-22	8.6	69.99	f	A narrative-driven action-RPG that challenges players to choose their own journey. Explore a richly detailed fantasy world alongside Pawns, otherworldly AI companions.	not_started	f	f	/static/images/game_67.jpg	RE Engine	### The Story & Premise\nSet in a richly realized parallel fantasy world caught in a geopolitical struggle between the human kingdom of Vermund and the beastren nation of Battahl. As the Arisenâ€”a warrior whose heart was stolen by the sovereign Dragonâ€”you are prophesied to conquer the beast and claim the throne, navigating deep royal conspiracies, false sovereigns, and divine cycles of creation and destruction.\n\n### World & Exploration\nA vast, immersive open world that eschews modern handholding. Travel is deliberate and perilousâ€”dark nights are genuinely pitch-black, camping supplies are required to recover lost health, and oxcarts can be ambushed along treacherous mountain roads. Secrets and hidden caves reward inquisitive wanderers.\n\n### Gameplay & Mechanics\nFeatures Capcom's renowned action combat allowing players to physically scale giant griffins, minotaurs, and cyclopes to strike weak points. Command three customizable AI companions called "Pawns" who learn from their travels with other players online, offering dynamic combat support, quest knowledge, and tactical guidance.
69	Star Wars Jedi: Fallen Order	31	27	2019-11-15	8.7	39.99	f	An abandoned Padawan must complete his training, develop powerful new Force abilities, and master the art of the lightsaber while staying one step ahead of the Empire's Inquisitors.	not_started	f	f	/static/images/game_69.jpg	Unreal Engine 4	### The Story & Premise\nSet five years after the execution of Order 66 and the purge of the Jedi Order depicted in *Revenge of the Sith*. Cal Kestis, a young Jedi Padawan living in hiding as an industrial scrapper on the planet Bracca, exposes his Force abilities to save a friend. Hunted across the galaxy by Imperial Inquisitorsâ€”led by the lethal Second Sisterâ€”Cal joins the crew of the Stinger Mantis on a quest to rebuild the Jedi Order.\n\n### World & Exploration\nMetroidvania-style planet hopping aboard the Mantis. Explore ancient Zeffo temples, the overgrown forests of Kashyyyk, and the foreboding red sands of Dathomir. Newly acquired Force powers unlock previously inaccessible pathways, shortcuts, and hidden stim chests.\n\n### Gameplay & Mechanics\nMethodical, soulslike lightsaber combat requiring parries, blocks, and stamina management. Upgrade Cal's lightsaber with dual-blade and single-blade configurations, and weave Force Push, Pull, and Slow into combat combos alongside the adorable utility droid companion BD-1.
65	Control	40	30	2019-08-27	8.8	39.99	f	When an otherworldly force invades the Federal Bureau of Control, Jesse Faden becomes the new Director, wielding telekinetic powers and a morphing Service Weapon.	not_started	f	f	/static/images/game_65.jpg	Northlight Engine	### The Story & Premise\nJesse Faden arrives at the Oldest Houseâ€”an unassuming Brutalist skyscraper in New York City that serves as the clandestine headquarters of the Federal Bureau of Control (FBC). Discovering that the Director is dead and the building has been invaded by an otherworldly resonance known as the Hiss, Jesse picks up the supernatural Service Weapon and is declared the new Director, setting out to save the Bureau and find her lost brother Dylan.\n\n### World & Exploration\nThe Oldest House is an ever-shifting paranormal labyrinth defying Euclidean geometry. Brutalist concrete corridors warp, expand, and invert into surreal thresholds, the quarry dimension, and the enigmatic Astral Plane. Environmental destruction physics let telekinetic battles pulverize concrete columns and office cubicles.\n\n### Gameplay & Mechanics\nHigh-mobility telekinetic third-person combat. Jesse wields the shape-shifting Service Weapon alongside extraordinary paranatural abilities: levitation, telekinetic shield barriers, mind control, and hurling massive chunks of masonry and forklifts at foes with devastating launch attacks.
77	Dishonored 2	46	20	2016-11-11	9.0	29.99	f	Play as Emily Kaldwin or Corvo Attano in the coastal city of Karnaca. Use supernatural abilities and gadgetry to combine lethal assassinations or non-lethal stealth.	not_started	f	f	/static/images/game_77.jpg	Void Engine	### The Story & Premise\nFifteen years after the Dunwall Plague, Empress Emily Kaldwin is overthrown in a violent coup orchestrated by the supernatural usurper Delilah Copperspoon. Choosing to play as either Emily Kaldwin or her royal protector father Corvo Attano, you are branded a traitor and flee the capital, voyaging south to the coastal city of Karnaca to reclaim the throne and strip the conspirators of their stolen power.\n\n### World & Exploration\nKarnaca, the "Jewel of the South," is a sun-bleached coastal metropolis powered by massive wind turbines that channel the canyon gusts. Famous for its masterclass level designâ€”including the clockwork mechanism palace of the Clockwork Mansion and the time-bending halls of the Stilton Manor where players shift between past and present in real time.\n\n### Gameplay & Mechanics\nThe pinnacle of immersive sim stealth-action. Emily commands unique Void powers like Far Reach, Shadow Walk, Domino (linking the fates of multiple enemies), and Doppelganger, while Corvo returns with Blink, Bend Time, and Possession. Complete the entire game without killing a single soul or triggering any alarms.
74	Batman: Arkham Knight	44	31	2015-06-23	9.1	19.99	f	The explosive finale to the Arkham trilogy. Scarecrow returns to unite an imposing roster of super villains, while Batman pilots the legendary drivable Batmobile.	not_started	f	f	/static/images/game_74.jpg	Unreal Engine 3	### The Story & Premise\nOn Halloween night, Scarecrow unleashes a new terrifying fear toxin across Gotham City, forcing the evacuation of its six million civilian residents and leaving the metropolis in the hands of the criminal underworld. Teaming up with the enigmatic "Arkham Knight"â€”a mysterious high-tech military warlord who knows Batman's every moveâ€”villains unite for one final night to break the Dark Knight once and for all.\n\n### World & Exploration\nA sprawling, rain-slicked Gotham City rendered with dark photorealism, five times larger than Arkham City. Glide across gargoyles, dive-bomb off Wayne Tower, and speed through the streets in the legendary Batmobile, transitioning seamlessly between interior bank vaults and skyscraper penthouses.\n\n### Gameplay & Mechanics\nIntroduces the fully drivable Batmobile, which shifts between high-speed Pursuit Mode and heavily armed Battle Mode featuring vulcan cannons and missile barrages. Batman's Freeflow combat reaches its apex with Fear Multi-Takedowns that let players drop five armed thugs in a blink, alongside cooperative dual-play takedowns with Nightwing, Robin, and Catwoman.
76	BioShock Infinite	45	32	2013-03-26	9.4	29.99	f	Booker DeWitt must rescue Elizabeth, a mysterious girl imprisoned in the airborne floating city of Columbia. Unravel mind-bending twists of quantum mechanics and devotion.	completed	f	f	/static/images/game_76.jpg	Unreal Engine 3	### The Story & Premise\n1912. Indebted former Pinkerton detective Booker DeWitt is offered a clean slate with a simple mission: "Bring us the girl, and wipe away the debt." He is sent to Columbiaâ€”a breathtaking floating city in the clouds founded by the religious zealot Father Zachary Comstock. Rescuing Elizabeth, a mysterious young woman imprisoned in a colossal angel statue with the ability to tear through spacetime dimensions, Booker sparks a violent revolution between the ruling Founders and the rebel Vox Populi.\n\n### World & Exploration\nColumbia is an extraordinary steampunk floating metropolis suspended by quantum levitation. Sail through clouds, admire neoclassical architecture, and ride high-speed Sky-Lines suspended between floating islands, uncovering secrets of alternate realities, parallel timelines, and temporal paradoxes.\n\n### Gameplay & Mechanics\nCombines visceral first-person gunplay with supernatural abilities called Vigors (such as Murder of Crows, Possession, and Shock Jockey). Elizabeth acts as an intelligent companion in combatâ€”tossing Booker ammo, health, and salts while opening dimensional "Tears" to pull cover, weapons, and turrets into the fight.
84	Battlefield 2042	51	27	2021-11-19	7.1	59.99	f	Experience massive 128-player multiplayer battles with dynamic storms, environmental hazards, wingsuits, and destructive vehicular combat.	not_started	f	f	/static/images/game_84.jpg	Frostbite	### The Story & Premise\nSet in the year 2042 in a world pushed to the brink of collapse by extreme climate catastrophe, failed states, and dwindling global resources. The European Union has dissolved, global satellite networks have blacked out, and a borderless faction of refugee soldiers known as the "Non-Patriated" (No-Pats) fight as proxy mercenaries in a looming global war between the United States and Russia.\n\n### World & Exploration\nMassive, all-out warfare maps designed for up to 128 players across diverse biomes: the desert sand dunes swallow Doha (Hourglass), Antarctic ice shelves crack under hovercraft fire (Breakaway), and South Korean high-tech smart cities (Kaleidoscope). Dynamic extreme weather eventsâ€”including colossal tornadoes and blinding dust stormsâ€”physically tear through maps mid-match.\n\n### Gameplay & Mechanics\nSignature Battlefield sandbox vehicular warfare. Command main battle tanks, jet fighters, attack choppers, and hovercraft alongside specialized No-Pat Specialists equipped with wingsuits, grappling hooks, and recon drones. The innovative "Plus System" allows on-the-fly weapon attachment swapping directly during firefights.
82	Call of Duty: Modern Warfare II	49	17	2022-10-28	8.0	69.99	f	Task Force 141 returns with Captain Price, Ghost, and Soap tackling international cartel smuggling across a cinematic globe-spanning campaign and competitive multiplayer.	not_started	f	f	/static/images/game_82.jpg	IW 9.0	### The Story & Premise\nTask Force 141â€”commanded by Captain John Price, Sergeant Kyle "Gaz" Garrick, Lieutenant Simon "Ghost" Riley, and Sergeant John "Soap" MacTavishâ€”is mobilized when an American missile strike assassinates a high-ranking foreign general. When stolen US ballistic missiles fall into the hands of the terrorist network Al-Qatala in alliance with the Mexican Las Almas drug cartel, Task Force 141 allies with Mexican Special Forces Colonel Alejandro Vargas to neutralize the global threat.\n\n### World & Exploration\nA pulse-pounding globetrotting campaign visiting the US-Mexico border wall, the Amsterdam canals, high-speed highway convoy ambushes in Urzikstan, and tense clandestine night raids across European mansions and offshore oil rigs.\n\n### Gameplay & Mechanics\nFeatures Infinity Ward's peerless weapon handling, realistic recoil animations, and the Gunsmith 2.0 system that provides unprecedented tuning over weapon receivers, barrels, and optics. Mission gameplay ranges from stealth craft diving and AC-130 gunship air support to tense, improvised backpack crafting in behind-enemy-lines survival missions.
80	Metal Gear Solid V: The Phantom Pain	39	34	2015-09-01	9.3	19.99	f	Big Boss awakens from a nine-year coma to establish a private army known as Diamond Dogs. Experience groundbreaking open-world stealth tactical freedom across Afghanistan and Africa.	not_started	f	f	/static/images/game_80.jpg	Fox Engine	### The Story & Premise\n1984. Awakening from a nine-year coma following the destruction of Militaires Sans Frontieres in *Ground Zeroes*, legendary mercenary Big Boss adopts the moniker "Venom Snake." Driven by phantom pain and a thirst for vengeance against the shadowy paramilitary group Cipher and their commander Skull Face, Snake establishes the Diamond Dogs on an offshore Mother Base and enters the Soviet-Afghan War.\n\n### World & Exploration\nSet across vast open-world theatres in arid Soviet-occupied Afghanistan and the border marshlands of Angola-Zaire. Dynamic weather cyclesâ€”including sudden blinding sandstorms and tropical torrential rainsâ€”shift enemy visibility, audio detection cones, and vehicle handling.\n\n### Gameplay & Mechanics\nConsidered by many the pinnacle of emergent third-person tactical stealth. Fulton extraction balloons let players airlift enemy soldiers, vehicles, weapon emplacements, and wild animals back to Mother Base to research hundreds of weapons and gadgets. Deploy alongside unique AI buddies like D-Dog the scout wolf, Quiet the sniper, or the D-Walker battle mech.
85	Titanfall 2	31	27	2016-10-28	9.3	29.99	f	Pilot Jack Cooper and Vanguard-class Titan BT-7274 form an unbreakable bond across one of the highest-rated single-player shooter campaigns in gaming history.	not_started	f	f	/static/images/game_85.jpg	Source Engine	### The Story & Premise\nJack Cooper is an ordinary Frontier Militia rifleman with dreams of becoming a Pilot. When his mentor Captain Tai Lastimosa is killed in action during an ambush on the alien planet Typhon, Lastimosa links his Vanguard-class Titan, BT-7274, to Cooper with his dying breath. Together, the rookie Pilot and the deadpan, highly analytical robot must forge an unbreakable bond to stop the IMC from firing the devastating planet-destroying Fold Weapon.\n\n### World & Exploration\nRenowned as one of the greatest single-player FPS campaigns ever made. Features brilliantly creative, genre-defining levelsâ€”including the time-shifting halls of "Effect and Cause" where players swap between past and present with a wrist device, and the assembly line factory of "Into the Abyss" that builds modular houses mid-combat.\n\n### Gameplay & Mechanics\nA masterclass in momentum and kinetic flow. Pilots wall-run, double-jump, slide, and grapple across environments at breakneck speeds before embarking into BT-7274 to engage in heavyweight Titan brawls swapping between eight diverse Titan loadout chassis on the fly.
88	Sea of Thieves	54	10	2018-03-20	8.6	39.99	f	Sail, fight, dig for treasure, and drink grog on the open seas with your crew in this ultimate pirate sandbox where every ship on the horizon is player-controlled.	not_started	f	f	/static/images/game_88.jpg	Unreal Engine 4	### The Story & Premise\nSet sail for an open-ended pirate paradise in the Sea of Thievesâ€”a colorful, treacherous realm where every sail on the horizon is an actual crew of real players. Guided by the pirate code, you chart your own course to unearth buried treasure, hunt skeletal pirate captains, and earn reputation with trading companies to achieve the coveted title of "Pirate Legend."\n\n### World & Exploration\nA vast, mesmerizing ocean world featuring dynamic wave physics that pitch and roll your vessel realistically. Sail between tropical atolls, volcanic islands in the Devil's Roar, and sunken undersea Siren shrines, contending with sudden squalls, skeleton ghost fleets, and legendary sea monsters like the Megalodon and Kraken.\n\n### Gameplay & Mechanics\nPure physics-based, cooperative sailing and swashbuckling. Crews must manually angle sails, raise the anchor, steer the ship wheel, patch cannonball hull breaches with wooden planks, and bail water with buckets. Engage in cutlass and blunderbuss boarding combat, fire crewmates out of cannons, and play drunken sea shanties on the concertina.
96	Dave the Diver	61	40	2023-06-28	9.3	19.99	f	Explore the mystical Blue Hole by day spearfishing exotic marine life, and manage a buzzing sushi restaurant by night alongside an eccentric cast of friends.	not_started	f	f	/static/images/game_96.jpg	Unity	### The Story & Premise\nDave is a cheerful, laid-back diver who gets roped into a wild dual venture at the mystical "Blue Hole"â€”an enigmatic marine wonder whose geography and fish species shift randomly every time someone dives in. By day, Dave explores the oceanic depths; by night, he helps his eccentric friend Bancho operate a bustling seaside sushi restaurant, serving gourmet delicacies to food critics and unraveling the mystery of the ancient Sea People living below.\n\n### World & Exploration\nThe Blue Hole is a vibrant 2.5D pixel-art marine paradise that changes layout on every dive. Descend from sunny shallow coral reefs to murky limestone caverns, treacherous deep-sea trenches, and the magma-lit hydrothermal vents of the sunken Sea People village.\n\n### Gameplay & Mechanics\nBrilliantly combines two addictive gameplay loops: underwater spearfishing action-adventure by day, and fast-paced restaurant management simulation by night. Upgrade diving suits, harpoon guns, and oxygen tanks; catch exotic fish; hire and train sushi restaurant staff; cultivate rice paddies; and manage fish farms.
91	Deep Rock Galactic	57	15	2020-05-13	9.4	29.99	f	Rock and Stone! 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible procedural alien caves, rich mineral mining, and relentless swarms.	not_started	f	f	/static/images/game_91.jpg	Unreal Engine 4	### The Story & Premise\n"Danger. Darkness. Dwarves." Join Deep Rock Galacticâ€”an interplanetary mining corporation that exploits the richest and most dangerous planetary rock in the galaxy: Hoxxes IV. Play as a team of badass, beard-wearing space dwarves sent on hazardous mining expeditions to extract rare minerals, exterminate hostile alien swarms, and uphold company honor: "Rock and Stone!"\n\n### World & Exploration\nEntirely 100% destructible procedural cave systems located in the subterranean depths of Hoxxes IV. Biomes include crystalline caverns, bio-dense radioactive exclusion zones, magma cores, and glacial strata. Pitch-black darkness requires dwarves to constantly throw flares and scout ceilings with flare guns.\n\n### Gameplay & Mechanics\nExemplary 4-player cooperative class synergy across Gunner (heavy firepower and ziplines), Scout (grappling hook and high-intensity flares), Engineer (automated turrets and platform gun), and Driller (titanium power drills and flamethrower). Mine mineral veins, fight off massive glyphid arachnid swarms, and sprint for the drop pod before the extraction timer expires.
99	Outer Wilds	64	42	2019-05-28	9.6	24.99	f	Winner of BAFTA Best Game. Strap on your boots and pilot your ship into an open-world solar system locked in an endless 22-minute time loop. Uncover the secrets of the Nomai.	not_started	f	f	/static/images/game_99.jpg	Unity	### The Story & Premise\nYou are the newest astronaut of Outer Wilds Ventures, a fledgling space program operating out of the cozy timberland village on Timber Hearth. Equipped with a translator tool for the ancient Nomai language, you launch into a handcrafted solar system to explore the ruins of an extinct civilization. Exactly twenty-two minutes after takeoff, the sun goes supernova and obliterates everythingâ€”only for you to awaken back by the campfire, trapped in an endless time loop.\n\n### World & Exploration\nA clockwork solar system governed by real-time Newtonian orbital physics. Visit planets that change dramatically throughout the 22-minute loop: Brittle Hollow breaks apart and collapses into a black hole; the Hourglass Twins pour sand oceans from one world to the other; and Dark Bramble hides colossal anglerfish within dimensional fog.\n\n### Gameplay & Mechanics\nZero traditional XP or gear upgrades: progression is driven entirely by pure player knowledge. Read Nomai writings, launch scout probes, listen with your signalscope, and piece together the grand mystery on your ship's detective rumor board to learn how to reach the Eye of the Universe.
98	It Takes Two	63	27	2021-03-26	9.6	39.99	f	Game of the Year winner 2021. An inventive pure co-op platform adventure where clashing couple Cody and May are magically transformed into dolls.	not_started	f	f	/static/images/game_98.jpg	Unreal Engine 4	### The Story & Premise\nCody and May are a bickering married couple on the verge of divorce. When their heartbroken daughter Rose sheds tears onto two handmade yarn and clay dolls, Cody and May's consciousnesses are magically transferred into the miniature dolls. Guided by the flamboyant talking relationship self-help book, Dr. Hakim, the couple must work together to overcome wild household obstacles and rekindle their lost love to return to their daughter.\n\n### World & Exploration\nTransforms everyday suburban household locations into fantastical cooperative playgrounds: a garden shed overrun by rebellious vacuum cleaners and militant squirrels, a toy kingdom inside Rose's bedroom, a snow globe winter village, and an acoustic concert hall inside an attic.\n\n### Gameplay & Mechanics\nA pure two-player cooperative experience where split-screen gameplay requires constant communication. Every single level introduces fresh, unique complementary mechanicsâ€”such as May hammering nails into walls while Cody uses a hammer claw to swing across, or manipulating magnetic polarity, time dials, and gravity boots.
100	Disco Elysium - The Final Cut	65	43	2021-03-30	10.0	98.99	f	A legendary isometric detective RPG set in the impoverished city of Revachol. Interrogate unforgettable characters, crack murders, or take bribes with full voice acting.	playing	t	f	/static/images/game_100.jpg	Unity	### The Story & Premise\nYou awaken in a trashed hotel room in the seaside district of Martinaise with the worst hangover in history, having completely obliterated your own memoryâ€”including your name, your past, and your identity. Gradually discovering that you are a detective from the Revachol Citizens Militia (RCM) sent to investigate a lynched man hanging from a tree in the courtyard, you partner with the patient, stoic Lieutenant Kim Kitsuragi to solve the murder while piecing together your broken soul.\n\n### World & Exploration\nMartinaise is a decaying, post-revolutionary coastal district soaked in melancholia, political disillusionment, disco residue, and bitter winter cold. The world is brought to life through extraordinary oil-painting art, atmospheric soundscapes, and full voice acting for every single eccentric character.\n\n### Gameplay & Mechanics\nA groundbreaking RPG featuring zero combat encounters. Everything is resolved through deep, branching dialogue trees, passive skill checks, and dice rolls governed by 24 distinct psychological voices inside your detective's psyche (such as Inland Empire, Shivers, Logic, and Conceptualization). Internalize radical philosophical concepts in your "Thought Cabinet" to radically reshape how your mind perceives the world.
95	Nine Sols	60	39	2024-05-29	9.4	29.99	f	A lore-rich Tao-punk 2D action platformer featuring Sekiro-inspired deflection combat. Explore the forgotten realm of New Kunlun and slay the 9 ancient rulers.	not_started	f	f	/static/images/game_95.jpg	Unity	### The Story & Premise\nSet in the unique world of "Taopunk"â€”a fusion of eastern Taoist philosophy and far-future cyberpunk technology. In the sacred realm of New Kunlun, an ancient feline race known as the Solarians created an eternal sanctuary to escape cataclysm. Awakening from slumber after being betrayed and left for dead, the vengeful hero Yi embarks on a bloody quest to execute the nine Solarian rulersâ€”the "9 Sols"â€”and shatter their false utopia.\n\n### World & Exploration\nA gorgeously animated, hand-drawn 2D world combining high-tech neon laboratories, bio-mechanical greenhouses, and traditional Taoist temples. Uncover dark secrets behind the Solarians' soul-extraction experiments, ancient virus plagues, and the tragic price paid to fuel New Kunlun's immortality.\n\n### Gameplay & Mechanics\nHeavily inspired by *Sekiro: Shadows Die Twice*, Nine Sols emphasizes fast, rhythmic deflections. Parrying enemy attacks charges Yi's Chi energy, which can then be detonated inside enemies with devastating Foo paper talisman slashes. Features tight platforming, grappling hooks, and demanding, spectacular multi-phase boss duels.
94	Hades II	9	8	2024-05-06	9.5	29.99	f	Play as Melinoe, Princess of the Underworld and sister of Zagreus. Channel ancient witchery to defeat the Titan of Time Chronos in this stunning roguelike sequel.	not_started	f	f	/static/images/game_94.jpg	Supergiant Engine	### The Story & Premise\nIn the thrilling sequel to the award-winning roguelike, Chronosâ€”the Titan of Time and wicked father of Hadesâ€”has escaped his underworld prison to wage war on Mount Olympus, taking Hades and Persephone captive. You play as MelinoÃ«, Zagreus's sister and Princess of the Underworld, trained in dark witchcraft by Hecate to descend into the underworld and strike down Time itself.\n\n### World & Exploration\nFeatures an expanded dual-branching world structure: battle downward through the shifting depths of Tartarus and Oceanus to confront Chronos, or venture upward to the surface world through the city of Ephyra to defend the besieged heights of Mount Olympus. Encounter new mythological figures like Apollo, Nemesis, Odysseus, and Narcissus.\n\n### Gameplay & Mechanics\nElevates fast-paced action with dark sorcery and witchcraft. MelinoÃ« weaves Cast circles, channeled Magick strikes, and alchemical Arcana cards into combat with unique weapons like the Witch's Staff, Sister Blades, and Moonstone Axe. Infuse attacks with divine boons from the Olympian pantheon for devastating chain reactions.
71	Assassin's Creed Odyssey	42	28	2018-10-05	8.9	59.99	f	Choose your fate as Alexios or Kassandra. From outcast Spartan mercenary to living Greek hero, embark on an epic journey across ancient Greece during the Peloponnesian War.	completed	f	t	/static/images/game_71.jpg	AnvilNext 2.0	### The Story & Premise\nAncient Greece, 431 BCE. Set during the brutal Peloponnesian War between Athens and Sparta, you forge your own path as either Alexios or Kassandraâ€”a mercenary exile cast out from Sparta as a child due to a tragic prophecy. Wielding the broken Spear of Leonidas, you set out to uncover the truth of your noble lineage and destroy the shadowy Cult of Kosmos manipulating the Greek world.\n\n### World & Exploration\nA colossal open world recreating the Aegean Sea, mainland Greece, and volcanic archipelagos. Explore lush pine forests, golden olive groves, marble temples of Athens, and sunken ruins. Command your warship, the Adrestia, in sweeping naval battles against Spartan and Athenian fleets.\n\n### Gameplay & Mechanics\nA full action-RPG offering dialogue choices, multiple story endings, romance options, and branching allegiance. The Spear of Leonidas bestows supernatural combat abilitiesâ€”such as the iconic Spartan Kick, bull rushes, and teleportation assassinationsâ€”supplemented by an active mercenary bounty hunting system.
61	The Last of Us Part II Remastered	38	16	2024-01-19	9.3	49.99	f	Five years after their dangerous journey across post-pandemic America, Ellie and Joel settle in Wyoming until a traumatic event sends Ellie on an unrelenting quest for vengeance.	not_started	f	f	/static/images/game_61.jpg	Naughty Dog Engine	### The Story & Premise\nFive years after their perilous journey across America, Ellie and Joel have settled into the thriving community of Jackson, Wyoming. When a devastating and traumatic act of violence shatters that hard-won peace, Ellie embarks on an obsessive, unrelenting crusade for vengeance across the rainy ruins of Seattle, while Abby Anderson's parallel journey explores the heartbreaking cyclical nature of grief, empathy, and retribution.\n\n### World & Exploration\nSeattle is rendered with peerless environmental detailâ€”a sodden, moss-draped urban warzone contested between the paramilitary Washington Liberation Front (WLF) and the religious cult known as the Seraphites (Scars). Traversal includes riverboat navigation, rope-swinging puzzles, and swimming through submerged building interiors.\n\n### Gameplay & Mechanics\nDramatically evolves combat mobility with prone crawling through tall grass, dodges, jumping, and silencer crafting. Realistic enemy AI features named squadmates, tracking guard dogs that sniff out human scents, and horrifying mutated monstrosities like the Rat King.
79	Hitman World of Assassination	47	33	2021-01-20	9.1	69.99	f	Enter the world of the ultimate assassin. Become Agent 47 in the definitive assassination sandbox featuring over 20 lavish international locations, disguises, and creative kills.	not_started	f	f	/static/images/game_79.jpg	Glacier Engine	### The Story & Premise\nThe ultimate sandbox compilation of modern stealth. Agent 47â€”the genetically engineered master assassin of the International Contract Agency (ICA)â€”joins forces with his handler Diana Burnwood and long-lost childhood friend Lucas Grey. Together, they embark on a covert globetrotting war to eliminate Providence, an untouchable shadow cabal of global elites who pull the strings of civilization.\n\n### World & Exploration\nFeatures over twenty vast, intricately simulated social sandbox destinations spanning every continent: a Paris fashion show, the sunlit Italian coastal town of Sapienza, a Miami Formula 1 race, a lavish Dubai skyscraper, a neon rain-drenched Chongqing alley, and an Argentine vineyard.\n\n### Gameplay & Mechanics\nUnsurpassed social stealth and puzzle assassination freedom. Disguise yourself in hundreds of authentic uniforms to access restricted zones without suspicion. Eliminate targets through an endless variety of creative methodsâ€”from poisoned champagne and sabotaged stage pyrotechnics to falling chandeliers and classic fiber-wire garrotes.
43	Dota 2	27	23	2013-07-09	8.5	\N	t	A complex MOBA featuring over 100 unique heroes, deep strategic gameplay, and one of the largest esports scenes in gaming.	not_started	f	f	/static/images/game_43.jpg	\N	### The Story & Premise\nSince the dawn of creation, two cosmic fragments of the primordial consciousness known as the Radiant and the Dire have been locked in an eternal war. Falling from the Mad Moon into the mortal world, their magical cores influence and compel the mightiest gods, demons, and warlords from across dimensions to battle continuously to obliterate the opposing Ancient.\n\n### World & Exploration\nA massive, complex competitive map featuring intricate high-ground cliffs, fog-of-war juke spots, destructible trees, secret shops, and river runes. The day/night cycle dynamically influences hero vision cones and passive abilities across the battlefield.\n\n### Gameplay & Mechanics\nRenowned for its unparalleled strategic depth and mechanical complexity. Features creep denying, courier management, turn rates, buybacks, and an expansive roster where every single hero is unlocked from the start. Coordinate devastating teamfight ultimates like Black Hole and Ravage to turn the tide of match.
1	Blasppy 2	1	1	2023-08-24	8.2	29.99	f	A brutal action-platformer set in a dark fantasy world of twisted religious imagery, featuring intense Metroidvania exploration and challenging combat.	completed	f	t	/static/images/game_1.jpg	\N	### The Story & Premise\nAwakened in a strange, newly born land, the Penitent One is thrust once again into an endless cycle of life, death, and resurrection. Following the events of the Wounds of Eventide update from the original journey, the Miracle has birthed a new prophet child, threatening to plunge the realm of Cvstodia and beyond into terrifying divine agony. With no choice but to take up arms once more, you must carve a bloody path through groveling monstrosities and tragic deities to halt the fateful birth.\n\n### World & Exploration\nThe world of Blasphemous 2 is a haunting, intricately woven tapestry of gothic baroque architecture, religious sorrow, and morbid beauty. Exploration is far more non-linear and expansive than before, featuring towering spires, sunken catacombs, and sun-scorched ruins interconnected by secret pathways and platforming puzzles that demand mastery over newly acquired movement abilities.\n\n### Gameplay & Mechanics\nCombat is vastly expanded with three distinct weapon classes: the swift rapier and dagger *Sarmiento & Centella* for lightning strikes and parries, the brutal war sensor *Veredicto* for heavy fiery swings, and the balanced curved blade *Ruego al Alba* for classic blood pact slashes. Each weapon unlocks environmental traversal puzzles, customized weapon memory trees, and grim, devastating executions.
63	Death Stranding Director's Cut	39	16	2021-09-24	8.9	39.99	f	From visionary creator Hideo Kojima comes a genre-defying journey. Carrying the remnants of our future, Sam Porter Bridges must brave supernatural threats to reconnect a fractured world.	not_started	f	f	/static/images/game_63.jpg	Decima Engine	### The Story & Premise\nA catastrophic supernatural event known as the Death Stranding has fractured civilization, causing spectral creatures called Beached Things (BTs) to roam the landscape and lethal Timefall rain to rapidly age anything it touches. Playing as legendary courier Sam Porter Bridges, you are tasked with journeying across an isolated North America to reconnect fractured cities to the Chiral Network and rebuild human connection.\n\n### World & Exploration\nA mesmerizing, austere Icelandic-inspired post-apocalyptic wilderness composed of jagged volcanic boulders, mossy meadows, rushing rivers, and snow-swept mountain ranges. Every pebble and slope presents a physical terrain challenge that requires balance, pathfinding, and ladder placements.\n\n### Gameplay & Mechanics\nPioneered the "strand game" genre where players indirectly assist one another by leaving bridges, zip-lines, safe houses, and warnings across a shared asynchronous online world. Manage cargo weight, center of gravity, and stamina while avoiding BTs with your Bridge Baby (BB) pod and outrunning MULE cargo bandits.
51	Far Cry 3	32	28	2012-11-29	8.8	19.99	f	Beyond the reach of civilization lies an island governed by violence and suffering where Jason Brody must fight for survival against Vaas Montenegro.	not_started	f	f	/static/images/game_51.jpg	Dunia Engine 2	### The Story & Premise\nWhile vacationing on the idyllic Rook Islands, Jason Brody and his wealthy friends are captured by a sadistic syndicate of modern-day pirates led by the psychotic Vaas Montenegro. Escaping captivity with the help of the indigenous Rakyat tribe, Jason is initiated into their ancient warrior rites, gradually descending into a spiral of primal savagery and bloodlust as he transforms from an ordinary tourist into a merciless killer.\n\n### World & Exploration\nThe Rook Islands are a lush tropical playground teeming with perilous wildlifeâ€”including tigers, Komodo dragons, and sharksâ€”and dotted with World War II Japanese bunkers, ancient temples, and pirate outposts. Scale radio towers to unfurl map sectors and liberate pirate bases using stealth or chaotic brute force.\n\n### Gameplay & Mechanics\nDefined the modern open-world FPS formula. Features visceral first-person stealth takedowns, wingsuit gliding, hunting wildlife to craft gear holsters and pouches, and an iconic skill tree represented by the evolving tatau tribal tattoo on Jason's arm.
64	Alan Wake 2	40	25	2023-10-27	9.2	49.99	f	A psychological survival horror masterpiece featuring dual perspectives: FBI agent Saga Anderson investigating ritual murders and writer Alan Wake trapped in the Dark Place.	not_started	f	f	/static/images/game_64.jpg	Northlight Engine	### The Story & Premise\nThirteen years after tortured novelist Alan Wake disappeared into the nightmarish dimension known as the Dark Place, FBI agent Saga Anderson arrives in the Pacific Northwest town of Bright Falls to investigate a string of gruesome ritualistic murders. As Saga investigates the Cult of the Tree, Alan struggles to write a new escape reality from the depths of his surreal imprisonment, their twin narratives bleeding into one another.\n\n### World & Exploration\nA psychological survival horror masterpiece spanning two parallel worlds: the misty, Pacific Northwestern rain forests and idyllic Americana towns of Bright Falls and Watery, and the nightmarish, neo-noir dreamscape of a twisted New York City trapped in perpetual neon rain and shadow.\n\n### Gameplay & Mechanics\nFeatures dual playable protagonists with unique narrative mechanics. Saga uses her mental "Mind Place" to piece together clues, profile suspects, and deduce crime scenes, while Alan manipulates physical reality inside the Dark Place using an Angel Lamp to shift light sources and rewriting plot scenes on his typewriter.
41	Valorant	28	24	2020-06-02	7.8	0.00	t	A tactical 5v5 character-based FPS where precise gunplay meets unique agent abilities in competitive team-based matches.	not_started	f	f	/static/images/game_41.jpg	\N	### The Story & Premise\nSet on a near-future Earth forever altered by the cataclysmic "First Light" event, mysterious Radianite minerals awaken extraordinary powers in select individuals known as "Radiants." As corporate and national factions fight for control over Radianite, the secretive VALORANT Protocol recruits agents from around the world to safeguard global stability against dimensional incursions.\n\n### World & Exploration\nTactically engineered defusal battlegrounds spanning Italian canals (Ascent), Moroccan desert bazaars (Bind), futuristic research labs (Fracture), and tropical islands (Breeze). Maps incorporate unique layout mechanics such as one-way teleporters, ziplines, and dynamic mechanical doors.\n\n### Gameplay & Mechanics\nA 5v5 character-based tactical hero shooter combining crisp, precise gunplay with diverse agent abilities categorized into Duelists, Initiators, Controllers, and Sentinels. Success requires coordinating flashbangs, smokes, recon darts, and ultimate abilities to execute site takes and defuse the Spike.
73	Assassin's Creed Mirage	43	28	2023-10-05	8.1	49.99	f	A heartfelt tribute to the roots of the franchise. Experience the journey of Basim from clever street thief to master assassin through the vibrant golden age of Baghdad.	completed	f	t	/static/images/game_73.jpg	Ubisoft Anvil	### The Story & Premise\nSet in vibrant 9th-century Baghdad during its Islamic Golden Age, Mirage follows Basim Ibn Ishaqâ€”a cunning street thief haunted by terrifying nightmarish visions of a djinn. Rescued from the streets by his mentor Roshan, Basim is inducted into the ancient Hidden Ones at the mountain fortress of Alamut, embarking on a coming-of-age journey to champion justice and uncover his mysterious true destiny.\n\n### World & Exploration\nA heartfelt return to the franchise's roots, focusing on a dense, vibrant urban sandbox. Baghdad is split into four lively districtsâ€”including the Round City and the sprawling bazaars of Karkhâ€”designed specifically for fluid, continuous rooftop parkour, pole-vaulting, and street-level stealth.\n\n### Gameplay & Mechanics\nRefocuses on core stealth pillars: stealth assassinations, social blending in crowds, whistling from hiding spots, and tactical gadget deployment (throwing knives, smoke bombs, blowdarts). The Assassin's Focus ability allows Basim to slow time and chain multiple rapid assassinations in succession.
53	Far Cry 5	32	28	2018-03-27	8.2	59.99	f	Welcome to Hope County, Montana, land of the free and the brave, but also home to a fanatical doomsday cult known as Eden's Gate led by Joseph Seed.	not_started	f	f	/static/images/game_53.jpg	Dunia Engine 2	### The Story & Premise\nWelcome to Hope County, Montanaâ€”home to a fanatical doomsday cult known as the Project at Eden's Gate, led by the charismatic "Father" Joseph Seed and his three heralds. When a federal attempt to arrest Joseph goes violently awry, a rookie junior deputy is trapped in the valley, uniting a fierce local resistance to take back rural America before the prophesied apocalypse strikes.\n\n### World & Exploration\nA picturesque slice of big sky Montana divided into three distinct regions: Holland Valley (John Seed), Henbane River (Faith Seed), and Whitetail Mountains (Jacob Seed). Explore expansive farmlands, dense pine forests, and mountain rivers by muscle cars, seaplanes, helicopters, and fishing boats.\n\n### Gameplay & Mechanics\nFeatures the "Guns for Hire" and "Fangs for Hire" companion systemâ€”allowing players to fight alongside specialized allies like Boomer the hound dog, Cheeseburger the diabetic grizzly bear, and sniper Grace Armstrong. Open-ended mission structures let players tackle cult strongholds in any order.
47	Rainbow Six Siege	32	28	2015-12-01	8.0	19.99	f	A tactical FPS focused on environmental destruction, team coordination, and operator abilities in intense close-quarters combat scenarios.	not_started	f	f	/static/images/game_47.jpg	\N	### The Story & Premise\nReactivating the multinational elite counter-terrorist unit known as Team Rainbow, Siege thrusts operators into close-quarters tactical sieges against rogue global threats. Elite specialists recruited from real-world counter-terrorist agenciesâ€”such as SAS, FBI SWAT, GIGN, and GSG 9â€”face off in intense, asymmetric 5v5 attacker versus defender warfare.\n\n### World & Exploration\nCompact, highly detailed interior complexes such as banks, embassies, chalets, and skyrise penthouses. The revolutionary environmental destruction engine allows bullets, breaching charges, and sledgehammers to tear through unreinforced drywall, wooden floors, and barricades to create new sightlines.\n\n### Gameplay & Mechanics\nTactical strategy where intel is life. Attackers deploy surveillance drones and breach defenses, while defenders fortify walls, lay barbed wire, and place traps. Operators bring specialized high-tech gadgets, and lethal single-headshot mechanics ensure that patience, crosshair placement, and communication reign supreme.
55	Far Cry Primal	32	28	2016-02-23	7.7	29.99	f	Welcome to the Stone Age, an era of extreme danger where giant mammoths and sabretooth tigers rule the Earth and humanity is at the bottom of the food chain.	completed	f	t	/static/images/game_55.jpg	Dunia Engine 2	### The Story & Premise\nTransporting the series back to 10,000 BCE during the Stone Age, you play as Takkar, a seasoned hunter who is the sole survivor of an ambushed hunting expedition. Arriving in the majestic valley of Oros, Takkar must rebuild his shattered Wenja tribe from the brink of extinction while battling the cannibalistic Udam tribe of the frozen north and the sun-worshipping Izila fire-masters.\n\n### World & Exploration\nThe untamed European ice age wilderness of Oros is filled with towering mammoths, sabretooth cats, cave bears, and dire wolves. Dynamic night cycles transform the lush wilderness into a terrifying gauntlet where predators actively hunt humans in the dark.\n\n### Gameplay & Mechanics\nReplaces modern firearms with crafted Stone Age weaponry: clubs, flint-tipped spears, and double-bows. Takkar is the first Beast Master, capable of taming wild apex predators to fight alongside him or riding mammoths and sabretooth cats into battle, while commanding an owl scout for aerial reconnaissance and bombing runs.
83	Call of Duty: Warzone	50	17	2020-03-10	7.9	0.00	t	Massive free-to-play battle royale featuring up to 150 players, the Gulag redeployment arena, weapon loadouts, and intense extraction shootouts.	completed	f	f	/static/images/game_83.jpg	IW 9.0	### The Story & Premise\nThe premier free-to-play battle royale evolution in the Call of Duty franchise. Up to 150 players drop into massive, contested military warzones where extraction, contracts, and combat supremacy dictate survival. Continuously updated across seasonal narratives that tie directly into the broader Modern Warfare and Black Ops canon.\n\n### World & Exploration\nIconic sprawling battlegrounds such as the legendary Verdansk, the sun-baked desert metropolis of Al Mazrah, and the fast-paced resurgence maps of Ashika Island and Rebirth Island. Features multi-level skyscraper ziplines, drivable armored trucks, speedboats, and helicopters.\n\n### Gameplay & Mechanics\nHigh-octane first-person battle royale gunplay. Complete in-match Contracts (Bounties, Scavengers, Most Wanted) to earn cash at Buy Stations for personalized Loadout Drops and Killstreaks. Eliminated players are sent to the infamous Gulagâ€”a tense 1v1 gunfight arena where victory grants immediate redeployment into the match.
93	Balatro	59	38	2024-02-20	9.7	14.99	f	Hypnotically addictive roguelike poker deckbuilder. Play illegal poker hands, discover 150+ game-breaking jokers, and trigger chain reactions to beat the blinds.	not_started	f	f	/static/images/game_93.jpg	LOVE2D	### The Story & Premise\nBalatro is a mind-bending, hypnotically addictive roguelike deck-builder that reimagines the centuries-old game of poker. Set against a psychedelic CRT-retro backdrop with soothing lo-fi synthwave rhythms, your goal is simple: play illegal poker hands, uncover game-changing wild cards, and score astronomical chip counts to defeat increasingly demanding Blinds and the sinister Boss Blinds.\n\n### World & Exploration\nA minimalist, hypnotic casino-inspired interface designed around runs of 8 Antes. Each Ante consists of a Small Blind, Big Blind, and an antagonistic Boss Blind that imposes devious restrictionsâ€”such as debuffing all heart cards, discarding hands randomly, or setting money to zero.\n\n### Gameplay & Mechanics\nPlay valid poker hands (Full House, Flush, Straight, Five of a Kind) to score Chips multiplied by Mult. The magic lies in the 150 unique Joker cardsâ€”which trigger escalating multiplier combos, re-trigger card scoring, transform card suits, and scale into the billions and trillions of points. Supplement your build with Tarot cards, Planet cards, and Spectral cards.
92	Slay the Spire	58	37	2019-01-23	9.6	24.99	f	The definitive deck-building roguelike. Craft a custom deck from hundreds of cards, discover relics of unimaginable power, and scale the ever-shifting Spire.	not_started	f	f	/static/images/game_92.jpg	LibGDX	### The Story & Premise\nAt the center of a dying, mysterious realm stands the Spireâ€”a monolithic, ever-changing structure guarded by ancient cultists, corrupt automatons, and eldritch horrors. Embarking on a perilous ascent with one of four distinct heroes, you must fight through branching floors, slay the Corrupt Heart within, and shatter the loop binding souls to the Spire.\n\n### World & Exploration\nA tactical map-crawling journey through three increasingly dangerous acts (Exordium, The City, and The Beyond). Choose your path wisely between normal monster encounters, elite foes, question-mark narrative mystery rooms, merchants, and rest sites to heal or upgrade cards.\n\n### Gameplay & Mechanics\nThe definitive pioneer of the roguelike deck-builder genre. Choose from four classes: The Ironclad (brute strength, armor, and demon pacts), The Silent (shivs, poisons, and discard combos), The Defect (programmable elemental orbs and energy manipulation), and The Watcher (martial stances: Calm, Wrath, and Divinity). Synergize hundreds of cards with powerful relics to build game-breaking infinite engine combos.
90	Lethal Company	56	36	2023-10-23	9.3	9.99	f	Scavenge industrial scrap on hazardous moons to meet the Company's quota while avoiding terrifying monsters lurking in claustrophobic corridors with proximity voice chat.	not_started	f	f	/static/images/game_90.jpg	Unity	### The Story & Premise\nYou are a contracted worker for "The Company." Your job: visit abandoned, industrialized exomoons to scavenge scrap metal and electronics to satisfy the Company's ever-increasing profit quota. If you meet the quota, you live to see another contract; if you fail, you are ejected out of the ship's airlock into the cold vacuum of space.\n\n### World & Exploration\nProcedurally generated industrial bunker facilities and steel complexes located across desolate moons. Navigate fog, stormy rain with lightning strikes, and pitch-black interiors where flashlight batteries deplete rapidly. Eerie environmental audio design amplifies the creeping terror of what lurks in the vents.\n\n### Gameplay & Mechanics\nHilarious yet deeply terrifying four-player cooperative survival horror. Coordinate via proximity voice chatâ€”meaning players who walk too far away or get dragged into the dark can only be heard screaming faintly in the distance. Scavenge scrap while evading lethal terrors like Brackens, Coil-Heads, Jester music boxes, and Eyeless Dogs outside.
81	Halo Infinite	48	10	2021-11-15	8.5	59.99	f	When all hope is lost, Master Chief confronts the ruthless Banished on the open ringworld Zeta Halo, wielding the grappleshot to revolutionize combat traversal.	not_started	f	f	/static/images/game_81.jpg	Slipspace Engine	### The Story & Premise\nWhen all hope is lost and humanity's fate hangs in the balance, the Master Chief returns to confront the most ruthless foe he has ever faced: the Banished, led by the brutal Brute warlord Escharum. Stranded on the shattered, mysterious ringworld of Zeta Halo (Installation 07) alongside a desperate UNSC pilot and a spunky new AI companion named "The Weapon," the Chief fights to liberate the ring and uncover Cortana's fate.\n\n### World & Exploration\nThe first open-world campaign in Halo history, featuring Zeta Halo's sweeping pine forests, forerunner spire caverns, and majestic hexagonal basalt cliffs. Liberate Forward Operating Bases (FOBs), rescue captured UNSC marine squads, hunt Banished high-value targets, and explore ancient Forerunner ring installations.\n\n### Gameplay & Mechanics\nReinvents classic Halo "golden triangle" combat (guns, grenades, melee) with the game-changing Grappleshotâ€”allowing the Chief to slingshot up sheer cliffs, snatch weapons from mid-air, hijack flying Banshees, and reel into enemy Brutes with a thunderous kinetic punch.
78	Prey	46	20	2017-05-05	8.8	29.99	f	Awaken aboard Talos I, a lavish space station overrun by shapeshifting alien Typhon. Use your wits, weapons, and mind-bending abilities to survive.	not_started	f	f	/static/images/game_78.jpg	CryEngine	### The Story & Premise\nSet aboard the Talos I space station in an alternate 2032 where President Kennedy survived assassination and accelerated the space race. You awaken as Morgan Yu, the lead researcher on a revolutionary project to augment human neurology using Typhon alien biology. When the Typhon organisms break containment and slaughter the crew, Morgan must piece together erased memories and decide whether to save or destroy the station.\n\n### World & Exploration\nTalos I is a seamlessly interconnected Art Deco orbital megastructure that can be traversed internally or through the silent exterior vacuum of space. Every office, crew cabin, and maintenance shaft is physically simulated with consistent spatial logic, offering multiple pathways based on computer hacking, repair skills, or alien shapeshifting.\n\n### Gameplay & Mechanics\nA premier sci-fi immersive sim emphasizing creative problem-solving. Wield the iconic GLOO Cannon to freeze enemies, extinguish fires, insulate electrical hazards, and build makeshift staircases up walls. Inoculate yourself with Typhon Neuromods to mimic any physical objectâ€”from coffee mugs to turretsâ€”and unleash psionic shockwaves.
75	Batman: Arkham City	44	31	2011-10-18	9.6	19.99	f	Fly across the super-prison city containing Gotham's most notorious criminals. Featuring an all-star rogue's gallery including Joker, Two-Face, Penguin, and Mr. Freeze.	not_started	f	f	/static/images/game_75.jpg	Unreal Engine 3	### The Story & Premise\nMayor Quincy Sharp has cordoned off the decaying slums of Gotham to create "Arkham City"â€”a colossal open-air super-prison where Gotham's most dangerous thugs and supervillains are left free to wage war under the watchful eye of Dr. Hugo Strange and his private military force, Tyger Security. Injected with a lethal dose of Titan-infected blood by a dying Joker, Batman must fight across the prison to find a cure and stop the mysterious Protocol 10.\n\n### World & Exploration\nA masterclass in atmospheric urban design. Explore the snowy, dilapidated districts of Arkham City, including the flooded Amusement Mile, the industrial steel mill, and the sunken underground ruins of Wonder City. Every corner hides cryptographic secrets, forensic crime scenes, and Riddler challenges.\n\n### Gameplay & Mechanics\nPerfected the Freeflow combat and Predator stealth systems. Counter multiple enemies simultaneously, use gadgets seamlessly mid-combo (batarangs, batclaw, explosive gel), and glide across rooftops using the Grapnel Boost. Also features playable story chapters starring Catwoman with her agile whip-fighting mechanics.
62	Uncharted: Legacy of Thieves Collection	38	16	2022-01-28	9.0	49.99	f	Seek your fortune and leave your mark across cinematic globe-trotting action in remastered editions of Uncharted 4: A Thief's End and Uncharted: The Lost Legacy.	not_started	f	f	/static/images/game_62.jpg	Naughty Dog Engine	### The Story & Premise\nA dual-adventure compilation uniting *Uncharted 4: A Thief's End* and *Uncharted: The Lost Legacy*. In *A Thief's End*, retired fortune hunter Nathan Drake is pulled back into the world of thieves when his long-lost brother Sam resurfaces, seeking the legendary pirate colony of Libertalia and Henry Avery's lost treasure. In *The Lost Legacy*, Chloe Frazer and Nadine Ross venture into the Western Ghats of India to unearth the ancient Golden Tusk of Ganesh.\n\n### World & Exploration\nFeatures some of the most cinematic vistas in video games: the sun-bleached coastal towns of Italy, the muddy savannas and dormant volcanoes of Madagascar, decaying pirate archipelagos, and ancient Hoysala temples in southern India. Dynamic jeep driving sequences offer wide-linear exploration.\n\n### Gameplay & Mechanics\nSeamlessly fuses exhilarating third-person gunplay with fluid climbing, swinging via Nathan's versatile grappling hook, and vehicular winch puzzles. Set pieces unfold with blockbuster movie pacing, featuring breathless vehicle chases, crumbling tower escapes, and intense hand-to-hand brawls.
58	Fallout: New Vegas	37	20	2010-10-19	9.2	9.99	f	Welcome to New Vegas. It is the kind of town where you dig your own grave prior to being shot in the head and left for dead. Battle for control of the Mojave wasteland and the Hoover Dam.	not_started	f	f	/static/images/game_58.jpg	Gamebryo	### The Story & Premise\nYou are a Mojave Express Courier contracted to deliver a mysterious package containing a platinum poker chip to the New Vegas Strip. Intercepted, shot in the head, and left buried in a shallow grave in Goodsprings by a checkered-suit mobster named Benny, you survive thanks to a friendly Securitron robot. Embarking on a quest for vengeance, you become the decisive wildcard in a grand factional war for control of the Hoover Dam.\n\n### World & Exploration\nThe sun-drenched, radioactive Mojave Wasteland surrounds the glittering neon jewel of New Vegas. Explore decaying desert towns, Hoover Dam, Nellis Air Force Base, and casino resorts where the clash between the democratic New California Republic (NCR), the brutal slaving legions of Caesar's Legion, and the enigmatic ruler Mr. House unfolds.\n\n### Gameplay & Mechanics\nDeveloped by Obsidian Entertainment, it is hailed as a masterclass in narrative branching and role-playing freedom. Every quest offers numerous diplomatic, stealth, scientific, or combat outcomes. Features the grueling Hardcore Mode requiring food, water, and sleep management, alongside deep dialogue skill checks.
57	Fallout 4	36	20	2015-11-10	8.8	19.99	f	As the sole survivor of Vault 111, enter a post-apocalyptic Boston wasteland destroyed by nuclear war. Rebuild settlements, craft weapons, and decide the fate of the Commonwealth.	not_started	f	f	/static/images/game_57.jpg	Creation Engine	### The Story & Premise\nOctober 23, 2077: nuclear war devastates the globe. You and your family are secured inside Vault 111, placed into cryogenic suspension. Awakening 210 years later to witness your spouse murdered and your infant son Shaun kidnapped by unknown operatives, you step out into the irradiated ruins of post-apocalyptic Bostonâ€”known as the Commonwealthâ€”as the "Sole Survivor" determined to track down your son.\n\n### World & Exploration\nThe Commonwealth is an atmospheric fusion of 1950s retro-futuristic Americana and nuclear wasteland decay. Explore the sunken ruins of historic Boston landmarks, irradiated toxic glowing craters (the Glowing Sea), subway networks, and coastal lighthouses, uncovering the mystery of synthetic humans produced by the elusive Institute.\n\n### Gameplay & Mechanics\nCombines refined real-time shooting with the strategic VATS targeting system that slows time to target individual limbs. Deep settlement building lets players gather wasteland scrap to construct fortified villages with electricity, water purifiers, and turrets, alongside extensive Power Armor modular customization.
70	Star Wars Jedi: Survivor	31	27	2023-04-28	8.8	69.99	f	No longer a Padawan, Cal Kestis has matured into a powerful Jedi Knight. Pushed to the edges of the galaxy by the Empire, he must fight for a sanctuary in the darkness.	not_started	f	f	/static/images/game_70.jpg	Unreal Engine 4	### The Story & Premise\nPicking up five years after *Fallen Order*, Cal Kestis is no longer a Padawan, but a mature, battle-hardened Jedi Knight fighting a lonely, desperate war against the tightening grip of the Galactic Empire. When an ancient High Republic Jedi named Dagan Gera is awakened from centuries of stasis, Cal discovers rumors of Tanalorrâ€”a hidden, unreachable paradise planet that could serve as a sanctuary from the Empire.\n\n### World & Exploration\nFeatures expansive hub worldsâ€”particularly the sprawling frontier planet Koboh and the windswept desert moon of Jedha. Ride tame alien mounts, deploy the ascension grappling cable, and explore colossal canyons, ancient Jedi chambers, and frontier outposts filled with colorful NPC recruits who revitalize Pyloon's Saloon.\n\n### Gameplay & Mechanics\nVastly expands lightsaber combat with five distinct combat stances: Single, Double-Bladed, Dual Wield, Crossguard (heavy, hard-hitting defense), and Blaster Stance (combining lightsaber slashes with ranged pistol shots). Deep perk trees and acrobatic traversal make combat and exploration remarkably fluid.
86	Forza Horizon 5	52	10	2021-11-09	9.2	59.99	f	Drive hundreds of the world's greatest cars across vibrant Mexican deserts, lush jungles, historic cities, hidden ruins, and an active caldera volcano.	play_later	f	f	/static/images/game_86.jpg	ForzaTech	### The Story & Premise\nThe Horizon Festival heads to the vibrant, breathtaking landscapes of Mexico. As an acclaimed Horizon Festival Champion and expedition leader, you are invited to establish and expand festival outposts across the country, discovering ancient Mayan temples, climbing an active caldera volcano, and racing against storm-chasing weather phenomena in the ultimate celebration of automotive passion.\n\n### World & Exploration\nThe largest, most diverse open world in Forza history. Mexico is recreated with incredible botanical accuracy across 11 distinct biomes: living deserts, lush tropical jungles, historic colonial cities like Guanajuato with subterranean road tunnels, pristine coastal beaches, and towering mountain switchbacks.\n\n### Gameplay & Mechanics\nFeaturing over 800 meticulously modeled real-world licensed vehicles with authentic engine acoustics and handling physics. Compete in street races, off-road dirt rallies, speed traps, and cross-country expeditions, alongside community creation tools in the EventLab sandbox.
50	Ori and the Will of the Wisps	34	10	2020-03-11	9.2	29.99	f	A visually stunning action-platformer Metroidvania following the spirit Ori on an emotional quest through a beautiful yet dangerous forest.	not_started	f	f	/static/images/game_50.jpg	\N	### The Story & Premise\nFollowing the dramatic conclusion of *Ori and the Blind Forest*, the guardian spirit Ori adopts and raises the fragile young owlet Ku. When Ku's maiden flight is caught in a violent storm, the two are separated and cast into the blighted, decaying forest of Niwen. Ori must embark on an emotional journey to reunite with Ku, restore the shattered Spirit Willow, and purge the parasitic Decay threatening the creatures of the woods.\n\n### World & Exploration\nA hand-painted audiovisual masterpiece. Niwen is a vast, interconnected 2D fantasy realm featuring glowing underwater lagoons, gloomy spider-infested depths (Mouldwood Depths), sandy wind-swept ruins, and snowy mountain peaks. Every frame is brought to life with orchestral music and multi-plane parallax art.\n\n### Gameplay & Mechanics\nSignificantly evolves combat over its predecessor, trading passive homing flames for active spirit weapons including the Spirit Edge sword, Spirit Arc bow, and heavy Spirit Smash hammer. Unlocks dynamic movement abilities such as the Burrow sand-dash and Grapple, culminating in thrilling, high-stakes boss chases with no combat checkpoints.
72	Assassin's Creed Valhalla	32	28	2020-11-10	8.4	59.99	f	Lead legendary Viking raids against Saxon strongholds across Dark Age England. Build settlements, customize your raider clan, and secure your clan's glory in Valhalla.	play_later	t	f	/static/images/game_72.jpg	AnvilNext 2.0	### The Story & Premise\nDriven from Norway by endless wars and dwindling resources in the 9th century CE, Eivor Wolf-Kissed leads a clan of Norse warriors across the North Sea to settle the fractured, war-torn kingdoms of Anglo-Saxon England. Establishing the settlement of Ravensthorpe, Eivor must forge alliances with rival Saxon kings and Danish warlords while battling the secretive Order of the Ancients.\n\n### World & Exploration\nA vast medieval tapestry contrasting the icy fjords and northern lights of Norway with the rolling green meadows, marshlands, and Roman ruins of Wessex, Mercia, and Northumbria. Sound your horn to initiate Viking river raids on monasteries aboard longships, gathering wealth to expand your clan settlement.\n\n### Gameplay & Mechanics\nVisceral dual-wielding combat allowing players to mix and match any weapon combinationsâ€”including dual bearded axes or dual shields. Stomp stunned foes with bone-crunching executions, participate in poetic Viking rap battles called "Flyting," and experience mythical dream journeys into Asgard and Jotunheim.
89	Palworld	55	35	2024-01-19	8.7	29.99	f	Collect mysterious creatures called Pals to fight, build bases, automate factories, and explore a vast wilderness in this explosive viral survival phenomenon.	completed	f	t	/static/images/game_89.jpg	Unreal Engine 5	### The Story & Premise\nStranded upon the mysterious Palpagos Islands, you awaken in an uncharted archipelago inhabited by over a hundred species of mysterious creatures known as "Pals." In this unforgiving survival paradise, you must capture Pals, build thriving automated factory bases, survive harsh elemental biomes, and defend your settlements against villainous poachers and syndicate bosses.\n\n### World & Exploration\nA sprawling open-world landscape comprising verdant meadows, sweltering volcanic wastes, frozen snowy peaks, and ancient dungeon ruins. Traverse the map by riding Pals on land, swimming across oceans, or soaring through the skies on flying mounts while hunting rare, colossal "Alpha Pals."\n\n### Gameplay & Mechanics\nCombines monster-taming mechanics with third-person survival shooting and base automation. Assign Pals to plant crops, generate electricity, mine minerals, and craft assault rifles based on their work suitability. Equip Pals with machine guns, rocket launchers, and saddle abilities to fight alongside you in high-stakes combat encounters.
12	Minecraft	11	10	2011-11-18	9.0	29.99	f	A sandbox survival game where players explore, gather resources, craft tools, and build anything they can imagine in a procedurally generated block world.	completed	f	t	/static/images/game_12.jpg	\N	### The Story & Premise\nDrop into an infinite, procedurally generated voxel world where the only limitation is your own imagination. From the tranquil sunrise over rolling green hills to the eerie echoes of pitch-black caverns, Minecraft is the quintessential sandbox of survival and creation, inviting adventurers to build towering monuments, unearth hidden relics, and ultimately face the Ender Dragon at the End of all things.\n\n### World & Exploration\nEncompasses three distinct dimensions: the expansive Overworld boasting dozens of biomes from lush jungles to frozen tundras, the fiery hellscape of the Nether brimming with fortresses and bastions, and the mysterious void of the End. Deep below the surface lie abandoned mineshafts, ancient cities guarded by the terrifying Warden, and subterranean rivers.\n\n### Gameplay & Mechanics\nMine raw ores, smelt tools, craft complex redstone circuitry for automated machinery, and erect architectural wonders block by block. Survive hungry nights against Creepers, Skeletons, and Endermen in Survival Mode, or unleash pure artistic potential with unlimited resources in Creative Mode.
21	Marvel's Spider-Man Remastered	19	16	2020-11-12	9.0	59.99	f	An open-world action-adventure where players swing through a stunning recreation of Marvel's New York City as the iconic Spider-Man.	wont_play	f	f	/static/images/game_21.jpg	\N	### The Story & Premise\nPeter Parker is an experienced superhero, having spent eight years swinging through the streets of New York City and keeping criminals at bay. Balancing his chaotic personal life, his career alongside mentor Dr. Otto Octavius, and his complicated relationship with Mary Jane Watson, Peter finds his world upended when the mysterious Inner Demons and their leader Mister Negative ignite a gang war that threatens to destroy Manhattan.\n\n### World & Exploration\nA hyper-detailed, vibrant digital recreation of Manhattan that feels electric from Central Park down to the Financial District. Landmarks like the Empire State Building sit alongside Marvel lore staples such as Avengers Tower, the Sanctum Sanctorum, and the Wakandan Embassy.\n\n### Gameplay & Mechanics\nThe gold standard for superhero web-swinging physics, delivering exhilarating momentum, wall-running, and aerial acrobatics. Combat is fluid and kinetic, allowing players to web up thugs, ricochet off environmental obstacles, deploy high-tech gadgets like web bombs and spider-drones, and unlock dozens of iconic comic suits.
97	Cuphead	62	41	2017-09-29	9.3	19.99	f	Classic run-and-gun action game heavily inspired by 1930s rubber-hose animation. Battle colossal bosses in handcrafted watercolor environments to repay your debt to the Devil.	play_later	t	f	/static/images/game_97.jpg	Unity	### The Story & Premise\nCuphead and his brother Mugman make a reckless gamble at the Devil's Casino in Inkwell Isle and lose their souls to the Devil himself. Desperate to save themselves, the brothers strike a bargain: if they can track down and collect the soul contracts of the Devil's runaway debtors scattered across the island before midnight, their souls will be spared.\n\n### World & Exploration\nAn extraordinary visual and musical achievement entirely hand-drawn and colored using traditional 1930s rubber hose animation techniques, complete with cel grain, watercolor backgrounds, and a live original jazz big band score. Inkwell Isle is split into three overworld islands packed with eccentric cartoon denizens and secret shortcuts.\n\n### Gameplay & Mechanics\nDemanding run-and-gun and boss-rush action. Learn complex multi-phase boss attack patterns, master the crucial pink-object parry slap to build super meters, and swap between projectile shots (Peashooter, Spread, Chaser, Charge, Roundabout) while dodging screen-filling bullet hell patterns.
16	Subnautica	15	14	2018-01-23	8.8	29.99	f	An underwater survival adventure game set on an alien ocean world, where players must explore, craft, and survive in a beautiful yet dangerous environment.	completed	f	t	/static/images/game_16.jpg	\N	### The Story & Premise\nAfter your capital vessel, the Aurora, crash-lands on the uncharted ocean planet 4546B, you are left stranded in a solitary life pod floating amidst an endless alien sea. With oxygen running low and communications failing, you must dive into the unknown to gather sustenance, piece together why the ship was shot down, and seek a cure for a lethal alien bacterium known as the Kharaa.\n\n### World & Exploration\nA spellbinding yet terrifying underwater ecosystem that descends from tranquil sunlit coral reefs to pitch-black oceanic abysses. Traverse kelp forests, underwater geothermal vents, luminous mushroom caves, and the terrifying depths of the Grand Reef and Lava Lakes, all while navigating the predatory territory of gargantuan Leviathans.\n\n### Gameplay & Mechanics\nTrue survival horror disguised as oceanic exploration. Monitor oxygen supply, hydration, and hunger while scavenging titanium and quartz with your survival fabricator. Blueprint and construct underwater modular research habitats, and engineer vehicles like the Seamoth, Prawn Suit mech, and the massive Cyclops submarine.
20	Ghost of Tsushima	18	16	2020-07-17	9.3	59.99	f	An open-world action-adventure set in feudal Japan during the Mongol invasion, following samurai Jin Sakai as he becomes the legendary Ghost.	play_later	f	t	/static/images/game_20.jpg	\N	### The Story & Premise\nIn the late 13th century, the Mongol empire has laid waste to entire nations. Tsushima Island is all that stands between mainland Japan and a massive Mongol invasion fleet led by the ruthless general Khotun Khan. As samurai lord Jin Sakai survives the slaughter at Komoda Beach, he must make a heartbreaking choice: honor the strict samurai code of his uncle Lord Shimura, or discard it to become the dishonorable "Ghost" and save his people.\n\n### World & Exploration\nA love letter to classic Akira Kurosawa cinema, Tsushima is rendered with painterly natural elegance. Golden forests, rolling pampas grass fields, and weeping cherry blossoms rustle under a dynamic wind system that replaces traditional minimaps and UI waypointsâ€”letting players simply "follow the wind" to discover Shinto shrines, hot springs, and haiku contemplation spots.\n\n### Gameplay & Mechanics\nFluid, cinematic katana swordplay featuring four distinct combat stances (Stone, Water, Wind, Moon) designed to counter specific enemy armaments. Transition seamlessly between honorable face-to-face duels (Standoffs) and shadowy ninja guerrilla tactics utilizing smoke bombs, grappling hooks, and silent assassinations.
\.


--
-- Data for Name: gamestory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gamestory (game_id, story_id) FROM stdin;
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
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: platforms; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: storytypes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storytypes (story_id, story_type) FROM stdin;
1	Linear
2	Branching
3	Sandbox
4	Procedural
5	No Story
\.


--
-- Data for Name: systemrequirements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.systemrequirements (requirement_id, game_id, operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage, recommended_cpu, recommended_gpu, recommended_ram, recommended_storage) FROM stdin;
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
1	1	Windows 10	Intel Core i5-4590	NVIDIA GeForce GTX 960 2GB	8 GB	12 GB	Intel Core i7-6700	NVIDIA GeForce GTX 1060 6GB	8 GB	12 GB
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
67	68	Windows 10 64-bit	Intel Core i7-7700 / AMD Ryzen 7 2700X	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590	12 GB	60 GB	Intel Core i7-7700 / AMD Ryzen 7 2700X	NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590	12 GB	60 GB
99	100	Windows 10 64-bit	Intel Core i5-4670K / AMD FX-8350	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	8 GB	22 GB	Intel Core i5-4670K / AMD FX-8350	NVIDIA GeForce GTX 1060 / AMD Radeon RX 580	8 GB	22 GB
\.


--
-- Name: developers_developer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.developers_developer_id_seq', 66, false);


--
-- Name: gamemodes_mode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gamemodes_mode_id_seq', 8, false);


--
-- Name: games_game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.games_game_id_seq', 101, false);


--
-- Name: genres_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_genre_id_seq', 26, false);


--
-- Name: platforms_platform_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platforms_platform_id_seq', 9, false);


--
-- Name: publishers_publisher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.publishers_publisher_id_seq', 44, false);


--
-- Name: storytypes_story_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.storytypes_story_id_seq', 6, false);


--
-- Name: systemrequirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.systemrequirements_requirement_id_seq', 100, false);


--
-- Name: developers developers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT developers_pkey PRIMARY KEY (developer_id);


--
-- Name: gamegenres gamegenres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_pkey PRIMARY KEY (game_id, genre_id);


--
-- Name: gamemodes gamemodes_mode_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamemodes
    ADD CONSTRAINT gamemodes_mode_name_key UNIQUE (mode_name);


--
-- Name: gamemodes gamemodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamemodes
    ADD CONSTRAINT gamemodes_pkey PRIMARY KEY (mode_id);


--
-- Name: gamemodesrelation gamemodesrelation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_pkey PRIMARY KEY (game_id, mode_id);


--
-- Name: gameplatforms gameplatforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_pkey PRIMARY KEY (game_id, platform_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (game_id);


--
-- Name: gamestory gamestory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_pkey PRIMARY KEY (game_id, story_id);


--
-- Name: genres genres_genre_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_genre_name_key UNIQUE (genre_name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (platform_id);


--
-- Name: platforms platforms_platform_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_platform_name_key UNIQUE (platform_name);


--
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (publisher_id);


--
-- Name: storytypes storytypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storytypes
    ADD CONSTRAINT storytypes_pkey PRIMARY KEY (story_id);


--
-- Name: storytypes storytypes_story_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storytypes
    ADD CONSTRAINT storytypes_story_type_key UNIQUE (story_type);


--
-- Name: systemrequirements systemrequirements_game_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_game_id_key UNIQUE (game_id);


--
-- Name: systemrequirements systemrequirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_pkey PRIMARY KEY (requirement_id);


--
-- Name: gamegenres gamegenres_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamegenres gamegenres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamegenres
    ADD CONSTRAINT gamegenres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id) ON DELETE CASCADE;


--
-- Name: gamemodesrelation gamemodesrelation_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamemodesrelation gamemodesrelation_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamemodesrelation
    ADD CONSTRAINT gamemodesrelation_mode_id_fkey FOREIGN KEY (mode_id) REFERENCES public.gamemodes(mode_id) ON DELETE CASCADE;


--
-- Name: gameplatforms gameplatforms_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gameplatforms gameplatforms_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gameplatforms
    ADD CONSTRAINT gameplatforms_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(platform_id) ON DELETE CASCADE;


--
-- Name: games games_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_developer_id_fkey FOREIGN KEY (developer_id) REFERENCES public.developers(developer_id);


--
-- Name: games games_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(publisher_id);


--
-- Name: gamestory gamestory_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: gamestory gamestory_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gamestory
    ADD CONSTRAINT gamestory_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.storytypes(story_id) ON DELETE CASCADE;


--
-- Name: systemrequirements systemrequirements_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.systemrequirements
    ADD CONSTRAINT systemrequirements_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PriIRds8UNHs3QwjGlPrPJfiqCVe8aWXHr4jCvGSvA1Ctkag7pB8xPXK5LNte43

