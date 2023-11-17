#!/bin/sh

# Controlla se il parametro <id> è stato passato
if [ $# -eq 1 ]; then
    # Assegna il parametro a una variabile
    id=$1
    # Fai una chiamata GET con wget e salva l'output in una variabile
    output=$(wget -qO- http://localhost:5500/api/v1/rentalpost/setnotrental/$id)
    # Controlla lo status code della chiamata
    status=$(echo $?)
    # Se lo status code è 0, significa che la chiamata ha avuto successo
    if [ $status -eq 0 ]; then
        # Stampa un messaggio di successo e l'output della chiamata
        echo "La chiamata ha avuto successo (status code OK)"
        echo "$output"
    else
        # Altrimenti, stampa un messaggio di errore e lo status code
        echo "La chiamata ha fallito (status code $status)"
    fi
else
    # Stampa un messaggio di errore
    echo "Devi passare un parametro <id>"
fi
