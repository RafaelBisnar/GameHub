-- GameHub database schema
--
-- How to import: phpMyAdmin -> click your database in the left sidebar ->
-- Import tab -> choose this file -> Go.
--
-- Safe to import more than once: the table is only created if it doesn't
-- exist, and the sample games are skipped if their ids are already there.
--
-- Written for MySQL 5.5.3+ (utf8mb4 lets titles and descriptions hold any
-- character, including emoji). If the import fails with "Unknown character
-- set: utf8mb4", replace every utf8mb4 below with utf8 and set
-- 'db_charset' => 'utf8' in config.php.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  image VARCHAR(500) NOT NULL DEFAULT '',
  genre VARCHAR(100) NOT NULL,
  platform VARCHAR(150) NOT NULL,
  developer VARCHAR(150) NOT NULL,
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  multiplayer_type VARCHAR(100) NOT NULL DEFAULT '',
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  is_favorite TINYINT(1) NOT NULL DEFAULT 0,
  -- Stored in UTC. Set by the API with UTC_TIMESTAMP(), because MySQL
  -- before 5.6 can't default a DATETIME column to the current time.
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The same 10 sample games the app shipped with. "local:..." images point to
-- pictures bundled inside the app, so they load without the internet.
INSERT IGNORE INTO games
  (id, title, image, genre, platform, developer, release_date, description, rating, multiplayer_type, status, is_favorite, created_at, updated_at)
VALUES
  (1, 'Valorant', 'local:valorant', 'Tactical Shooter', 'PC', 'Riot Games', '2020-06-02',
   'A precision-based 5v5 shooter where unique agent abilities meet tight gunplay. Every round comes down to sharp aim and sharper strategy.',
   4.5, '5v5 Online PvP', 'Active', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (2, 'League of Legends', 'local:league-of-legends', 'MOBA', 'PC', 'Riot Games', '2009-10-27',
   'Two teams of five champions battle across three lanes to destroy the enemy Nexus. Over a decade in, its roster and meta are still evolving.',
   4.3, '5v5 Online PvP', 'Active', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (3, 'Minecraft', 'local:minecraft', 'Sandbox', 'PC, Xbox, PlayStation, Switch, Mobile', 'Mojang Studios', '2011-11-18',
   'A blocky open world where anything can be built, mined, or survived. Play solo or bring friends into shared worlds for co-op building and adventure.',
   4.8, 'Co-op & Online Multiplayer', 'Active', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (4, 'Fortnite', 'local:fortnite', 'Battle Royale', 'PC, Xbox, PlayStation, Switch, Mobile', 'Epic Games', '2017-07-25',
   'A hundred players drop onto a shrinking island, scavenging weapons and building structures to be the last one standing.',
   4.2, 'Up to 100-player Battle Royale', 'Active', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (5, 'Apex Legends', 'local:apex-legends', 'Battle Royale', 'PC, Xbox, PlayStation, Switch', 'Respawn Entertainment', '2019-02-04',
   'Squads of three Legends, each with distinct abilities, fight across a shrinking arena in fast, momentum-driven combat.',
   4.4, 'Squad-based Battle Royale (3 players)', 'Active', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (6, 'Genshin Impact', 'local:genshin-impact', 'Action RPG', 'PC, PlayStation, Mobile', 'HoYoverse', '2020-09-28',
   'An open-world adventure across the elemental land of Teyvat, blending elemental combat, exploration, and a gacha-driven roster of characters.',
   4.6, 'Co-op Online (up to 4 players)', 'Active', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (7, 'Dota 2', 'local:dota-2', 'MOBA', 'PC', 'Valve', '2013-07-09',
   'A deep, unforgiving 5v5 strategy game where over a hundred heroes create nearly limitless team compositions and mind games.',
   4.5, '5v5 Online PvP', 'Active', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (8, 'Roblox', 'local:roblox', 'Sandbox / Platform Creation', 'PC, Xbox, Mobile', 'Roblox Corporation', '2006-09-01',
   'A massive platform of user-created games ranging from obbies to tycoons, all built with the in-house Studio toolset.',
   4.0, 'Massively Multiplayer Online', 'Inactive', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (9, 'Overwatch 2', 'local:overwatch-2', 'Hero Shooter', 'PC, Xbox, PlayStation, Switch', 'Blizzard Entertainment', '2022-10-04',
   'A team-based shooter of tanks, damage dealers, and supports, each with a distinct kit, fighting over objective-based maps.',
   3.8, '5v5 Online PvP', 'Inactive', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (10, 'Counter-Strike 2', 'local:counter-strike-2', 'Tactical Shooter', 'PC', 'Valve', '2023-09-27',
   'The long-running bomb-defusal shooter rebuilt on Source 2, prized for its punishing economy and razor-sharp gunplay.',
   4.7, '5v5 Online PvP', 'Active', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
