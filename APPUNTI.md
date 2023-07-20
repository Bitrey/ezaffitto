DA FARE (19/07/2023): MAPPA RAW DATA A PARSED E SALVA SU DB

Aggiungi healthcheck al bot

`scraper` butta fuori un JSON con:
"postId": string
"rawMessage": string
"scraperRawData": object

arriva a `parser`, lo prende e butta fuori un JSON con:
"postId": string
"post": <campo JSON col post>

=====================================================

Per 3 visite 30 eur  
Notifiche 10 eur  
Escalation

Cambia struttura parsing post affitto:

-   ✅ Aggiungi "address" (via, civico, città)
-   ✅ Aggiungi "floor" (piano)
-   ✅ Aggiungi "rooms" (numero di stanze)
-   ✅ Aggiungi "bathrooms" (numero di bagni)
-   ✅ Aggiungi "areaSqMeters" (metri quadri)
-   ✅ Aggiungi "priceIncludesTaxes" (se il prezzo include le tasse e spese condominiali)
-   ✅ Cambia "contractDuration" in "contractDurationMonths" (durata del contratto in mesi)
-   ✅ Rimuovi "internetIncluded"
-   ✅ Aggiungi "securityDepositMonths" (numero di mensilità di cauzione / caparra)
    Casi da gestire:
-   ✅ Post che contengono più di una struttura (si affittano n stanze...)
    Per struttura su DB:
-   Aggiungi "link" (link all'annuncio)
-   Aggiungi "source" (nome del sito da cui è stato preso l'annuncio)
-   Aggiungi "contactUrl" (link per contattare il proprietario)
-   Aggiungi "images" (lista di immagini dell'annuncio)
