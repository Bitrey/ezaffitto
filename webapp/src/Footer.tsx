import { useTranslation } from "react-i18next";
import { config } from "./config";
import { Link } from "react-router-dom";
import ColoredLink from "./components/ColoredLink";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="flex p-4 min-h-[6rem] mt-auto bg-gray-100 dark:bg-black items-center justify-center flex-col md:flex-row md:justify-around gap-2">
      <div className="flex flex-col items-center text-gray-500 dark:text-gray-300">
        {/* <div className="flex items-center gap-1">
          <p>{t("footer.madeWithLove")}</p>
          <ColoredLink href={config.bitreyUrl}>Alessandro Amella</ColoredLink>
        </div> */}
        <div className="flex items-center gap-1">
          <p>{t("footer.forInfoAndSuggestions")}: </p>
          <ColoredLink href={"mailto:" + config.infoEmail} external>
            {config.infoEmail}
          </ColoredLink>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        <Link
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          to="/license#tos"
        >
          {t("tos.tos")}
        </Link>
        <span>·</span>
        <Link
          to="/license#cookie"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {t("tos.cookie")}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
