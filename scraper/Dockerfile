# scraper/Dockerfile

# Utilizzare l'immagine ufficiale di Python
FROM python:3.8-alpine

# Impostare una directory di lavoro
WORKDIR /usr/src/app

# Copiare requirements.txt nella directory di lavoro
COPY requirements.txt ./

# Installare le dipendenze
RUN pip install --no-cache-dir -r requirements.txt

# Copiare il codice sorgente nella directory di lavoro
COPY . .

# Avviare l'applicazione
CMD [ "python", "./main.py" ]
