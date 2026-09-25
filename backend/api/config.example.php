<?php
/**
 * Copy this file to config.php (same folder) and fill in your Freehostia
 * MySQL details. You'll find them in the Freehostia control panel under
 * MySQL Databases. Never commit config.php; it is listed in .gitignore.
 */

// Opening this file directly in a browser shows a blank page instead of running it.
if (!defined('GAMEHUB_API')) {
    exit;
}

return array(
    'db_host' => 'your_db_host',       // e.g. mysql.freehostia.com or localhost
    'db_port' => 3306,                 // use the port Freehostia shows (e.g. 3307)
    'db_name' => 'your_db_name',
    'db_user' => 'your_db_user',
    'db_pass' => 'your_db_password',

    // Change to 'utf8' only if schema.sql import failed with an "unknown
    // character set utf8mb4" error (very old MySQL 5 versions).
    'db_charset' => 'utf8mb4',

    // Stops strangers from filling the 10MB database. The app gets a clear
    // error message when the limit is reached.
    'max_games' => 500,

    // Set to true only while troubleshooting: error responses will then include
    // the real error text. Set it back to false when things work.
    'debug' => false,
);
