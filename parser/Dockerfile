FROM nikolaik/python-nodejs:python3.11-nodejs18-alpine

RUN apk update
RUN apk add proxychains-ng
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


# PROXYCHAINS does not resolve DNS
# so we have to resolve it ourselves
RUN apk add bind-tools
COPY ./tor_proxy/proxychains.conf /etc/proxychains/proxychains.conf

ENTRYPOINT [ "sh", "./start.sh" ]
