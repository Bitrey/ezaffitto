#!/bin/bash

# Array contenente le directory in cui eseguire npm install
directories=(
  "./db-api/"
  "./db-consumer/"
  "./telegram-bot/"
  "./parser/"
  "./webapp/"
)

# Funzione per eseguire npm install in background
function run_npm_install() {
  local directory=$1
  (cd "$directory" && npm install) &
}

# Itera sulle directory e avvia npm install in background per ciascuna
for dir in "${directories[@]}"; do
  run_npm_install "$dir"
done

# Attende il completamento di tutti i processi in background
wait

echo "Tutti i comandi npm install sono stati completati."
