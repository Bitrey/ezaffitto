import asyncio, json, sys, os, logging

from revChatGPT.V1 import Chatbot
from fp.fp import FreeProxy

chatbot = Chatbot(config={
    "access_token": os.environ['OPENAI_ACCESS_TOKEN'],
    "proxy": FreeProxy().get()
})


def main():
    prompt = sys.argv[1]
    response = ""
    for data in chatbot.ask(prompt):
        response = data["message"]
    print(response)


if __name__ == "__main__":
    main()