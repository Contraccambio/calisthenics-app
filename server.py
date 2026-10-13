#!/usr/bin/env python3
"""Calisthenics Log backend: one shared SQLite log. Stdlib only."""

from __future__ import annotations

import json
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent


def db_file() -> Path:
    data_dir = os.environ.get("DATA_DIR")
    if data_dir:
        return Path(data_dir) / "app.db"
    return ROOT / "data" / "app.db"
STATIC_OK = {
    ".html", ".css", ".js", ".svg", ".json", ".png", ".ico", ".txt", ".woff", ".woff2",
}

COLORS = ["#e8ff47", "#7dffc2", "#7ec8ff", "#ffb347", "#ff8fab", "#c4b5fd"]
SHARED_USER_ID = "shared-log"

db_lock = threading.Lock()


def load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect() -> sqlite3.Connection:
    path = db_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            color TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_seen TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS auth_sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT,
            is_admin INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            date TEXT NOT NULL,
            day INTEGER NOT NULL,
            week TEXT NOT NULL,
            text TEXT NOT NULL DEFAULT '',
            done INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL,
            UNIQUE(user_id, exercise_id, date),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS workout_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            day INTEGER NOT NULL,
            week TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            UNIQUE(user_id, date, day),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS community_posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            day INTEGER,
            exercise_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS community_replies (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
    )
    conn.commit()


CONN = None


def db() -> sqlite3.Connection:
    return CONN


def user_public(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "color": row["color"],
        "createdAt": row["created_at"],
        "lastSeen": row["last_seen"],
    }


POST_MAX_LEN = 2000
REPLY_MAX_LEN = 1000
COMMUNITY_LIMIT = 80

VALID_EXERCISE_IDS = {
    "d1-pullups", "d1-dips", "d1-mu", "d1-fl", "d1-bap", "d1-chin", "d1-push", "d1-aus", "d1-df", "d1-lr",
    "d2-chin", "d2-bardips", "d2-oap", "d2-bl", "d2-hs", "d2-barset", "d2-vpush", "d2-aus", "d2-arms", "d2-abs",
    "d3-mu", "d3-fl", "d3-flr", "d3-bap", "d3-bl", "d3-hs", "d3-lsit", "d3-ladder", "d3-wheel",
}


def author_public(row: sqlite3.Row) -> dict:
    return {
        "id": row["author_id"],
        "name": row["author_name"],
        "color": row["author_color"],
    }


def parse_optional_day(value) -> int | None:
    if value in (None, "", False):
        return None
    try:
        day = int(value)
    except (TypeError, ValueError):
        return None
    return day if day in (1, 2, 3) else None


