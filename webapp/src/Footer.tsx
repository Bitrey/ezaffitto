import { useTranslation } from "react-i18next";
import { getLanguage } from "./misc/getLanguage";

const Footer = () => {
  const { i18n, t } = useTranslation();

  return (
    <footer className="flex p-4 min-h-[6rem] mt-auto bg-gray-100 dark:bg-black items-center justify-center flex-col md:flex-row md:justify-around gap-2">
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-300">
        <p>{t("footer.madeWithLove")}</p>
        <a
          className="flex items-center text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors"
          href="https://www.bitrey.it/"
          target="_blank"
          rel="noreferrer"
        >
          Alessandro Amella
        </a>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        <a
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          href={`/LICENSE_${getLanguage(i18n.language)}.txt`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("tos.tos")}
        </a>
        <span>·</span>
        <a
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          href={`COOKIES_${getLanguage(i18n.language)}.txt`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("tos.cookie")}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
