<?php
/**
 * GET /api/
 * A friendly landing response, and it stops Apache from listing the folder's files.
 */

require __DIR__ . '/bootstrap.php';

send_json(200, true, array(
    'endpoints' => array(
        'GET /api/health.php',
        'GET /api/games.php',
        'GET /api/games.php?id={id}',
        'POST /api/games.php',
        'PATCH /api/games.php?id={id}',
        'DELETE /api/games.php?id={id}',
    ),
), 'GameHub API is running. Open health.php to check the database.');
