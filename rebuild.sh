docker compose -f docker-compose-prod.yml down && docker system prune -f && docker compose -f docker-compose-prod.yml up --build --remove-orphans -d

