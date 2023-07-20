docker run -p 27018:27017 -v ezaffitto_db-data:/data/db $(docker image ls | grep mongo | head -n1 | awk '{print $3}')
