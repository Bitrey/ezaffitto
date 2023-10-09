#!/bin/bash

# Array contenente le directory in cui eseguire npm install
node_dirs=(
  "./bakeca-scraper/"
  "./db-api/"
  "./fb-scraper/"
  "./parser/"
  "./webapp/"
)
bun_dirs=(
  "./subito-scraper/"
  "./zappyrent-scraper/"
)

# Funzione per eseguire npm install in background
function run_npm_install() {
  local directory=$1
  (cd "$directory" && npm install) &
}

function run_bun_install() {
  local directory=$1
  (cd "$directory" && bun install) &
}

# Itera sulle directory e avvia npm install in background per ciascuna
for dir in "${node_dirs[@]}"; do
  run_npm_install "$dir"
done

for dir in "${bun_dirs[@]}"; do
  run_bun_install "$dir"
done

# Attende il completamento di tutti i processi in background
wait

echo "Tutti i comandi npm install e bun install sono stati completati."
