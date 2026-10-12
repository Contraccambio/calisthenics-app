# Calisthenics Log

Scheda a 3 giorni con note per esercizio. Gli atleti si registrano con nome e password. I dati stanno sul server (SQLite).

## Avvio

Serve solo Python 3. Dalla cartella dell’app:

```bash
cp .env.example .env   # opzionale; default admin: cali-admin
python3 server.py
```

Poi apri gli URL stampati dal server (di solito):

- App: http://127.0.0.1:5000
- Admin: http://127.0.0.1:5000/admin

Se la porta 5000 è occupata (su macOS spesso da AirPlay Receiver), il server passa da solo a 5050 / 8000 / 4173. Puoi anche impostare `PORT=5050` nel `.env`.

Password admin: valore di `ADMIN_PASSWORD` nel file `.env` (default `cali-admin`).

## Mettere online (Render)

1. Carica il progetto su GitHub (`git push`).
2. Su [Render](https://render.com), **New → Web Service** e collega il repository.
3. Nelle variabili d’ambiente imposta `ADMIN_PASSWORD` (Render può generarla automaticamente se usi `render.yaml` con `generateValue: true`).
4. Dopo il deploy apri l’URL pubblico, ad esempio `https://calisthenics-app.onrender.com`.
5. Condividi quel link con il gruppo così tutti usano la stessa app online.

## Cosa fa il backend

- `POST /api/register` e `POST /api/login` — password in hash PBKDF2, sessione in cookie
- Note e sessioni per utente in SQLite (`data/app.db`)
- `/admin` — quanti utenti, chi sono, ultima attività, conteggio note/sessioni
