<?php
/**
 * GET /api/health.php
 * Open this in a browser to check that PHP runs and the database is reachable.
 */

require __DIR__ . '/bootstrap.php';

if (request_method() !== 'GET') {
    method_not_allowed(array('GET'));
}

$pdo = db();

try {
    $count = (int) $pdo->query('SELECT COUNT(*) FROM games')->fetchColumn();
} catch (PDOException $e) {
    // 42S02 = "table doesn't exist": connected fine, but schema.sql wasn't imported.
    if ($e->getCode() === '42S02') {
        send_json(500, false, debug_details($e), 'Connected to the database, but the games table does not exist. Import schema.sql in phpMyAdmin.');
    }
    throw $e;
}

send_json(200, true, array('database' => 'connected', 'games' => $count), 'API and database are working.');
