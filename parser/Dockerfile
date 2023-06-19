# parser/Dockerfile

# Utilizzare l'immagine ufficiale di Node.js
FROM node:18-alpine

# Creare una directory di lavoro
WORKDIR /usr/src/app

# Copiare package.json e package-lock.json nella directory di lavoro
COPY package*.json ./

# Installare le dipendenze
RUN npm install

# Copiare il codice sorgente nella directory di lavoro
COPY . .

# Esposizione della porta su cui l'applicazione sarà in ascolto
EXPOSE 3000

# Avviare l'applicazione
CMD [ "node", "index.js" ]
