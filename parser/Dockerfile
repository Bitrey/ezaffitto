FROM nikolaik/python-nodejs:python3.11-nodejs18-alpine

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

# Installa modulo EdgeGPT per Python
# in prod aggiungi parametro --upgrade in modo da usare l'ultima versione
RUN python3 -m pip install EdgeGPT --root-user-action=ignore

# Avviare l'applicazione
CMD [ "npm", "run", "dev" ]
