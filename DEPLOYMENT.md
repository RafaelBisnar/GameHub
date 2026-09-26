# Deploying GameHub

This guide puts the GameHub API online at `https://yourname.duckdns.org/api/`
so the Android app can read and save games in your Freehostia MySQL database.

Everywhere you see **`yourname`**, use your own DuckDNS subdomain. For example,
if your DuckDNS domain is `rafgamehub.duckdns.org`, then `yourname` = `rafgamehub`.

## How the pieces fit together

```
 Phone (GameHub app)
      │  HTTPS request to yourname.duckdns.org/api/games.php
      ▼
 DuckDNS  ── only answers "which IP address is yourname.duckdns.org?"
      │
      ▼
 Freehostia server (that IP)
      ├─ Apache + PHP run backend/api/*.php
      └─ MySQL database (the games table)
```

- **DuckDNS** is a free "phone book": it turns your domain name into Freehostia's
  IP address. It does not host anything.
- **Freehostia** runs the PHP files and the database.
- The **app** only knows the URL. It never talks to MySQL directly.

## Before you start

You'll need:

- Your Freehostia and DuckDNS logins.
- Your MySQL details from Freehostia. In the control panel, open the **MySQL
  Databases** section and note the **database name**, **user name**, **password** and
  **host**. The host is sometimes `localhost`, sometimes a name like
  `mysqlX.freehostia.com`. Use exactly what that page shows.
- This repository on your PC. You'll upload files from its `backend/` folder.

> Freehostia's control panel changes over time. If a button name here doesn't
> match exactly, look for the closest one in the same section, or use the
> **Help** link in the corner of that section.

---

## Step 1: Add your DuckDNS domain to Freehostia

1. Log in to the Freehostia control panel.
2. Open **Hosted Domains** (sometimes under **My Domains**).
3. Choose the option to host or add a domain, and enter `yourname.duckdns.org`.
   - You don't own `duckdns.org`, so if you're asked to register or transfer the
     domain, choose the option for a domain **registered elsewhere / already owned**.
   - If you see a **"Do not manage DNS"** checkbox, leave it **unchecked**.
   - If you're offered a choice of **Shared IP**, pick the one labelled
     **"Shared IP for SSL"** if it exists. It's needed for HTTPS in Step 3, and
     choosing it now means you only set DuckDNS once.
4. Save.

**What you should see:** `yourname.duckdns.org` listed in the Hosted Domains
table, and a folder with the same name in the **File Manager**.

**If it fails:**

| Problem | What to do |
|---|---|
| Freehostia says the domain is invalid or refuses a subdomain of another domain | Freehostia won't host this DuckDNS name. Stop here. The fallback is to use a domain or subdomain Freehostia gave your account (the app only needs a different URL). |
| "You have reached the maximum number of domains" | The free plan allows 5. Remove one you don't use. |

---

## Step 2: Point DuckDNS at Freehostia's IP

1. **Find the IP address.** In **Hosted Domains**, open your domain (click it, or
   **Edit Domain**). The **Shared IP** field shows an address like `123.45.67.89`.
   If you picked "Shared IP for SSL" in Step 1, use that IP.
   It's also often shown in the domain's **DNS records** as the **A record**.
2. Go to https://www.duckdns.org and log in.
3. In the row for `yourname`, type the IP in the **current ip** box and click
   **update ip**.
4. Wait 2–5 minutes, then check it from your PC. Open **Command Prompt** or
   **PowerShell** and run:

   ```
   nslookup yourname.duckdns.org
   ```

**What you should see:** after `Name: yourname.duckdns.org`, an `Address:`
line with **exactly the IP from step 1**.

**If it fails:**

| Problem | What to do |
|---|---|
| `Non-existent domain`, or an old/different IP | DuckDNS hasn't updated yet. Wait 5–10 minutes and retry. Check the DuckDNS page shows the new IP. |
| Correct in nslookup, but the browser still goes nowhere later | Your PC cached the old answer. Run `ipconfig /flushdns` and restart the browser. |
| The DuckDNS IP keeps changing back by itself | You (or a router or app) set up automatic DuckDNS updates, which overwrite it with your home IP. Turn those off for this domain. |

> Don't put your home IP in DuckDNS. It must be Freehostia's IP, because
> that's where the PHP files live.

---

## Step 3: Try to enable free HTTPS (Let's Encrypt)

HTTPS encrypts traffic between the phone and the server. Android apps block
plain `http://` by default, so HTTPS is the normal way to go.

1. **Hosted Domains** → your domain → **Edit Domain**.
2. Set **Shared IP** to **Shared IP for SSL** (skip this if you already did it in
   Step 1). **If the IP address changes**, repeat Step 2 with the new IP.
3. The **SSL Certificate** field should now offer **Request Let's Encrypt SSL**.
   Choose it and save or confirm.
4. Let's Encrypt takes about **30 minutes** or more. Continue with Steps 4 and 5
   while you wait.

