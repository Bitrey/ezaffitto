# EZAFFITTO

Microservice app that uses chatGPT for affitti in Bologna (for now ;) )

NOTA: implementazione temporanea con chiamate HTTP, spostati a RabbitMQ appena puoi.

FAI: trova modo per salvare non rentals.

[OK] FIXA FB SCRAPER CHE A CASO DA _already exists_ SEMPRE

[OK] Bisogna dumpare i cookies di un FB valido dentro `fb-scraper/cookies/cookies.json` per farlo funzionare.

[OK] Fixa FB scraper Protocol Error **target closed**:

Fixa Zappyrent Scraper che non funziona

```
n anticipo\",\n \"createdAt\": \"2023-10-20T18:42:59.521Z\",\n \"updatedAt\": \"2023-10-20T18:42:59.521Z\",\n \"\_\_v\": 0\n}","metadata":{},"timestamp":"2023-10-20 18:49:08"}
2023-10-20 20:49:11 {"label":"index.ts","level":"\u001b[34mdebug\u001b[39m","message":"Closing browser for groupUrl https://www.facebook.com/groups/488856121488809/?locale=it_IT - startDate: 18:48:35 - endDate: 18:49:10 - elapsed: 36.075s/35.021s","metadata":{},"timestamp":"2023-10-20 18:49:11"}
2023-10-20 20:49:11 [nodemon] app crashed - waiting for file changes before starting...
2023-10-20 20:49:11 /usr/src/app/node_modules/puppeteer-core/src/cdp/Connection.ts:189
2023-10-20 20:49:11 this.\_reject(callback, new TargetCloseError('Target closed'));
2023-10-20 20:49:11 ^
2023-10-20 20:49:11 TargetCloseError: Protocol error (Network.getResponseBody): Target closed
2023-10-20 20:49:11 at CallbackRegistry.clear (/usr/src/app/node_modules/puppeteer-core/src/cdp/Connection.ts:189:30)
2023-10-20 20:49:11 at CdpCDPSession.\_onClosed (/usr/src/app/node_modules/puppeteer-core/src/cdp/CDPSession.ts:147:21)
2023-10-20 20:49:11 at Connection.onMessage (/usr/src/app/node_modules/puppeteer-core/src/cdp/Connection.ts:328:17)
2023-10-20 20:49:11 at WebSocket.<anonymous> (/usr/src/app/node_modules/puppeteer-core/src/node/NodeWebSocketTransport.ts:55:24)
2023-10-20 20:49:11 at callListener (/usr/src/app/node_modules/ws/lib/event-target.js:290:14)
2023-10-20 20:49:11 at WebSocket.onMessage (/usr/src/app/node_modules/ws/lib/event-target.js:209:9)
2023-10-20 20:49:11 at WebSocket.emit (node:events:517:28)
2023-10-20 20:49:11 at WebSocket.emit (node:domain:489:12)
2023-10-20 20:49:11 at Receiver.receiverOnMessage (/usr/src/app/node_modules/ws/lib/websocket.js:1192:20)
2023-10-20 20:49:11 at Receiver.emit (node:events:517:28) {
2023-10-20 20:49:11 cause: ProtocolError
2023-10-20 20:49:11 at Callback.<instance_members_initializer> (/usr/src/app/node_modules/puppeteer-core/src/cdp/Connection.ts:62:12)
```
