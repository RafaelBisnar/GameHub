<?php
/**
 * CRUD for games.
 *
 *   GET    /api/games.php           list all games
 *   GET    /api/games.php?id=5      one game
 *   POST   /api/games.php           create (JSON body)
 *   PATCH  /api/games.php?id=5      update only the fields sent (JSON body)
 *   DELETE /api/games.php?id=5      delete
 *
 * The app uses camelCase names (releaseDate); the table uses snake_case
 * (release_date). game_from_row() and validate_game() translate between them.
 */

require __DIR__ . '/bootstrap.php';

const GAME_COLUMNS = 'id, title, image, genre, platform, developer, release_date, description,
    rating, multiplayer_type, status, is_favorite, created_at, updated_at';

// Plain text fields: JSON name => [column, label for error messages, max length, required]
const TEXT_FIELDS = array(
    'title' => array('title', 'Title', 150, true),
    'genre' => array('genre', 'Genre', 100, true),
    'platform' => array('platform', 'Platform', 150, true),
    'developer' => array('developer', 'Developer', 150, true),
    'description' => array('description', 'Description', 5000, false),
    'multiplayerType' => array('multiplayer_type', 'Multiplayer type', 100, false),
);

const GAME_STATUSES = array('Active', 'Inactive');

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

$method = request_method();
$id = parse_id();

switch ($method) {
    case 'GET':
        if ($id === null) {
            list_games();
        } else {
            show_game($id);
        }
        break;
    case 'POST':
        if ($id !== null) {
            send_json(400, false, null, 'Do not send an id when creating a game.');
        }
        create_game();
        break;
    case 'PATCH':
    case 'PUT':
        update_game(require_id($id));
        break;
    case 'DELETE':
        delete_game(require_id($id));
        break;
    default:
        method_not_allowed(array('GET', 'POST', 'PATCH', 'DELETE'));
}

// ---------------------------------------------------------------------------
// Handlers (each one ends by calling send_json, which exits)
// ---------------------------------------------------------------------------

function list_games()
{
    $rows = db()->query('SELECT ' . GAME_COLUMNS . ' FROM games ORDER BY id ASC')->fetchAll();
    send_json(200, true, array_map('game_from_row', $rows), '');
}

function show_game($id)
{
    send_json(200, true, find_game_or_404($id), '');
}

function create_game()
{
    $values = validate_game(read_json_body(), true);

    $count = (int) db()->query('SELECT COUNT(*) FROM games')->fetchColumn();
    $maxGames = (int) config_value('max_games', 500);
    if ($count >= $maxGames) {
        send_json(409, false, null, "The library is full ($maxGames games). Delete a game before adding a new one.");
    }

    $columns = array_keys($values);
    $placeholders = array_map(function ($column) {
        return ':' . $column;
    }, $columns);

    $sql = 'INSERT INTO games (' . implode(', ', $columns) . ', created_at, updated_at)
            VALUES (' . implode(', ', $placeholders) . ', UTC_TIMESTAMP(), UTC_TIMESTAMP())';
    db()->prepare($sql)->execute(prefix_keys($values));

    $game = find_game_or_404((int) db()->lastInsertId());
    send_json(201, true, $game, 'Game created.');
}

function update_game($id)
{
    // Check first: MySQL reports 0 changed rows both for "not found" and
    // for "values were already the same", so the UPDATE alone can't tell us.
    find_game_or_404($id);

    $values = validate_game(read_json_body(), false);
    if (count($values) === 0) {
        send_json(400, false, null, 'Send at least one field to update.');
    }

    // Column names come from our own whitelist in validate_game(), never from
    // the request, so building the SET list here is safe. Values are bound.
    $assignments = array();
    foreach (array_keys($values) as $column) {
        $assignments[] = "$column = :$column";
    }
    $params = prefix_keys($values);
    $params[':id'] = $id;

    $sql = 'UPDATE games SET ' . implode(', ', $assignments) . ', updated_at = UTC_TIMESTAMP() WHERE id = :id';
    db()->prepare($sql)->execute($params);

    send_json(200, true, find_game_or_404($id), 'Game updated.');
}