def note_public(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "exerciseId": row["exercise_id"],
        "date": row["date"],
        "day": row["day"],
        "week": row["week"],
        "text": row["text"],
        "done": bool(row["done"]),
        "updatedAt": row["updated_at"],
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def json_body(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        if not raw:
            return {}
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def send_json(self, payload, status: int = 200, set_cookies=None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        if set_cookies:
            for item in set_cookies:
                self.send_header("Set-Cookie", item)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message: str, status: int = 400) -> None:
        self.send_json({"error": message}, status)

    def current_user(self):
        with db_lock:
            row = db().execute("SELECT * FROM users WHERE id = ?", (SHARED_USER_ID,)).fetchone()
            if row:
                return row
            created = now_iso()
            db().execute(
                """
                INSERT INTO users (id, name, password_hash, password_salt, color, created_at, last_seen)
                VALUES (?, 'Scheda', '', '', ?, ?, ?)
                """,
                (SHARED_USER_ID, COLORS[0], created, created),
            )
            db().commit()
            return db().execute("SELECT * FROM users WHERE id = ?", (SHARED_USER_ID,)).fetchone()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path.startswith("/api/"):
            self.route_get(path)
            return
        super().do_GET()

    def do_POST(self) -> None:
        self.route_write("POST", urlparse(self.path).path)

    def do_PUT(self) -> None:
        self.route_write("PUT", urlparse(self.path).path)

    def route_get(self, path: str) -> None:
        if path == "/api/me":
            user = self.current_user()
            if not user:
                return self.send_error_json("Non autenticato.", 401)
            return self.send_json({"user": user_public(user)})
        if path == "/api/notes":
            user = self.current_user()
            if not user:
                return self.send_error_json("Non autenticato.", 401)
            with db_lock:
                rows = db().execute(
                    "SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC, updated_at DESC",
                    (user["id"],),
                ).fetchall()
            return self.send_json({"notes": [note_public(r) for r in rows]})
        if path == "/api/history":
            user = self.current_user()
            if not user:
                return self.send_error_json("Non autenticato.", 401)
            return self.send_json(self.build_history(user["id"]))
        if path == "/api/health":
            return self.send_json({"ok": True})
        if path == "/api/community":
            if not self.current_user():
                return self.send_error_json("Non autenticato.", 401)
            return self.handle_community_list()
        return self.send_error_json("Non trovato.", 404)

    def route_write(self, method: str, path: str) -> None:
        body = self.json_body()
        if method == "POST" and path == "/api/sessions/complete":
            return self.handle_complete(body)
        if method == "PUT" and path == "/api/notes":
            return self.handle_upsert_note(body)
        if method == "POST" and path == "/api/community":
            return self.handle_community_post(body)
        if method == "POST" and path == "/api/community/replies":
            return self.handle_community_reply(body)
        return self.send_error_json("Non trovato.", 404)

    def handle_upsert_note(self, body: dict) -> None:
        user = self.current_user()
        if not user:
            return self.send_error_json("Non autenticato.", 401)
        exercise_id = (body.get("exerciseId") or "").strip()
        date = (body.get("date") or "").strip()
        week = (body.get("week") or "w12").strip()
        try:
            day = int(body.get("day") or 0)
        except (TypeError, ValueError):
            day = 0
        text = body.get("text") if body.get("text") is not None else ""
        done = 1 if body.get("done") else 0
        if not exercise_id or not date or day not in (1, 2, 3):
            return self.send_error_json("Dati nota incompleti.")
        updated = now_iso()
        with db_lock:
            existing = db().execute(
                "SELECT * FROM notes WHERE user_id = ? AND exercise_id = ? AND date = ?",
                (user["id"], exercise_id, date),
            ).fetchone()
            if not str(text).strip() and not done:
                if existing:
                    db().execute("DELETE FROM notes WHERE id = ?", (existing["id"],))
                    db().commit()
                return self.send_json({"note": None})
            if existing:
                db().execute(
                    """
                    UPDATE notes SET text = ?, done = ?, day = ?, week = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (str(text), done, day, week, updated, existing["id"]),
                )
                note_id = existing["id"]
            else:
                note_id = str(uuid.uuid4())
                db().execute(
                    """
                    INSERT INTO notes (id, user_id, exercise_id, date, day, week, text, done, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (note_id, user["id"], exercise_id, date, day, week, str(text), done, updated),
                )
            db().commit()
            row = db().execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
        self.send_json({"note": note_public(row)})

    def handle_complete(self, body: dict) -> None:
        user = self.current_user()
        if not user:
            return self.send_error_json("Non autenticato.", 401)
        date = (body.get("date") or "").strip()
        week = (body.get("week") or "w12").strip()
        try:
            day = int(body.get("day") or 0)
        except (TypeError, ValueError):
            day = 0
        if not date or day not in (1, 2, 3):
            return self.send_error_json("Sessione non valida.")
        exercises = body.get("exerciseIds") or []
        if not isinstance(exercises, list) or not exercises:
            return self.send_error_json("Elenco esercizi mancante.")
        completed = now_iso()
        with db_lock:
            for exercise_id in exercises:
                existing = db().execute(
                    "SELECT * FROM notes WHERE user_id = ? AND exercise_id = ? AND date = ?",
                    (user["id"], exercise_id, date),
                ).fetchone()
                if existing:
                    db().execute(
                        "UPDATE notes SET done = 1, day = ?, week = ?, updated_at = ? WHERE id = ?",
                        (day, week, completed, existing["id"]),
                    )
                else:
                    db().execute(
                        """
                        INSERT INTO notes (id, user_id, exercise_id, date, day, week, text, done, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, '', 1, ?)
                        """,
                        (str(uuid.uuid4()), user["id"], exercise_id, date, day, week, completed),
                    )
            db().execute(
                """
                INSERT INTO workout_sessions (id, user_id, date, day, week, completed_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, date, day) DO UPDATE SET week = excluded.week, completed_at = excluded.completed_at
                """,
                (str(uuid.uuid4()), user["id"], date, day, week, completed),
            )
            db().commit()
        self.send_json({"ok": True})

    def build_history(self, user_id: str) -> dict:
        with db_lock:
            notes = db().execute(
                "SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC",
                (user_id,),
            ).fetchall()
            sessions = db().execute(
                "SELECT * FROM workout_sessions WHERE user_id = ?",
                (user_id,),
            ).fetchall()
        grouped = {}
        for n in notes:
            key = f"{n['date']}|{n['day']}"
            grouped.setdefault(key, {"date": n["date"], "day": n["day"], "week": n["week"], "notes": [], "completedAt": None})
            grouped[key]["notes"].append(note_public(n))
        for s in sessions:
            key = f"{s['date']}|{s['day']}"
            grouped.setdefault(key, {"date": s["date"], "day": s["day"], "week": s["week"], "notes": [], "completedAt": None})
            grouped[key]["completedAt"] = s["completed_at"]
        items = sorted(grouped.values(), key=lambda x: (x["date"], x["day"]), reverse=True)
        return {"sessions": items}

    def handle_community_list(self) -> None:
        with db_lock:
            posts = db().execute(
                """
                SELECT p.id, p.user_id, p.text, p.day, p.exercise_id, p.created_at,
                       u.id AS author_id, u.name AS author_name, u.color AS author_color
                FROM community_posts p
                JOIN users u ON u.id = p.user_id
                ORDER BY p.created_at DESC
                LIMIT ?
                """,
                (COMMUNITY_LIMIT,),
            ).fetchall()
            replies = db().execute(
                """
                SELECT r.id, r.post_id, r.text, r.created_at,
                       u.id AS author_id, u.name AS author_name, u.color AS author_color
                FROM community_replies r
                JOIN users u ON u.id = r.user_id
                ORDER BY r.created_at ASC
                """
            ).fetchall()
        by_post: dict[str, list] = {}
        for r in replies:
            by_post.setdefault(r["post_id"], []).append(
                {
                    "id": r["id"],
                    "text": r["text"],
                    "createdAt": r["created_at"],
                    "author": author_public(r),
                }
            )
        payload = [
            {
                "id": p["id"],
                "text": p["text"],
                "day": p["day"],
                "exerciseId": p["exercise_id"],
                "createdAt": p["created_at"],
                "author": author_public(p),
                "replies": by_post.get(p["id"], []),
            }
            for p in posts
        ]
        self.send_json({"posts": payload})

    def handle_community_post(self, body: dict) -> None:
        user = self.current_user()
        if not user:
            return self.send_error_json("Non autenticato.", 401)
        text = (body.get("text") or "").strip()
        if not text:
            return self.send_error_json("Scrivi un consiglio o una domanda.")
        if len(text) > POST_MAX_LEN:
            return self.send_error_json(f"Massimo {POST_MAX_LEN} caratteri.")
        day = parse_optional_day(body.get("day"))
        exercise_id = (body.get("exerciseId") or "").strip() or None
        if exercise_id and exercise_id not in VALID_EXERCISE_IDS:
            return self.send_error_json("Esercizio non valido.")
        post_id = str(uuid.uuid4())
        created = now_iso()
        with db_lock:
            db().execute(
                """
                INSERT INTO community_posts (id, user_id, text, day, exercise_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (post_id, user["id"], text, day, exercise_id, created),
            )
            db().commit()
        self.send_json(
            {
                "post": {
                    "id": post_id,
                    "text": text,
                    "day": day,
                    "exerciseId": exercise_id,
                    "createdAt": created,
                    "author": {"id": user["id"], "name": user["name"], "color": user["color"]},
                    "replies": [],
                }
            },
            201,
        )

    def handle_community_reply(self, body: dict) -> None:
        user = self.current_user()
        if not user:
            return self.send_error_json("Non autenticato.", 401)
        post_id = (body.get("postId") or "").strip()
        text = (body.get("text") or "").strip()
        if not post_id or not text:
            return self.send_error_json("Risposta incompleta.")
        if len(text) > REPLY_MAX_LEN:
            return self.send_error_json(f"Massimo {REPLY_MAX_LEN} caratteri.")
        created = now_iso()
        reply_id = str(uuid.uuid4())
        with db_lock:
            exists = db().execute("SELECT id FROM community_posts WHERE id = ?", (post_id,)).fetchone()
            if not exists:
                return self.send_error_json("Post non trovato.", 404)
            db().execute(
                """
                INSERT INTO community_replies (id, post_id, user_id, text, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (reply_id, post_id, user["id"], text, created),
            )
            db().commit()
        self.send_json(
            {
                "reply": {
                    "id": reply_id,
                    "postId": post_id,
                    "text": text,
                    "createdAt": created,
                    "author": {"id": user["id"], "name": user["name"], "color": user["color"]},
                }
            },
            201,
        )

    def translate_path(self, path: str) -> str:
        result = super().translate_path(path)
        resolved = Path(result).resolve()
        if ROOT not in resolved.parents and resolved != ROOT:
            return str(ROOT / "index.html")
        if resolved.is_file() and resolved.suffix.lower() not in STATIC_OK:
            return str(ROOT / "missing")
        return str(resolved)


def bind_server(preferred: int, port_explicit: bool) -> tuple[ThreadingHTTPServer, int]:
    candidates = [preferred]
    if not port_explicit:
        for extra in (5050, 8000, 4173):
            if extra not in candidates:
                candidates.append(extra)
    last_error: OSError | None = None
    host = "0.0.0.0"
    for port in candidates:
        try:
            server = ThreadingHTTPServer((host, port), Handler)
            return server, port
        except OSError as exc:
            last_error = exc
            print(f"Porta {port} occupata ({exc}).", flush=True)
    raise last_error or OSError("Nessuna porta disponibile")


def main() -> None:
    global CONN
    load_env()
    CONN = connect()
    init_db(CONN)
    port_explicit = "PORT" in os.environ
    preferred = int(os.environ.get("PORT", "5000"))
    try:
        server, port = bind_server(preferred, port_explicit)
    except OSError as exc:
        print(
            "Impossibile avviare il server: tutte le porte tentate sono occupate.\n"
            "Su macOS la porta 5000 è spesso usata da AirPlay Receiver "
            "(Impostazioni → Generali → AirDrop e Handoff).\n"
            "Imposta PORT=5050 nel file .env e riprova.",
            flush=True,
        )
        raise SystemExit(1) from exc
    if port != preferred:
        print(f"PORT={preferred} non disponibile; avvio su {port}.", flush=True)
    print(f"Calisthenics Log → http://127.0.0.1:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)
    finally:
        CONN.close()


if __name__ == "__main__":
    main()
