# EZAFFITTO

Microservice app that uses chatGPT for affitti in Bologna (for now ;) )

NOTA: implementazione temporanea con chiamate HTTP, spostati a RabbitMQ appena puoi.

FAI: trova modo per salvare non rentals.

[OK] FIXA FB SCRAPER CHE A CASO DA _already exists_ SEMPRE

[OK] Bisogna dumpare i cookies di un FB valido dentro `fb-scraper/cookies/cookies.json` per farlo funzionare.

[OK] Fixa FB scraper Protocol Error **target closed**:

[OK] Lo screenshots/ non è importante ma lo crea come root, devi fixare

[OK] Fixa Zappyrent Scraper che non funziona

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
