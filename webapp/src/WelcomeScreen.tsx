import { FC } from "react";
import { useTranslation } from "react-i18next";
import { ezaffittoCities } from "./interfaces/RentalPost";
import Button from "./components/Button";

interface WelcomeScreenProps {}

const WelcomeScreen: FC<WelcomeScreenProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="p-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-5xl tracking-tighter font-bold">
          {t("welcome.title")}
        </h1>
        <h4 className="text tracking-tight mt-1">{t("welcome.subtitle")}</h4>
      </div>
      <div className="mt-5 flex flex-col gap-1 border rounded p-3 md:p-4 md:pt-3">
        <p className="text-lg">{t("welcome.where")}</p>
        <p className="text-sm text-gray-500 mt-1">{t("welcome.chooseCity")}</p>

        <div className="flex justify-center flex-wrap gap-2">
          {ezaffittoCities.map(e => (
            <Button
              href={`/${e}`}
              key={e}
              className="text-lg mt-2 rounded-full w-max px-3"
            >
              {t(`city.${e}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
