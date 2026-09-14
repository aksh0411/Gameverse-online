import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "games_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")
    DATABASE_URL = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

NEW_GAMES = [
    {
        "name": "Far Cry 3",
        "developer": ("Ubisoft Montreal", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2012-11-29",
        "rating": 8.8,
        "price": 19.99,
        "is_free": False,
        "description": "Beyond the reach of civilization lies an island governed by violence and suffering where Jason Brody must fight for survival against Vaas Montenegro.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "far_cry_3.jpg",
        "game_engine": "Dunia Engine 2",
        "genres": ["Action", "Adventure", "FPS", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i3-530 2.9 GHz / AMD Phenom II X2",
            "ram": "4 GB",
            "graphics": "Nvidia GeForce GTX 8800 / AMD Radeon HD 2900",
            "storage": "15 GB"
        }
    },
    {
        "name": "Far Cry 4",
        "developer": ("Ubisoft Montreal", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2014-11-18",
        "rating": 8.5,
        "price": 29.99,
        "is_free": False,
        "description": "Hidden in the towering Himalayas lies Kyrat, a country steeped in tradition and violence under the despotic rule of self-appointed king Pagan Min.",
        "play_status": "not_started",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "far_cry_4.jpg",
        "game_engine": "Dunia Engine 2",
        "genres": ["Action", "Adventure", "FPS", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player", "Co-op", "Multiplayer"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-750 2.6 GHz / AMD Phenom II X4 955",
            "ram": "8 GB",
            "graphics": "Nvidia GeForce GTX 680 / AMD Radeon R9 290X",
            "storage": "30 GB"
        }
    },
    {
        "name": "Far Cry 5",
        "developer": ("Ubisoft Montreal", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2018-03-27",
        "rating": 8.2,
        "price": 59.99,
        "is_free": False,
        "description": "Welcome to Hope County, Montana, land of the free and the brave, but also home to a fanatical doomsday cult known as Eden's Gate led by Joseph Seed.",
        "play_status": "play_later",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "far_cry_5.jpg",
        "game_engine": "Dunia Engine 2",
        "genres": ["Action", "Adventure", "FPS", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player", "Co-op", "Multiplayer"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-4770 3.4 GHz / AMD Ryzen 5 1600",
            "ram": "8 GB",
            "graphics": "Nvidia GeForce GTX 970 / AMD R9 290X 4GB",
            "storage": "40 GB"
        }
    },
    {
        "name": "Far Cry 6",
        "developer": ("Ubisoft Toronto", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2021-10-07",
        "rating": 7.9,
        "price": 59.99,
        "is_free": False,
        "description": "Welcome to Yara, a tropical paradise frozen in time. As dictator Anton Castillo vows to restore his nation, a modern guerrilla revolution ignites.",
        "play_status": "not_started",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "far_cry_6.jpg",
        "game_engine": "Dunia Engine 2",
        "genres": ["Action", "Adventure", "FPS", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 5 3600X / Intel i7-7700",
            "ram": "16 GB",
            "graphics": "Nvidia GeForce GTX 1080 / AMD RX Vega 64",
            "storage": "60 GB"
        }
    },
    {
        "name": "Far Cry Primal",
        "developer": ("Ubisoft Montreal", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2016-02-23",
        "rating": 7.7,
        "price": 29.99,
        "is_free": False,
        "description": "Welcome to the Stone Age, an era of extreme danger where giant mammoths and sabretooth tigers rule the Earth and humanity is at the bottom of the food chain.",
        "play_status": "not_started",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "far_cry_primal.jpg",
        "game_engine": "Dunia Engine 2",
        "genres": ["Action", "Adventure", "Open World", "Survival"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-2600K / AMD FX-8350",
            "ram": "8 GB",
            "graphics": "Nvidia GeForce GTX 780 / AMD Radeon R9 280X",
            "storage": "20 GB"
        }
    },
    {
        "name": "The Elder Scrolls V: Skyrim Special Edition",
        "developer": ("Bethesda Game Studios", "USA"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2016-10-28",
        "rating": 9.5,
        "price": 39.99,
        "is_free": False,
        "description": "Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life with remastered art, volumetric god rays, and dynamic depth of field.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "skyrim_se.jpg",
        "game_engine": "Creation Engine",
        "genres": ["Action", "RPG", "Open World", "Adventure"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i5-2400 / AMD FX-8320",
            "ram": "8 GB",
            "graphics": "Nvidia GTX 780 3GB / AMD R9 290 4GB",
            "storage": "12 GB"
        }
    },
    {
        "name": "Fallout 4",
        "developer": ("Bethesda Game Studios", "USA"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2015-11-10",
        "rating": 8.8,
        "price": 19.99,
        "is_free": False,
        "description": "As the sole survivor of Vault 111, enter a post-apocalyptic Boston wasteland destroyed by nuclear war. Rebuild settlements, craft weapons, and decide the fate of the Commonwealth.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "fallout_4.jpg",
        "game_engine": "Creation Engine",
        "genres": ["Action", "RPG", "Open World", "FPS"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7 4790 3.6 GHz / AMD FX-9590 4.7 GHz",
            "ram": "8 GB",
            "graphics": "NVIDIA GTX 780 3GB / AMD Radeon R9 290X 4GB",
            "storage": "30 GB"
        }
    },
    {
        "name": "Fallout: New Vegas",
        "developer": ("Obsidian Entertainment", "USA"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2010-10-19",
        "rating": 9.2,
        "price": 9.99,
        "is_free": False,
        "description": "Welcome to New Vegas. It is the kind of town where you dig your own grave prior to being shot in the head and left for dead. Battle for control of the Mojave wasteland and the Hoover Dam.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "fallout_new_vegas.jpg",
        "game_engine": "Gamebryo",
        "genres": ["Action", "RPG", "Open World"],
        "platforms": ["PC", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Dual Core 2.0 GHz",
            "ram": "2 GB",
            "graphics": "NVIDIA GeForce 6 series / ATI 1300XT series",
            "storage": "10 GB"
        }
    },
    {
        "name": "Starfield",
        "developer": ("Bethesda Game Studios", "USA"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2023-09-06",
        "rating": 7.8,
        "price": 69.99,
        "is_free": False,
        "description": "Starfield is the first new universe in over 25 years from Bethesda Game Studios. In this next-generation role-playing game set amongst the stars, journey through over 1,000 planets.",
        "play_status": "play_later",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "starfield.jpg",
        "game_engine": "Creation Engine 2",
        "genres": ["Action", "RPG", "Open World", "FPS"],
        "platforms": ["PC", "Xbox Series X/S"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 5 3600X / Intel Core i5-10600K",
            "ram": "16 GB",
            "graphics": "AMD Radeon RX 6800 XT / NVIDIA GeForce RTX 2080",
            "storage": "125 GB"
        }
    },
    {
        "name": "The Last of Us Part I",
        "developer": ("Naughty Dog", "USA"),
        "publisher": ("Sony Interactive Entertainment", "Japan"),
        "release_date": "2022-09-02",
        "rating": 9.7,
        "price": 69.99,
        "is_free": False,
        "description": "Experience the emotional storytelling and unforgettable characters of Joel and Ellie in a ravaged civilization infested with fungal infected and ruthless human survivors.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "tlou_part_1.jpg",
        "game_engine": "Naughty Dog Engine",
        "genres": ["Action", "Adventure", "Horror", "Stealth", "TPS"],
        "platforms": ["PC", "PlayStation 5"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 5 3600X / Intel Core i7-8700",
            "ram": "16 GB",
            "graphics": "AMD Radeon RX 6600 XT / NVIDIA GeForce RTX 2070 SUPER",
            "storage": "100 GB"
        }
    },
    {
        "name": "The Last of Us Part II Remastered",
        "developer": ("Naughty Dog", "USA"),
        "publisher": ("Sony Interactive Entertainment", "Japan"),
        "release_date": "2024-01-19",
        "rating": 9.3,
        "price": 49.99,
        "is_free": False,
        "description": "Five years after their dangerous journey across post-pandemic America, Ellie and Joel settle in Wyoming until a traumatic event sends Ellie on an unrelenting quest for vengeance.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "tlou_part_2.jpg",
        "game_engine": "Naughty Dog Engine",
        "genres": ["Action", "Adventure", "Horror", "Stealth", "TPS"],
        "platforms": ["PlayStation 5"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "PlayStation 5 OS",
            "processor": "AMD Zen 2 8-core 3.5GHz",
            "ram": "16 GB",
            "graphics": "AMD RDNA 2 10.28 TFLOPs",
            "storage": "90 GB"
        }
    },
    {
        "name": "Uncharted: Legacy of Thieves Collection",
        "developer": ("Naughty Dog", "USA"),
        "publisher": ("Sony Interactive Entertainment", "Japan"),
        "release_date": "2022-01-28",
        "rating": 9.0,
        "price": 49.99,
        "is_free": False,
        "description": "Seek your fortune and leave your mark across cinematic globe-trotting action in remastered editions of Uncharted 4: A Thief's End and Uncharted: The Lost Legacy.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "uncharted_lotc.jpg",
        "game_engine": "Naughty Dog Engine",
        "genres": ["Action", "Adventure", "TPS", "Platformer"],
        "platforms": ["PC", "PlayStation 5"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i7-4770 / AMD Ryzen 5 1500X",
            "ram": "16 GB",
            "graphics": "NVIDIA GTX 1060 6GB / AMD RX 570 4GB",
            "storage": "126 GB"
        }
    },
    {
        "name": "Death Stranding Director's Cut",
        "developer": ("Kojima Productions", "Japan"),
        "publisher": ("Sony Interactive Entertainment", "Japan"),
        "release_date": "2021-09-24",
        "rating": 8.9,
        "price": 39.99,
        "is_free": False,
        "description": "From visionary creator Hideo Kojima comes a genre-defying journey. Carrying the remnants of our future, Sam Porter Bridges must brave supernatural threats to reconnect a fractured world.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "death_stranding_dc.jpg",
        "game_engine": "Decima Engine",
        "genres": ["Action", "Adventure", "Open World", "TPS"],
        "platforms": ["PC", "PlayStation 5", "iOS"],
        "modes": ["Single Player", "Multiplayer"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-3770 / AMD Ryzen 5 1600",
            "ram": "8 GB",
            "graphics": "GeForce GTX 1060 6 GB / AMD Radeon RX 590",
            "storage": "80 GB"
        }
    },
    {
        "name": "Alan Wake 2",
        "developer": ("Remedy Entertainment", "Finland"),
        "publisher": ("Epic Games", "USA"),
        "release_date": "2023-10-27",
        "rating": 9.2,
        "price": 49.99,
        "is_free": False,
        "description": "A psychological survival horror masterpiece featuring dual perspectives: FBI agent Saga Anderson investigating ritual murders and writer Alan Wake trapped in the Dark Place.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "alan_wake_2.jpg",
        "game_engine": "Northlight Engine",
        "genres": ["Action", "Adventure", "Horror", "TPS"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Ryzen 7 3700X / Intel Core i7-10700K",
            "ram": "16 GB",
            "graphics": "GeForce RTX 3070 / Radeon RX 6700 XT",
            "storage": "90 GB"
        }
    },
    {
        "name": "Control",
        "developer": ("Remedy Entertainment", "Finland"),
        "publisher": ("505 Games", "Italy"),
        "release_date": "2019-08-27",
        "rating": 8.8,
        "price": 39.99,
        "is_free": False,
        "description": "When an otherworldly force invades the Federal Bureau of Control, Jesse Faden becomes the new Director, wielding telekinetic powers and a morphing Service Weapon.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "control.jpg",
        "game_engine": "Northlight Engine",
        "genres": ["Action", "Adventure", "TPS", "Metroidvania"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-7600K / AMD Ryzen 5 1600X",
            "ram": "16 GB",
            "graphics": "Nvidia GeForce GTX 1660 / AMD RX 580",
            "storage": "42 GB"
        }
    },
    {
        "name": "Mass Effect Legendary Edition",
        "developer": ("BioWare", "Canada"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2021-05-14",
        "rating": 9.4,
        "price": 59.99,
        "is_free": False,
        "description": "Relive the cinematic space opera that defined a generation. Includes all three acclaimed games of Commander Shepard's fight against the Reaper invasion across the galaxy.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "mass_effect_le.jpg",
        "game_engine": "Unreal Engine 3",
        "genres": ["Action", "RPG", "TPS", "Adventure"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-7700 / AMD Ryzen 7 3700X",
            "ram": "16 GB",
            "graphics": "NVIDIA GTX 1070 / Radeon Vega 56",
            "storage": "120 GB"
        }
    },
    {
        "name": "Dragon's Dogma 2",
        "developer": ("Capcom", "Japan"),
        "publisher": ("Capcom", "Japan"),
        "release_date": "2024-03-22",
        "rating": 8.6,
        "price": 69.99,
        "is_free": False,
        "description": "A narrative-driven action-RPG that challenges players to choose their own journey. Explore a richly detailed fantasy world alongside Pawns, otherworldly AI companions.",
        "play_status": "not_started",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "dragons_dogma_2.jpg",
        "game_engine": "RE Engine",
        "genres": ["Action", "RPG", "Open World", "Adventure"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-10700 / AMD Ryzen 5 3600X",
            "ram": "16 GB",
            "graphics": "NVIDIA GeForce RTX 2080 / AMD Radeon RX 6700",
            "storage": "100 GB"
        }
    },
    {
        "name": "Armored Core VI: Fires of Rubicon",
        "developer": ("FromSoftware", "Japan"),
        "publisher": ("Bandai Namco Entertainment", "Japan"),
        "release_date": "2023-08-25",
        "rating": 8.9,
        "price": 59.99,
        "is_free": False,
        "description": "Assemble and pilot your custom mech through 3D omnidirectional battles on the remote planet Rubicon 3, taking on high-risk mercenary missions for rival corporations.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "armored_core_6.jpg",
        "game_engine": "FromSoftware Engine",
        "genres": ["Action", "TPS", "Simulation"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "PvP"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-7700 / AMD Ryzen 7 2700X",
            "ram": "12 GB",
            "graphics": "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590",
            "storage": "60 GB"
        }
    },
    {
        "name": "Star Wars Jedi: Fallen Order",
        "developer": ("Respawn Entertainment", "USA"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2019-11-15",
        "rating": 8.7,
        "price": 39.99,
        "is_free": False,
        "description": "An abandoned Padawan must complete his training, develop powerful new Force abilities, and master the art of the lightsaber while staying one step ahead of the Empire's Inquisitors.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "jedi_fallen_order.jpg",
        "game_engine": "Unreal Engine 4",
        "genres": ["Action", "Adventure", "Soulslike", "Metroidvania"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i7-6700K / AMD Ryzen 7 1700",
            "ram": "16 GB",
            "graphics": "GTX 1070 / Radeon RX Vega 56",
            "storage": "55 GB"
        }
    },
    {
        "name": "Star Wars Jedi: Survivor",
        "developer": ("Respawn Entertainment", "USA"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2023-04-28",
        "rating": 8.8,
        "price": 69.99,
        "is_free": False,
        "description": "No longer a Padawan, Cal Kestis has matured into a powerful Jedi Knight. Pushed to the edges of the galaxy by the Empire, he must fight for a sanctuary in the darkness.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "jedi_survivor.jpg",
        "game_engine": "Unreal Engine 4",
        "genres": ["Action", "Adventure", "Soulslike", "Metroidvania"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5 11600K / Ryzen 5 5600X",
            "ram": "16 GB",
            "graphics": "RTX 2070 / RX 6700 XT",
            "storage": "155 GB"
        }
    },
    {
        "name": "Assassin's Creed Odyssey",
        "developer": ("Ubisoft Quebec", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2018-10-05",
        "rating": 8.9,
        "price": 59.99,
        "is_free": False,
        "description": "Choose your fate as Alexios or Kassandra. From outcast Spartan mercenary to living Greek hero, embark on an epic journey across ancient Greece during the Peloponnesian War.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "ac_odyssey.jpg",
        "game_engine": "AnvilNext 2.0",
        "genres": ["Action", "RPG", "Open World", "Adventure"],
        "platforms": ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD FX-8350 / Intel Core i7-3770",
            "ram": "8 GB",
            "graphics": "AMD Radeon R9 290 / NVIDIA GeForce GTX 970 4GB",
            "storage": "46 GB"
        }
    },
    {
        "name": "Assassin's Creed Valhalla",
        "developer": ("Ubisoft Montreal", "Canada"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2020-11-10",
        "rating": 8.4,
        "price": 59.99,
        "is_free": False,
        "description": "Lead legendary Viking raids against Saxon strongholds across Dark Age England. Build settlements, customize your raider clan, and secure your clan's glory in Valhalla.",
        "play_status": "playing",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "ac_valhalla.jpg",
        "game_engine": "AnvilNext 2.0",
        "genres": ["Action", "RPG", "Open World", "Adventure"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 5 3600XT / Intel i7-8700K",
            "ram": "16 GB",
            "graphics": "AMD RX 5700XT / NVIDIA GeForce GTX 1080 8GB",
            "storage": "50 GB"
        }
    },
    {
        "name": "Assassin's Creed Mirage",
        "developer": ("Ubisoft Bordeaux", "France"),
        "publisher": ("Ubisoft", "France"),
        "release_date": "2023-10-05",
        "rating": 8.1,
        "price": 49.99,
        "is_free": False,
        "description": "A heartfelt tribute to the roots of the franchise. Experience the journey of Basim from clever street thief to master assassin through the vibrant golden age of Baghdad.",
        "play_status": "play_later",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "ac_mirage.jpg",
        "game_engine": "Ubisoft Anvil",
        "genres": ["Action", "Adventure", "Stealth", "Open World"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "iOS"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-8700K / AMD Ryzen 5 3600",
            "ram": "16 GB",
            "graphics": "Intel Arc A750 8GB / NVIDIA GeForce GTX 1660 Ti 6GB",
            "storage": "40 GB"
        }
    },
    {
        "name": "Batman: Arkham Knight",
        "developer": ("Rocksteady Studios", "UK"),
        "publisher": ("Warner Bros. Games", "USA"),
        "release_date": "2015-06-23",
        "rating": 9.1,
        "price": 19.99,
        "is_free": False,
        "description": "The explosive finale to the Arkham trilogy. Scarecrow returns to unite an imposing roster of super villains, while Batman pilots the legendary drivable Batmobile.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "batman_arkham_knight.jpg",
        "game_engine": "Unreal Engine 3",
        "genres": ["Action", "Adventure", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-3770 3.4 GHz / AMD FX-8350 4.0 GHz",
            "ram": "8 GB",
            "graphics": "NVIDIA GeForce GTX 760 3GB",
            "storage": "45 GB"
        }
    },
    {
        "name": "Batman: Arkham City",
        "developer": ("Rocksteady Studios", "UK"),
        "publisher": ("Warner Bros. Games", "USA"),
        "release_date": "2011-10-18",
        "rating": 9.6,
        "price": 19.99,
        "is_free": False,
        "description": "Fly across the super-prison city containing Gotham's most notorious criminals. Featuring an all-star rogue's gallery including Joker, Two-Face, Penguin, and Mr. Freeze.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "batman_arkham_city.jpg",
        "game_engine": "Unreal Engine 3",
        "genres": ["Action", "Adventure", "Open World", "Stealth"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Dual-Core 2.4 GHz",
            "ram": "4 GB",
            "graphics": "NVIDIA GeForce 8800 GTS / 512MB VRAM",
            "storage": "17 GB"
        }
    },
    {
        "name": "BioShock Infinite",
        "developer": ("Irrational Games", "USA"),
        "publisher": ("2K Games", "USA"),
        "release_date": "2013-03-26",
        "rating": 9.4,
        "price": 29.99,
        "is_free": False,
        "description": "Booker DeWitt must rescue Elizabeth, a mysterious girl imprisoned in the airborne floating city of Columbia. Unravel mind-bending twists of quantum mechanics and devotion.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "bioshock_infinite.jpg",
        "game_engine": "Unreal Engine 3",
        "genres": ["Action", "FPS", "Adventure"],
        "platforms": ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Quad Core Processor",
            "ram": "4 GB",
            "graphics": "ATI Radeon HD 6950 / NVIDIA GeForce GTX 560",
            "storage": "20 GB"
        }
    },
    {
        "name": "Dishonored 2",
        "developer": ("Arkane Studios", "France"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2016-11-11",
        "rating": 9.0,
        "price": 29.99,
        "is_free": False,
        "description": "Play as Emily Kaldwin or Corvo Attano in the coastal city of Karnaca. Use supernatural abilities and gadgetry to combine lethal assassinations or non-lethal stealth.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "dishonored_2.jpg",
        "game_engine": "Void Engine",
        "genres": ["Action", "Stealth", "Adventure", "FPS"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-4770 / AMD FX-8350",
            "ram": "16 GB",
            "graphics": "NVIDIA GTX 1060 6GB / AMD Radeon RX 480 8GB",
            "storage": "60 GB"
        }
    },
    {
        "name": "Prey",
        "developer": ("Arkane Studios", "France"),
        "publisher": ("Bethesda Softworks", "USA"),
        "release_date": "2017-05-05",
        "rating": 8.8,
        "price": 29.99,
        "is_free": False,
        "description": "Awaken aboard Talos I, a lavish space station overrun by shapeshifting alien Typhon. Use your wits, weapons, and mind-bending abilities to survive.",
        "play_status": "play_later",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "prey.jpg",
        "game_engine": "CryEngine",
        "genres": ["Action", "FPS", "RPG", "Horror"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i7-2600K / AMD FX-8350",
            "ram": "16 GB",
            "graphics": "GTX 970 4GB / AMD R9 290 4GB",
            "storage": "20 GB"
        }
    },
    {
        "name": "Hitman World of Assassination",
        "developer": ("IO Interactive", "Denmark"),
        "publisher": ("IO Interactive", "Denmark"),
        "release_date": "2021-01-20",
        "rating": 9.1,
        "price": 69.99,
        "is_free": False,
        "description": "Enter the world of the ultimate assassin. Become Agent 47 in the definitive assassination sandbox featuring over 20 lavish international locations, disguises, and creative kills.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "hitman_woa.jpg",
        "game_engine": "Glacier Engine",
        "genres": ["Action", "Stealth", "Strategy"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7 4790 4 GHz",
            "ram": "16 GB",
            "graphics": "AMD Radeon RX Vega 56 8GB / Nvidia GeForce GTX 1070",
            "storage": "80 GB"
        }
    },
    {
        "name": "Metal Gear Solid V: The Phantom Pain",
        "developer": ("Kojima Productions", "Japan"),
        "publisher": ("Konami", "Japan"),
        "release_date": "2015-09-01",
        "rating": 9.3,
        "price": 19.99,
        "is_free": False,
        "description": "Big Boss awakens from a nine-year coma to establish a private army known as Diamond Dogs. Experience groundbreaking open-world stealth tactical freedom across Afghanistan and Africa.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "mgsv.jpg",
        "game_engine": "Fox Engine",
        "genres": ["Action", "Stealth", "Open World", "TPS"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "PvP"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i7-4790 3.60GHz",
            "ram": "8 GB",
            "graphics": "NVIDIA GeForce GTX 760 2GB",
            "storage": "28 GB"
        }
    },
    {
        "name": "Halo Infinite",
        "developer": ("343 Industries", "USA"),
        "publisher": ("Xbox Game Studios", "USA"),
        "release_date": "2021-11-15",
        "rating": 8.5,
        "price": 59.99,
        "is_free": False,
        "description": "When all hope is lost, Master Chief confronts the ruthless Banished on the open ringworld Zeta Halo, wielding the grappleshot to revolutionize combat traversal.",
        "play_status": "playing",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "halo_infinite.jpg",
        "game_engine": "Slipspace Engine",
        "genres": ["Action", "FPS", "Open World"],
        "platforms": ["PC", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "PvP", "Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 7 3700X / Intel i7-9700k",
            "ram": "16 GB",
            "graphics": "Radeon RX 5700 XT / Nvidia RTX 2070",
            "storage": "50 GB"
        }
    },
    {
        "name": "Call of Duty: Modern Warfare II",
        "developer": ("Infinity Ward", "USA"),
        "publisher": ("Activision", "USA"),
        "release_date": "2022-10-28",
        "rating": 8.0,
        "price": 69.99,
        "is_free": False,
        "description": "Task Force 141 returns with Captain Price, Ghost, and Soap tackling international cartel smuggling across a cinematic globe-spanning campaign and competitive multiplayer.",
        "play_status": "playing",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "cod_mw2.jpg",
        "game_engine": "IW 9.0",
        "genres": ["Action", "FPS"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "Co-op", "PvP"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-6600K / AMD Ryzen 5 1400",
            "ram": "12 GB",
            "graphics": "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
            "storage": "125 GB"
        }
    },
    {
        "name": "Call of Duty: Warzone",
        "developer": ("Raven Software", "USA"),
        "publisher": ("Activision", "USA"),
        "release_date": "2020-03-10",
        "rating": 7.9,
        "price": 0.00,
        "is_free": True,
        "description": "Massive free-to-play battle royale featuring up to 150 players, the Gulag redeployment arena, weapon loadouts, and intense extraction shootouts.",
        "play_status": "playing",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "cod_warzone.jpg",
        "game_engine": "IW 9.0",
        "genres": ["Action", "FPS", "Battle Royale"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Multiplayer", "PvP", "Co-op"],
        "story": "No Story",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-6600K / AMD Ryzen 5 1400",
            "ram": "12 GB",
            "graphics": "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
            "storage": "125 GB"
        }
    },
    {
        "name": "Battlefield 2042",
        "developer": ("DICE", "Sweden"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2021-11-19",
        "rating": 7.1,
        "price": 59.99,
        "is_free": False,
        "description": "Experience massive 128-player multiplayer battles with dynamic storms, environmental hazards, wingsuits, and destructive vehicular combat.",
        "play_status": "not_started",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "battlefield_2042.jpg",
        "game_engine": "Frostbite",
        "genres": ["Action", "FPS"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Multiplayer", "PvP", "Co-op"],
        "story": "No Story",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD Ryzen 7 2700X / Intel Core i7 4790",
            "ram": "16 GB",
            "graphics": "AMD Radeon RX 6600 XT / Nvidia GeForce RTX 3060",
            "storage": "100 GB"
        }
    },
    {
        "name": "Titanfall 2",
        "developer": ("Respawn Entertainment", "USA"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2016-10-28",
        "rating": 9.3,
        "price": 29.99,
        "is_free": False,
        "description": "Pilot Jack Cooper and Vanguard-class Titan BT-7274 form an unbreakable bond across one of the highest-rated single-player shooter campaigns in gaming history.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "titanfall_2.jpg",
        "game_engine": "Source Engine",
        "genres": ["Action", "FPS", "Platformer"],
        "platforms": ["PC", "PlayStation 4", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "PvP", "Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-6600 or equivalent",
            "ram": "16 GB",
            "graphics": "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 8GB",
            "storage": "45 GB"
        }
    },
    {
        "name": "Forza Horizon 5",
        "developer": ("Playground Games", "UK"),
        "publisher": ("Xbox Game Studios", "USA"),
        "release_date": "2021-11-09",
        "rating": 9.2,
        "price": 59.99,
        "is_free": False,
        "description": "Drive hundreds of the world's greatest cars across vibrant Mexican deserts, lush jungles, historic cities, hidden ruins, and an active caldera volcano.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "forza_horizon_5.jpg",
        "game_engine": "ForzaTech",
        "genres": ["Racing", "Open World", "Sports", "Simulation"],
        "platforms": ["PC", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "PvP", "Co-op"],
        "story": "Sandbox",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i5-8400 / AMD Ryzen 5 1500X",
            "ram": "16 GB",
            "graphics": "NVidia GTX 1070 / AMD RX 590",
            "storage": "110 GB"
        }
    },
    {
        "name": "Need for Speed Unbound",
        "developer": ("Criterion Games", "UK"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2022-12-02",
        "rating": 7.6,
        "price": 69.99,
        "is_free": False,
        "description": "Tear up the streets of Lakeshore with graffiti-inspired visual bursts, high-speed cop chases, and underground drift meets.",
        "play_status": "not_started",
        "is_bookmarked": False,
        "is_favorited": False,
        "cover_image": "nfs_unbound.jpg",
        "game_engine": "Frostbite",
        "genres": ["Racing", "Action", "Open World"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S"],
        "modes": ["Single Player", "Multiplayer", "PvP"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Ryzen 5 3600 / Core i7-8700",
            "ram": "16 GB",
            "graphics": "Radeon RX 5700 / GeForce RTX 2070",
            "storage": "50 GB"
        }
    },
    {
        "name": "Sea of Thieves",
        "developer": ("Rare", "UK"),
        "publisher": ("Xbox Game Studios", "USA"),
        "release_date": "2018-03-20",
        "rating": 8.6,
        "price": 39.99,
        "is_free": False,
        "description": "Sail, fight, dig for treasure, and drink grog on the open seas with your crew in this ultimate pirate sandbox where every ship on the horizon is player-controlled.",
        "play_status": "playing",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "sea_of_thieves.jpg",
        "game_engine": "Unreal Engine 4",
        "genres": ["Action", "Adventure", "Open World", "Survival"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S", "Xbox One"],
        "modes": ["Multiplayer", "Co-op", "PvP", "MMO"],
        "story": "Sandbox",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i5 4690 3.5GHz / AMD FX-8150 3.6GHz",
            "ram": "8 GB",
            "graphics": "Nvidia GeForce GTX 770 / AMD Radeon R9 380x",
            "storage": "50 GB"
        }
    },
    {
        "name": "Palworld",
        "developer": ("Pocketpair", "Japan"),
        "publisher": ("Pocketpair", "Japan"),
        "release_date": "2024-01-19",
        "rating": 8.7,
        "price": 29.99,
        "is_free": False,
        "description": "Collect mysterious creatures called Pals to fight, build bases, automate factories, and explore a vast wilderness in this explosive viral survival phenomenon.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": False,
        "cover_image": "palworld.jpg",
        "game_engine": "Unreal Engine 5",
        "genres": ["Action", "Adventure", "Open World", "Survival", "Sandbox"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S", "Xbox One"],
        "modes": ["Single Player", "Multiplayer", "Co-op"],
        "story": "Sandbox",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "i9-9900K 3.6GHz 8 Core",
            "ram": "32 GB",
            "graphics": "GeForce RTX 2070",
            "storage": "40 GB"
        }
    },
    {
        "name": "Lethal Company",
        "developer": ("Zeekerss", "USA"),
        "publisher": ("Zeekerss", "USA"),
        "release_date": "2023-10-23",
        "rating": 9.3,
        "price": 9.99,
        "is_free": False,
        "description": "Scavenge industrial scrap on hazardous moons to meet the Company's quota while avoiding terrifying monsters lurking in claustrophobic corridors with proximity voice chat.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "lethal_company.jpg",
        "game_engine": "Unity",
        "genres": ["Action", "Horror", "Survival"],
        "platforms": ["PC"],
        "modes": ["Co-op", "Multiplayer"],
        "story": "Procedural",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-7400 3.00GHz",
            "ram": "4 GB",
            "graphics": "NVIDIA GeForce GTX 1050",
            "storage": "1 GB"
        }
    },
    {
        "name": "Deep Rock Galactic",
        "developer": ("Ghost Ship Games", "Denmark"),
        "publisher": ("Coffee Stain Publishing", "Sweden"),
        "release_date": "2020-05-13",
        "rating": 9.4,
        "price": 29.99,
        "is_free": False,
        "description": "Rock and Stone! 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible procedural alien caves, rich mineral mining, and relentless swarms.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "deep_rock_galactic.jpg",
        "game_engine": "Unreal Engine 4",
        "genres": ["Action", "FPS", "Co-op"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
        "modes": ["Co-op", "Multiplayer", "Single Player"],
        "story": "Procedural",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel i5 3rd Gen",
            "ram": "8 GB",
            "graphics": "NVIDIA GeForce GTX 970 / AMD Radeon R9 290",
            "storage": "3 GB"
        }
    },
    {
        "name": "Slay the Spire",
        "developer": ("MegaCrit", "USA"),
        "publisher": ("Humble Games", "USA"),
        "release_date": "2019-01-23",
        "rating": 9.6,
        "price": 24.99,
        "is_free": False,
        "description": "The definitive deck-building roguelike. Craft a custom deck from hundreds of cards, discover relics of unimaginable power, and scale the ever-shifting Spire.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "slay_the_spire.jpg",
        "game_engine": "LibGDX",
        "genres": ["Card Game", "Roguelike", "Strategy"],
        "platforms": ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch", "Android", "iOS"],
        "modes": ["Single Player"],
        "story": "Procedural",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "2.0 Ghz",
            "ram": "2 GB",
            "graphics": "1GB VRAM / OpenGL 3.0+ support",
            "storage": "1 GB"
        }
    },
    {
        "name": "Balatro",
        "developer": ("LocalThunk", "Canada"),
        "publisher": ("Playstack", "UK"),
        "release_date": "2024-02-20",
        "rating": 9.7,
        "price": 14.99,
        "is_free": False,
        "description": "Hypnotically addictive roguelike poker deckbuilder. Play illegal poker hands, discover 150+ game-breaking jokers, and trigger chain reactions to beat the blinds.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "balatro.jpg",
        "game_engine": "LOVE2D",
        "genres": ["Card Game", "Roguelite", "Strategy", "Puzzle"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Nintendo Switch", "Android", "iOS"],
        "modes": ["Single Player"],
        "story": "No Story",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i3",
            "ram": "1 GB",
            "graphics": "OpenGL 2.1 compatible",
            "storage": "200 MB"
        }
    },
    {
        "name": "Hades II",
        "developer": ("Supergiant Games", "USA"),
        "publisher": ("Supergiant Games", "USA"),
        "release_date": "2024-05-06",
        "rating": 9.5,
        "price": 29.99,
        "is_free": False,
        "description": "Play as Melinoe, Princess of the Underworld and sister of Zagreus. Channel ancient witchery to defeat the Titan of Time Chronos in this stunning roguelike sequel.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "hades_2.jpg",
        "game_engine": "Supergiant Engine",
        "genres": ["Action", "Roguelike", "Roguelite", "RPG"],
        "platforms": ["PC"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Dual Core 2.4 GHz",
            "ram": "8 GB",
            "graphics": "GeForce GTX 950 / Radeon HD 7870",
            "storage": "10 GB"
        }
    },
    {
        "name": "Nine Sols",
        "developer": ("Red Candle Games", "Taiwan"),
        "publisher": ("Red Candle Games", "Taiwan"),
        "release_date": "2024-05-29",
        "rating": 9.4,
        "price": 29.99,
        "is_free": False,
        "description": "A lore-rich Tao-punk 2D action platformer featuring Sekiro-inspired deflection combat. Explore the forgotten realm of New Kunlun and slay the 9 ancient rulers.",
        "play_status": "playing",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "nine_sols.jpg",
        "game_engine": "Unity",
        "genres": ["Action", "Metroidvania", "Soulslike", "Platformer"],
        "platforms": ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "AMD FX-4350 / Intel Core i3-4160",
            "ram": "8 GB",
            "graphics": "GeForce GTX 950 / Radeon HD 7950",
            "storage": "15 GB"
        }
    },
    {
        "name": "Dave the Diver",
        "developer": ("MINTROCKET", "South Korea"),
        "publisher": ("MINTROCKET", "South Korea"),
        "release_date": "2023-06-28",
        "rating": 9.3,
        "price": 19.99,
        "is_free": False,
        "description": "Explore the mystical Blue Hole by day spearfishing exotic marine life, and manage a buzzing sushi restaurant by night alongside an eccentric cast of friends.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "dave_the_diver.jpg",
        "game_engine": "Unity",
        "genres": ["Adventure", "RPG", "Simulation"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i3-540",
            "ram": "8 GB",
            "graphics": "NVIDIA Geforce GTS 450",
            "storage": "5 GB"
        }
    },
    {
        "name": "Cuphead",
        "developer": ("Studio MDHR", "Canada"),
        "publisher": ("Studio MDHR", "Canada"),
        "release_date": "2017-09-29",
        "rating": 9.3,
        "price": 19.99,
        "is_free": False,
        "description": "Classic run-and-gun action game heavily inspired by 1930s rubber-hose animation. Battle colossal bosses in handcrafted watercolor environments to repay your debt to the Devil.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "cuphead.jpg",
        "game_engine": "Unity",
        "genres": ["Action", "Platformer"],
        "platforms": ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player", "Co-op", "Local Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core2 Duo E8400 3.0GHz",
            "ram": "3 GB",
            "graphics": "Geforce 9600 GT / AMD HD 3870 512MB",
            "storage": "4 GB"
        }
    },
    {
        "name": "It Takes Two",
        "developer": ("Hazelight Studios", "Sweden"),
        "publisher": ("Electronic Arts", "USA"),
        "release_date": "2021-03-26",
        "rating": 9.6,
        "price": 39.99,
        "is_free": False,
        "description": "Game of the Year winner 2021. An inventive pure co-op platform adventure where clashing couple Cody and May are magically transformed into dolls.",
        "play_status": "completed",
        "is_bookmarked": False,
        "is_favorited": True,
        "cover_image": "it_takes_two.jpg",
        "game_engine": "Unreal Engine 4",
        "genres": ["Action", "Adventure", "Platformer", "Puzzle"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
        "modes": ["Co-op", "Local Co-op"],
        "story": "Linear",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-3570K / AMD FX-6100",
            "ram": "8 GB",
            "graphics": "Nvidia GeForce GTX 660 / AMD Radeon R7 260x",
            "storage": "50 GB"
        }
    },
    {
        "name": "Outer Wilds",
        "developer": ("Mobius Digital", "USA"),
        "publisher": ("Annapurna Interactive", "USA"),
        "release_date": "2019-05-28",
        "rating": 9.6,
        "price": 24.99,
        "is_free": False,
        "description": "Winner of BAFTA Best Game. Strap on your boots and pilot your ship into an open-world solar system locked in an endless 22-minute time loop. Uncover the secrets of the Nomai.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "outer_wilds.jpg",
        "game_engine": "Unity",
        "genres": ["Adventure", "Open World", "Puzzle"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-2300 / AMD FX-4300",
            "ram": "6 GB",
            "graphics": "Nvidia GeForce GTX 660 / AMD Radeon HD 7870",
            "storage": "8 GB"
        }
    },
    {
        "name": "Disco Elysium - The Final Cut",
        "developer": ("ZA/UM", "UK"),
        "publisher": ("ZA/UM", "UK"),
        "release_date": "2021-03-30",
        "rating": 9.7,
        "price": 39.99,
        "is_free": False,
        "description": "A legendary isometric detective RPG set in the impoverished city of Revachol. Interrogate unforgettable characters, crack murders, or take bribes with full voice acting.",
        "play_status": "completed",
        "is_bookmarked": True,
        "is_favorited": True,
        "cover_image": "disco_elysium.jpg",
        "game_engine": "Unity",
        "genres": ["RPG", "Adventure", "Visual Novel"],
        "platforms": ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
        "modes": ["Single Player"],
        "story": "Branching",
        "sysreq": {
            "os": "Windows 10 64-bit",
            "processor": "Intel Core i5-4670K / AMD FX-8350",
            "ram": "8 GB",
            "graphics": "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
            "storage": "22 GB"
        }
    }
]

def seed():
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    print("Connected to Supabase. Seeding 50 games...")

    cur.execute("SELECT genre_name, genre_id FROM genres;")
    genres_map = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT platform_name, platform_id FROM platforms;")
    platforms_map = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT mode_name, mode_id FROM gamemodes;")
    modes_map = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT story_type, story_id FROM storytypes;")
    story_map = {row[0]: row[1] for row in cur.fetchall()}

    added_count = 0
    for g in NEW_GAMES:
        cur.execute("SELECT game_id FROM games WHERE LOWER(game_name) = LOWER(%s);", (g["name"],))
        existing = cur.fetchone()
        if existing:
            print(f"Skipping existing game: {g['name']}")
            continue

        dev_name, dev_country = g["developer"]
        cur.execute("SELECT developer_id FROM developers WHERE LOWER(developer_name) = LOWER(%s);", (dev_name,))
        dev_row = cur.fetchone()
        if dev_row:
            dev_id = dev_row[0]
        else:
            cur.execute("INSERT INTO developers (developer_name, country) VALUES (%s, %s) RETURNING developer_id;", (dev_name, dev_country))
            dev_id = cur.fetchone()[0]

        pub_name, pub_country = g["publisher"]
        cur.execute("SELECT publisher_id FROM publishers WHERE LOWER(publisher_name) = LOWER(%s);", (pub_name,))
        pub_row = cur.fetchone()
        if pub_row:
            pub_id = pub_row[0]
        else:
            cur.execute("INSERT INTO publishers (publisher_name, country) VALUES (%s, %s) RETURNING publisher_id;", (pub_name, pub_country))
            pub_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO games (
                game_name, developer_id, publisher_id, release_date, rating, price,
                is_free_to_play, description, play_status, is_bookmarked, is_favorited,
                cover_image, game_engine
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING game_id;
        """, (
            g["name"], dev_id, pub_id, g["release_date"], g["rating"], g["price"],
            g["is_free"], g["description"], g["play_status"], g["is_bookmarked"], g["is_favorited"],
            g["cover_image"], g["game_engine"]
        ))
        game_id = cur.fetchone()[0]

        for gn in g["genres"]:
            if gn in genres_map:
                cur.execute("INSERT INTO gamegenres (game_id, genre_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (game_id, genres_map[gn]))

        for pl in g["platforms"]:
            if pl in platforms_map:
                cur.execute("INSERT INTO gameplatforms (game_id, platform_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (game_id, platforms_map[pl]))

        for md in g["modes"]:
            if md in modes_map:
                cur.execute("INSERT INTO gamemodesrelation (game_id, mode_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (game_id, modes_map[md]))

        if g["story"] in story_map:
            cur.execute("INSERT INTO gamestory (game_id, story_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (game_id, story_map[g["story"]]))

        # Insert system requirements
        req = g["sysreq"]
        cur.execute("""
            INSERT INTO systemrequirements (
                game_id, operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage,
                recommended_cpu, recommended_gpu, recommended_ram, recommended_storage
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id) DO NOTHING;
        """, (
            game_id,
            req.get("os", "Windows 10 64-bit"),
            req.get("processor", "Intel Core i5"),
            req.get("graphics", "GTX 1060"),
            req.get("ram", "8 GB"),
            req.get("storage", "50 GB"),
            req.get("processor", "Intel Core i7"),
            req.get("graphics", "RTX 2060"),
            req.get("ram", "16 GB"),
            req.get("storage", "50 GB")
        ))

        added_count += 1
        print(f"[{added_count}/50] Added: {g['name']} (ID: {game_id})")

    # Resync sequences
    sync_tables = [
        ("games", "game_id"),
        ("systemrequirements", "requirement_id"),
        ("developers", "developer_id"),
        ("publishers", "publisher_id")
    ]
    for table, col in sync_tables:
        cur.execute(f"""
            SELECT setval(
                pg_get_serial_sequence('{table}', '{col}'),
                COALESCE((SELECT MAX({col}) FROM {table}), 0) + 1,
                false
            );
        """)

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nSuccessfully added {added_count} new games to Supabase! Total games is now 100.")

if __name__ == "__main__":
    seed()
