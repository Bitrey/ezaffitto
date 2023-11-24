import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ezaffittoCities } from "./interfaces/RentalPost";
import Button from "./components/Button";
import { config } from "./config";
import Container from "./components/Container";
import ColoredLink from "./components/ColoredLink";

interface WelcomeScreenProps {}

const WelcomeScreen: FC<WelcomeScreenProps> = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.document.title = t("common.appName");
  }, [t]);

  return (
    <Container className="p-3 mt-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-5xl tracking-tighter font-bold">
          {t("welcome.title")}
        </h1>
        <h4 className="text tracking-tight mt-1">{t("welcome.subtitle")}</h4>
      </div>
      <div className="mt-10 md:mt-6 flex flex-col gap-1 border rounded p-3 md:p-4 md:pt-3">
        <p className="text-lg">{t("welcome.where")}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("welcome.chooseCity")}
        </p>

        <div className="flex justify-center flex-wrap gap-2">
          {ezaffittoCities.map(e =>
            config.enabledCities.includes(e) ? (
              <Button
                href={`/${e}`}
                key={e}
                className="text-lg mt-2 rounded-full w-fit px-3"
                title={t("welcome.rentsIn", { city: t(`city.${e}`) })}
              >
                {t(`city.${e}`)}
              </Button>
            ) : (
              <Button
                key={e}
                className="text-lg mt-2 rounded-full w-fit px-3 opacity-50 cursor-wait"
                disabled
                title={t("welcome.cityNotYetAvailable", {
                  city: t(`city.${e}`)
                })}
              >
                {t(`city.${e}`)}
              </Button>
            )
          )}
        </div>
      </div>
      <p className="mt-10 text-gray-500 dark:text-gray-300">
        {t("welcome.aProjectBy")}{" "}
        <ColoredLink href={config.bitreyUrl} external>
          Alessandro Amella
        </ColoredLink>
        , {t("welcome.togetherWith")}{" "}
        <ColoredLink href={config.maxUrl} external>
          Maxim Ozolin
        </ColoredLink>
        .
      </p>
    </Container>
  );
};

export default WelcomeScreen;
