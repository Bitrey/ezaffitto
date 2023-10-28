# EZAFFITTO

Microservice app that uses chatGPT for affitti in Bologna (for now ;) )

NOTA: implementazione temporanea con chiamate HTTP, spostati a RabbitMQ appena puoi.

FAI: trova modo per salvare non rentals.

[OK] FIXA FB SCRAPER CHE A CASO DA _already exists_ SEMPRE

[OK] Bisogna dumpare i cookies di un FB valido dentro `fb-scraper/cookies/cookies.json` per farlo funzionare.

[OK] Fixa FB scraper Protocol Error **target closed**:

[OK] Lo screenshots/ non è importante ma lo crea come root, devi fixare

[OK] Fixa Zappyrent Scraper che non funziona

## Note

-   Ogni scraper type (fb, zappyrent, etc) avrà un nome indicato come `source` e dovrà essere presente nell'array `SCRAPER_TYPES` in `db-api/src/config/index.ts`

-   Usiamo `dumb-init` per i Puppeteer in prod in quanto altrimenti Chrome prenderebbe il PID 1 e non verrebbe killato correttamente, restando un processo zombie.

## DA FARE ON STARTUP

-   Crea cartella `fb-scraper/screenshots/`
-   Crea cartella `fb-scraper/cookies/`
-   Scrivi `fb-scraper/cookies/cookies.json` con i cookies di un FB valido
-   Crea cartella `secrets`
-   `secrets/fb_account_email.secret`
-   `secrets/fb_account_password.secret`
-   `secrets/geolocation_api_key.secret`
-   `secrets/openai_api_key.secret`
-   `secrets/turnstile_secret.secret`