function delete_game($id)
{
    $statement = db()->prepare('DELETE FROM games WHERE id = :id');
    $statement->execute(array(':id' => $id));

    if ($statement->rowCount() === 0) {
        send_json(404, false, null, 'Game not found.');
    }
    send_json(200, true, array('id' => (string) $id), 'Game deleted.');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parse_id()
{
    if (!isset($_GET['id'])) {
        return null;
    }
    $raw = $_GET['id'];
    if (!is_string($raw) || !preg_match('/^[1-9][0-9]{0,9}$/', $raw) || (int) $raw > 4294967295) {
        send_json(400, false, null, 'The id must be a positive whole number.');
    }
    return (int) $raw;
}

function require_id($id)
{
    if ($id === null) {
        send_json(400, false, null, 'Add ?id= to the URL to choose which game.');
    }
    return $id;
}

function find_game_or_404($id)
{
    $statement = db()->prepare('SELECT ' . GAME_COLUMNS . ' FROM games WHERE id = :id');
    $statement->execute(array(':id' => $id));
    $row = $statement->fetch();

    if ($row === false) {
        send_json(404, false, null, 'Game not found.');
    }
    return game_from_row($row);
}

/**
 * Turns a database row into the Game shape the app uses (src/types/Game.ts).
 */
function game_from_row(array $row)
{
    return array(
        'id' => (string) $row['id'],
        'title' => $row['title'],
        'image' => $row['image'],
        'genre' => $row['genre'],
        'platform' => $row['platform'],
        'developer' => $row['developer'],
        'releaseDate' => $row['release_date'],
        'description' => $row['description'],
        'rating' => (float) $row['rating'],
        'multiplayerType' => $row['multiplayer_type'],
        'status' => $row['status'],
        'isFavorite' => (bool) $row['is_favorite'],
        'createdAt' => to_iso_utc($row['created_at']),
        'updatedAt' => to_iso_utc($row['updated_at']),
    );
}

// Timestamps are stored in UTC, so "2025-01-01 00:00:00" becomes "2025-01-01T00:00:00.000Z".
function to_iso_utc($datetime)
{
    return str_replace(' ', 'T', $datetime) . '.000Z';
}

function prefix_keys(array $values)
{
    $params = array();
    foreach ($values as $column => $value) {
        $params[':' . $column] = $value;
    }
    return $params;
}

/**
 * Validates and cleans the request body. Returns column => value pairs ready
 * for the database, or responds with 400 and every problem found.
 *
 * $isCreate: when true, required fields must be present and missing optional
 * fields get defaults. When false (PATCH), only the fields sent are checked.
 */
function validate_game(array $body, $isCreate)
{
    $values = array();
    $errors = array();

    foreach (TEXT_FIELDS as $field => $spec) {
        list($column, $label, $maxLength, $required) = $spec;
        if (!array_key_exists($field, $body)) {
            if ($isCreate && $required) {
                $errors[$field] = "$label is required.";
            } elseif ($isCreate) {
                $values[$column] = '';
            }
            continue;
        }
        $text = clean_text($body[$field], $label, $maxLength, $required, $error);
        if ($error !== null) {
            $errors[$field] = $error;
        } else {
            $values[$column] = $text;
        }
    }

    if (array_key_exists('image', $body)) {
        $image = clean_text($body['image'], 'Cover image', 500, false, $error);
        if ($error === null && $image !== '' && !is_valid_image($image)) {
            $error = 'Cover image must be a link starting with http:// or https://.';
        }
        if ($error !== null) {
            $errors['image'] = $error;
        } else {
            $values['image'] = $image;
        }
    } elseif ($isCreate) {
        $values['image'] = '';
    }

    if (array_key_exists('releaseDate', $body)) {
        $date = normalize_date($body['releaseDate']);
        if ($date === null) {
            $errors['releaseDate'] = 'Release date must be a valid date (YYYY-MM-DD).';
        } else {
            $values['release_date'] = $date;
        }
    } elseif ($isCreate) {
        $values['release_date'] = date('Y-m-d');
    }

    if (array_key_exists('rating', $body)) {
        $rating = $body['rating'];
        if ((!is_int($rating) && !is_float($rating) && !(is_string($rating) && is_numeric($rating)))
            || (float) $rating < 0 || (float) $rating > 5) {
            $errors['rating'] = 'Rating must be a number between 0 and 5.';
        } else {
            $values['rating'] = round((float) $rating, 2);
        }
    } elseif ($isCreate) {
        $values['rating'] = 0;
    }

    if (array_key_exists('status', $body)) {
        if (!in_array($body['status'], GAME_STATUSES, true)) {
            $errors['status'] = 'Status must be Active or Inactive.';
        } else {
            $values['status'] = $body['status'];
        }
    } elseif ($isCreate) {
        $values['status'] = 'Active';
    }

    if (array_key_exists('isFavorite', $body)) {
        $favorite = $body['isFavorite'];
        if (!is_bool($favorite) && $favorite !== 0 && $favorite !== 1) {
            $errors['isFavorite'] = 'isFavorite must be true or false.';
        } else {
            $values['is_favorite'] = $favorite ? 1 : 0;
        }
    } elseif ($isCreate) {
        $values['is_favorite'] = 0;
    }

    if (count($errors) > 0) {
        // Put the problems in the message too, so the app can show it as-is.
        send_json(400, false, array('errors' => $errors), implode(' ', array_values($errors)));
    }

    return $values;
}

/**
 * Trims text and removes invisible control characters (keeping line breaks).
 * We store the text as typed: prepared statements already make it safe for
 * SQL, and React Native displays text literally, so HTML-escaping isn't needed.
 * Sets $error to a message, or null when the value is fine.
 */
function clean_text($value, $label, $maxLength, $required, &$error)
{
    $error = null;
    if (!is_string($value)) {
        $error = "$label must be text.";
        return null;
    }

    // The /u flag makes preg_replace return null for invalid UTF-8.
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
    if ($text === null) {
        $error = "$label contains invalid characters.";
        return null;
    }
    $text = trim($text);

    if ($required && $text === '') {
        $error = "$label is required.";
    } elseif (preg_match_all('/./us', $text) > $maxLength) {
        $error = "$label must be $maxLength characters or fewer.";
    }
    return $text;
}

// Either a bundled app image ("local:valorant") or an http(s) URL.
function is_valid_image($image)
{
    if (preg_match('/^local:[a-z0-9-]+$/', $image)) {
        return true;
    }
    $scheme = strtolower((string) parse_url($image, PHP_URL_SCHEME));
    return filter_var($image, FILTER_VALIDATE_URL) !== false && ($scheme === 'http' || $scheme === 'https');
}

/**
 * Accepts YYYY-MM-DD, or any other date format PHP understands (the app's form
 * is lenient), and returns it as YYYY-MM-DD. An empty value means today,
 * matching what the form does. Returns null if it isn't a date.
 */
function normalize_date($value)
{
    if (!is_string($value)) {
        return null;
    }
    $value = trim($value);
    if ($value === '') {
        return date('Y-m-d');
    }

    $date = DateTime::createFromFormat('!Y-m-d', $value);
    if ($date !== false && $date->format('Y-m-d') === $value) {
        return $value;
    }

    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return null;
    }
    $normalized = date('Y-m-d', $timestamp);
    return preg_match('/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/', $normalized) ? $normalized : null;
}