**What you should see (after waiting):** your domain shows an SSL certificate as
issued or active, and `https://yourname.duckdns.org` opens with a padlock icon in
the browser (after Step 5 you'll have a page to test with).

**If it fails:**

| Problem | What to do |
|---|---|
| No "Shared IP for SSL" or no Let's Encrypt option | SSL isn't offered for this domain on your plan. Use the **HTTP fallback** below. |
| Status stays "pending" or "failed" after 1–2 hours | Check Step 2 (`nslookup` must show the **SSL** IP), then request again once. If it still fails, the likely reason is that DuckDNS keeps its own nameservers, and Freehostia's check may need its own. Use the **HTTP fallback** below. |
| Browser shows a certificate warning | The certificate isn't installed yet (wait longer) or failed (see above). Clearing the browser cache can help. |

### HTTP fallback (only if HTTPS can't be enabled)

This is what GameHub currently uses:

- the app's `.env` points at `http://yourname.duckdns.org/api` (plain HTTP);
- this works in Expo Go. A standalone Android build (APK) would additionally
  need `expo-build-properties` with `android.usesCleartextTraffic: true`,
  because Android blocks `http://` in release builds by default.

This is a **workaround**: data, including anything typed into the app, travels
unencrypted, and anyone on the same Wi-Fi could read it. It's acceptable for a
class demo with sample game data, but never for passwords or personal
information.

---

## Step 4: Create the database table (import `schema.sql`)

1. Open **phpMyAdmin** from the Freehostia control panel (usually in the
   **MySQL Databases** section).
2. In the **left sidebar**, click your database name. This matters: it tells
   phpMyAdmin where to create the table.
3. Click the **Import** tab at the top.
4. **Choose File** → select `backend/schema.sql` from this repository.
5. Leave the other options as they are and click **Go** (or **Import**) at the bottom.

**What you should see:** a green message like *"Import has been successfully
finished"*. The left sidebar now shows a **`games`** table. Click it, then
**Browse**: you should see 10 games (Valorant, League of Legends, …).

**If it fails:**

| Problem | What to do |
|---|---|
| `#1046 No database selected` | You skipped step 2. Click the database in the left sidebar, then import again. |
| `#1044 Access denied for user … to database` | You're in the wrong database. Pick the one listed in Freehostia's MySQL section. |
| `Unknown character set: 'utf8mb4'` | Your MySQL is very old. Open `schema.sql` in a text editor, replace every `utf8mb4` with `utf8`, import again, and later set `'db_charset' => 'utf8'` in `config.php`. |
| `Table 'games' already exists` warning | Harmless. The file skips the table and games that are already there. |

> Importing again later is safe: it doesn't delete anything or duplicate the 10 sample games.

---

## Step 5: Upload the API files and fill in `config.php`

### 5a. Prepare `config.php` on your PC

1. In this repository, open the folder `backend/api/`.
2. Copy `config.example.php` and name the copy **`config.php`** (same folder).
3. Open `config.php` in a text editor (VS Code or Notepad) and replace the placeholders
   with your details from the MySQL Databases section:

   ```php
   'db_host' => 'the host shown by Freehostia',
   'db_port' => 3306,   // or the port Freehostia shows, e.g. 3307
   'db_name' => 'your database name',
   'db_user' => 'your database user',
   'db_pass' => 'your database password',
   ```

   Keep the quotes and the commas.
4. Save.

`config.php` is listed in `backend/.gitignore`, so git won't commit your
password. Don't paste it into chats, screenshots or your report.

### 5b. Upload

1. Open the **File Manager** in the Freehostia control panel.
2. Open the folder named **`yourname.duckdns.org`**. This is the domain's web
   folder: whatever is inside it appears at `http://yourname.duckdns.org/`.
3. Inside it, create a new folder named exactly **`api`** (lowercase).
4. Open `api` and upload these files from your PC's `backend/api/` folder:

   | Upload | Why |
   |---|---|
   | `bootstrap.php` | shared code every endpoint uses |
   | `games.php` | the CRUD endpoint the app calls |
   | `health.php` | the check page for Step 6 |
   | `index.php` | the message at `/api/`, and it hides the file list |
   | `config.php` | your database login (the one you just filled in) |

   You don't need to upload `config.example.php` or `schema.sql`.

**What you should see in File Manager:**

```
yourname.duckdns.org/
└── api/
    ├── bootstrap.php
    ├── config.php
    ├── games.php
    ├── health.php
    └── index.php
```

**Common upload mistakes:** uploading the whole `backend` folder, so the URL
becomes `/backend/api/`; creating `api/api/`; or naming the folder `API` with
capital letters. The final path must be exactly `yourname.duckdns.org/api/health.php`.

**PHP version:** if the control panel has a **PHP Settings** or **PHP version**
section, choose PHP **7.4 or 8.x**. The API needs at least PHP 7.0.

---

## Step 6: Test the API in a browser

Test in this order. Each check adds one more piece.

### 6a. PHP works (no database needed)

Open `http://yourname.duckdns.org/api/`

**You should see:**

```json
{"success":true,"data":{"endpoints":[...]},"message":"GameHub API is running. Open health.php to check the database."}
```

### 6b. Database works

Open `http://yourname.duckdns.org/api/health.php`

**You should see:**

```json
{"success":true,"data":{"database":"connected","games":10},"message":"API and database are working."}
```

### 6c. HTTPS works

Open `https://yourname.duckdns.org/api/health.php`, with **https**.

**You should see:** the same JSON as 6b, with a padlock in the address bar. If
this fails but 6b works, SSL isn't ready yet (Step 3). Wait, or use the HTTP fallback.

### 6d. Saving works (PATCH), optional but recommended

Some hosts block the request types used for editing and deleting. Test it from
**PowerShell** on your PC. This sets Valorant (id 1) as a favorite, which it already is,
so nothing actually changes:

```powershell
Invoke-RestMethod -Method Patch -Uri "https://yourname.duckdns.org/api/games.php?id=1" -ContentType "application/json" -Body '{"isFavorite":true}'
```

**You should see:** `success : True` and the Valorant game data.
If you get **405** or **403**, the host blocks PATCH/DELETE. Set
`EXPO_PUBLIC_API_METHOD_OVERRIDE=true` in the app's `.env` (see Step 7). The
API already supports that workaround.

### What the errors mean

| You see | Meaning | Fix |
|---|---|---|
| Browser can't find the site / times out | DNS isn't pointing at Freehostia | Step 2: check `nslookup`, wait, flush DNS |
| A Freehostia default or "domain not configured" page | The domain isn't hosted, or its folder is empty | Step 1, and check the upload location in Step 5 |
| **404 Not Found** for `/api/health.php` | Files are in the wrong folder | Check the folder tree in Step 5b |
| The browser **downloads** the file or shows PHP code | PHP isn't enabled for this domain | Enable PHP or pick a PHP version in the control panel |
| **500 Internal Server Error** (a plain page, not JSON) | PHP crashed before our code ran, often an old PHP version | Set PHP 7.4+. Check the control panel's **error log** |
| `"config.php is missing..."` | `config.php` wasn't uploaded, or is in the wrong folder | Upload it into `api/` |
| `"Could not connect to the database..."` (HTTP 503) | Wrong login details in `config.php` | See the next table |
| `"...the games table does not exist. Import schema.sql..."` | The table isn't in this database | Step 4, and make sure `db_name` is the same database |
| `"The PDO MySQL extension is not enabled..."` | PHP is missing the MySQL driver | Enable `pdo_mysql` in PHP settings, or ask Freehostia support |

**Finding the exact database error:** temporarily change `'debug' => false` to
`'debug' => true` in `config.php` on the server (File Manager can edit files), then
reload `health.php`. The response now includes an `"error"` message:

| Error text contains | Fix in `config.php` |
|---|---|
| `Access denied for user` | `db_user` or `db_pass` is wrong. Copy them again from the MySQL section. |
| `Unknown database` | `db_name` is wrong. It often includes a prefix like `username_`. |
| `getaddrinfo failed` / `Unknown MySQL server host` | `db_host` is wrong. Use the host shown in the MySQL section. |
| `Connection refused` / `Can't connect to MySQL server` | Wrong `db_host` (try the exact name from the MySQL section instead of `localhost`, or the other way round) |

**Set `'debug'` back to `false`** when it works.

---

## Step 7: Point the app at your server and test on your phone

1. In the `gamehub/` folder, copy `.env.example` to a new file named **`.env`**.
2. Edit the URL:

   ```
   EXPO_PUBLIC_API_URL=https://yourname.duckdns.org/api
   EXPO_PUBLIC_API_METHOD_OVERRIDE=false
   ```

   Use `http://` only if you're on the HTTP fallback. Set the override to `true`
   only if Step 6d gave 405 or 403.
3. Start the app: open a terminal in `gamehub/` and run `npx expo start`. Scan the QR
   code with **Expo Go** on your phone.
   **Restart this command every time you change `.env`**, because the value is read at startup.
4. Try every feature: the list loads, add a game, edit it, tap the heart, delete it.
   Then refresh phpMyAdmin → `games` → **Browse** to see the changes in the database.

| In the app you see | Meaning |
|---|---|
| "The API address is missing. Set EXPO_PUBLIC_API_URL in .env." | `.env` is missing, misspelled, or not in `gamehub/`, or you didn't restart `npx expo start` |
| "Can't reach the server. Check your internet connection." | Wrong URL, the phone is offline, or you're using `http://` in a build without the fallback |
| "The server sent an unexpected response (HTTP …)" | The server replied with a web page instead of API JSON. Open the same URL on the phone's browser to see what it is. |
| "The server took too long to respond." | The free server is slow or busy. Tap **Try Again**. |

When everything works here, the deployment is done.

---

## Keeping it working

- **Changing the database login:** edit `config.php` on the server only.
- **Updating the API code:** re-upload the changed `.php` files into `api/`. Don't
  overwrite the server's `config.php` with the example.
- **The library is limited to 500 games** (`max_games` in `config.php`) to protect the
  10 MB database. The app shows a clear message if it's reached.
- **Security note:** there's no login, so anyone with the app or the URL can add,
  edit or delete games. That's fine for a class demo with sample data. Don't store
  anything private in it.
