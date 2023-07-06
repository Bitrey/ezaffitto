import asyncio, json, sys, os, logging
from EdgeGPT.EdgeGPT import Chatbot, ConversationStyle
from fp.fp import FreeProxy

logging.basicConfig(filename='logs/edgegpt.log',
                    level=logging.INFO,
                    format='%(asctime)s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S')

cookies = json.loads(
    open(os.environ['COOKIES_JSON_PATH'], encoding="utf-8").read())


async def main():
    try:
        proxy = FreeProxy().get()
        bot = await Chatbot.create(cookies=cookies, proxy=proxy)
    except Exception as e:
        logging.error(f"Failed to fetch proxy: {str(e)}")
        bot = await Chatbot.create(cookies=cookies)

    prompt = sys.argv[1]

    logging.info(f'Proxy: {proxy}, Prompt: {prompt}')

    response = await bot.ask(prompt=prompt,
                             conversation_style=ConversationStyle.creative,
                             simplify_response=True)
    print(json.dumps(response, indent=2))
    await bot.close()


if __name__ == "__main__":
    asyncio.run(main())
