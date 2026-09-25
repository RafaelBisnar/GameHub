<?php
/**
 * Shared setup loaded by every endpoint: JSON + CORS headers, error handling,
 * the database connection and small request/response helpers.
 *
 * Written for PHP 7.0+ so it runs on older shared hosting too.
 */

define('GAMEHUB_API', true);

// PHP warnings printed into the response would break the JSON the app expects,
// so they go to the server's error log instead.
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-HTTP-Method-Override');
header('Access-Control-Max-Age: 86400');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Browsers send an OPTIONS "preflight" request before cross-origin writes.
// Answering it with the CORS headers above and no body is all they need.
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

set_exception_handler(function ($e) {
    error_log('GameHub API error: ' . $e);
    send_json(500, false, debug_details($e), 'Something went wrong on the server.');
});

/**
 * Sends the standard { success, data, message } response and stops the script.
 */
function send_json($status, $success, $data = null, $message = '')
{
    http_response_code($status);
    $json = json_encode(
        array('success' => $success, 'data' => $data, 'message' => $message),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    if ($json === false) {
        http_response_code(500);
        $json = '{"success":false,"data":null,"message":"Could not encode the response."}';
    }
    echo $json;
    exit;
}

function method_not_allowed(array $allowed)
{
    header('Allow: ' . implode(', ', $allowed));
    send_json(405, false, null, 'Method not allowed. Use ' . implode(', ', $allowed) . '.');
}

function load_config()
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/config.php';
        if (!is_file($path)) {
            send_json(500, false, null, 'config.php is missing. Copy config.example.php to config.php and fill in your database details.');
        }
        $config = require $path;
        if (!is_array($config)) {
            send_json(500, false, null, 'config.php must return an array. Compare it with config.example.php.');
        }
    }
    return $config;
}

function config_value($key, $default = null)
{
    $config = load_config();
    return array_key_exists($key, $config) ? $config[$key] : $default;
}

/**
 * Error details are only included in responses when 'debug' => true in
 * config.php, so strangers can't learn about the server from error messages.
 */
function debug_details($e)
{
    return config_value('debug', false) ? array('error' => $e->getMessage()) : null;
}

/**
 * Returns one shared PDO connection. PDO with prepared statements is what
 * protects every query from SQL injection.
 */
function db()
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    if (!class_exists('PDO') || !in_array('mysql', PDO::getAvailableDrivers(), true)) {
        send_json(500, false, null, 'The PDO MySQL extension is not enabled in this PHP installation.');
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        config_value('db_host', 'localhost'),
        (int) config_value('db_port', 3306),
        config_value('db_name', ''),
        config_value('db_charset', 'utf8mb4')
    );

    try {
        $pdo = new PDO($dsn, config_value('db_user', ''), config_value('db_pass', ''), array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Real server-side prepared statements instead of PHP emulating them.
            PDO::ATTR_EMULATE_PREPARES => false,
        ));
    } catch (PDOException $e) {
        error_log('GameHub DB connection failed: ' . $e->getMessage());
        send_json(503, false, debug_details($e), 'Could not connect to the database. Check the values in config.php.');
    }

    return $pdo;
}

/**
 * The HTTP method, honoring an override for hosts that block PATCH/PUT/DELETE:
 * a POST with an "X-HTTP-Method-Override: PATCH" header (or ?_method=PATCH)
 * is treated as a PATCH.
 */
function request_method()
{
    $method = strtoupper(isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET');
    if ($method !== 'POST') {
        return $method;
    }

    $override = '';
    if (!empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
        $override = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
    } elseif (isset($_GET['_method']) && is_string($_GET['_method'])) {
        $override = $_GET['_method'];
    }
    $override = strtoupper(trim($override));

    return in_array($override, array('PATCH', 'PUT', 'DELETE'), true) ? $override : $method;
}

/**
 * Reads the request body as a JSON object and returns it as an array.
 */
function read_json_body()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        send_json(400, false, null, 'The request body is empty. Send the data as JSON.');
    }
    if (strlen($raw) > 65536) {
        send_json(413, false, null, 'The request body is too large.');
    }

    $decoded = json_decode($raw);
    if (!is_object($decoded)) {
        send_json(400, false, null, 'The request body must be a JSON object.');
    }

    return get_object_vars($decoded);
}

// This file only defines helpers; opening it directly in a browser does nothing.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    send_json(404, false, null, 'Not found.');
}
