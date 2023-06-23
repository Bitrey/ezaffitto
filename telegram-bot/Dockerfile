FROM nikolaik/python-nodejs:python3.11-nodejs18-alpine

# Creare una directory di lavoro
WORKDIR /usr/src/app

# Copiare package.json e package-lock.json nella directory di lavoro
COPY package*.json ./

# Installare le dipendenze
RUN npm install

# Copiare il codice sorgente nella directory di lavoro
COPY . .

# Avviare l'applicazione
CMD [ "npm", "run", "dev" ]
