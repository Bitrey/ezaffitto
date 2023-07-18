FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --omit=dev
RUN npm install

COPY . .

EXPOSE 3434
CMD [ "npm", "run", "dev" ]