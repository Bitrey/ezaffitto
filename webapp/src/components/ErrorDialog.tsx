import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ErrorDialogProps {
  title?: string | null;
  error: string;
  onClose?: () => void;
  navigateToOnClose?: string;
}

const CloseIcon = () => {
  const { t } = useTranslation();

  return (
    <svg
      className="fill-current h-6 w-6 text-red-500"
      role="button"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
    >
      <title>{t("common.close")}</title>
      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
    </svg>
  );
};

const ErrorDialog: FC<ErrorDialogProps> = ({
  title,
  error,
  onClose,
  navigateToOnClose
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <p>
        <span className="font-bold">{t("common.error")}</span>
        {title && <span className="ml-1">({t(title)})</span>}
      </p>
      <span className="block">{error}</span>{" "}
      {navigateToOnClose ? (
        <Link to="/" className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <CloseIcon />
        </Link>
      ) : (
        <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default ErrorDialog;
