FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --omit=dev
RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]