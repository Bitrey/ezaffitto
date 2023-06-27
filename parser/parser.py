import asyncio, json, sys
from EdgeGPT.EdgeGPT import Chatbot, ConversationStyle

cookies = json.loads(
    open("./cookies/bing_cookies_mariosassos.json", encoding="utf-8").read())


async def main():
    bot = await Chatbot.create(cookies=cookies)
    response = await bot.ask(prompt=sys.argv[1],
                             conversation_style=ConversationStyle.creative,
                             simplify_response=True)
    print(json.dumps(response, indent=2))
    await bot.close()


if __name__ == "__main__":
    asyncio.run(main())
