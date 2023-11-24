import { FC, HTMLAttributes } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface TosCookiesAcceptProps extends HTMLAttributes<HTMLDivElement> {
  onAccept: () => void;
}

const TosCookiesAccept: FC<TosCookiesAcceptProps> = ({ onAccept, ...rest }) => {
  const { t } = useTranslation();

  return (
    <div
      {...rest}
      className="fixed bottom-0 left-0 right-0 bg-gray-600 z-50 text-white flex flex-col p-4 gap-4 justify-center"
    >
      <p>
        {t("tos.using")}{" "}
        <Link
          className="text-blue-200 hover:text-blue-300 transition-colors"
          to="/license#tos"
        >
          {t("tos.tos")}
        </Link>{" "}
        {t("tos.and")}{" "}
        <Link
          className="text-blue-200 hover:text-blue-300 transition-colors"
          to="/license#cookie"
        >
          {t("tos.cookie")}
        </Link>
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
