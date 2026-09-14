--
-- PostgreSQL database dump
--

\restrict EXxc5PmVpaovFjnzaXtx614KoHZk7h3yqyJVaO3XPY7oRfdzc0BO9WcvZESfEw4

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
\.


--
-- Data for Name: gamegenres; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: gameplatforms; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: -
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
48	Portal 2	27	23	2011-04-19	9.6	9.99	f	A brilliant first-person puzzle game featuring innovative portal mechanics, witty writing, and a cooperative campaign alongside a compelling single-player story.	not_started	f	f	/static/images/game_48.jpg	\N
49	Celeste	33	29	2018-01-25	9.2	19.99	f	A critically acclaimed precision platformer following Madeline as she climbs the titular mountain, tackling themes of mental health and self-discovery.	completed	t	f	/static/images/game_49.jpg	\N
50	Ori and the Will of the Wisps	34	10	2020-03-11	9.2	29.99	f	A visually stunning action-platformer Metroidvania following the spirit Ori on an emotional quest through a beautiful yet dangerous forest.	play_later	t	t	/static/images/game_50.jpg	\N
\.


--
-- Data for Name: gamestory; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Name: developers_developer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.developers_developer_id_seq', 35, false);


--
-- Name: gamemodes_mode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gamemodes_mode_id_seq', 8, false);


--
-- Name: games_game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.games_game_id_seq', 51, false);


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

SELECT pg_catalog.setval('public.publishers_publisher_id_seq', 30, false);


--
-- Name: storytypes_story_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.storytypes_story_id_seq', 6, false);


--
-- Name: systemrequirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.systemrequirements_requirement_id_seq', 50, false);


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

\unrestrict EXxc5PmVpaovFjnzaXtx614KoHZk7h3yqyJVaO3XPY7oRfdzc0BO9WcvZESfEw4

