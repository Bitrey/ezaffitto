FROM python:3.8-alpine

WORKDIR /usr/src/app

RUN apk add -u gcc musl-dev

COPY requirements.txt ./

RUN pip3 install --root-user-action=ignore --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "-u" ,"./main.py" ]
