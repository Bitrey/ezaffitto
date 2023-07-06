FROM nikolaik/python-nodejs:python3.11-nodejs18-alpine

WORKDIR /usr/src/app

ADD ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt --root-user-action=ignore

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --omit=dev
RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "dev" ]