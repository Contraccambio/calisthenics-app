# Calisthenics Log

Scheda a 3 giorni con note per esercizio. Il link apre direttamente la scheda. I dati stanno sul server (SQLite).

## Avvio

Serve solo Python 3. Dalla cartella dell’app:

```bash
cp .env.example .env   # opzionale
python3 server.py
```

Poi apri l’URL stampato dal server (di solito http://127.0.0.1:5000).

Se la porta 5000 è occupata (su macOS spesso da AirPlay Receiver), il server passa da solo a 5050 / 8000 / 4173. Puoi anche impostare `PORT=5050` nel `.env`.

## Mettere online (Render)

1. Carica il progetto su GitHub (`git push`).
2. Su [Render](https://render.com), **New → Web Service** e collega il repository.
3. Dopo il deploy apri l’URL pubblico, ad esempio `https://calisthenics-app.onrender.com`.
4. Condividi quel link con il gruppo così tutti usano la stessa app online.

## Cosa fa il backend

- Note e sessioni in SQLite (`data/app.db`), senza account
