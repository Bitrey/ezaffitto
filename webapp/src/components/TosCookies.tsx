import { FC, HTMLAttributes } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../misc/getLanguage";

interface TosCookiesAcceptProps extends HTMLAttributes<HTMLDivElement> {
  onAccept: () => void;
}

const TosCookiesAccept: FC<TosCookiesAcceptProps> = ({ onAccept, ...rest }) => {
  const { i18n, t } = useTranslation();

  return (
    <div
      {...rest}
      className="fixed bottom-0 left-0 right-0 bg-gray-600 z-50 text-white flex flex-col p-4 gap-4 justify-center"
    >
      <p>
        {t("tos.using")}{" "}
        <a
          className="text-blue-200 hover:text-blue-300 transition-colors"
          href={`/LICENSE_${getLanguage(i18n.language)}.txt`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("tos.tos")}
        </a>{" "}
        {t("tos.and")}{" "}
        <a
          className="text-blue-200 hover:text-blue-300 transition-colors"
          href={`COOKIES_${getLanguage(i18n.language)}.txt`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("tos.cookie")}
        </a>
        .
      </p>
      {t("tos.note") && (
        <span className="text-gray-100 text-sm">{t("tos.note")}</span>
      )}
      <div className="flex w-full justify-center">
        <Button className="rounded" onClick={onAccept}>
          {t("tos.accept")}
        </Button>
      </div>
    </div>
  );
};

export default TosCookiesAccept;
