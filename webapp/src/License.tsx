import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./components/Button";
import axios, { isAxiosError } from "axios";
import ErrorDialog from "./components/ErrorDialog";
import { getLanguage } from "./misc/getLanguage";

interface SectionProps {
  id: string;
  title: string;
  loading: boolean;
  content: string | null;
}
const Section: FC<SectionProps> = ({ content, id, loading, title }) => {
  const { t } = useTranslation();

  return (
    <section
      id={id}
      className="my-8 flex flex-col gap-1 border rounded py-2 px-3 md:py-3 md:px-4"
    >
      <h2 className="-mt-7 bg-white dark:bg-gray-800 w-fit px-2 z-50 text-lg font-medium tracking-tighter">
        {title}
      </h2>
      {loading ? (
        <p className="rounded bg-gray-100 dark:bg-gray-600 text-center p-2 dark:text-white flex justify-center items-center w-full min-w-[16rem] h-16 mx-auto animate-pulse">
          {t("common.loading")}
        </p>
      ) : (
        <p className="text-gray-500 font-light text-sm">
          {content?.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      )}
    </section>
  );
};

interface LicenseProps {}

const License: FC<LicenseProps> = () => {
  const { t, i18n } = useTranslation();

  const [license, setLicense] = useState<string | null>(null);
  const [licenseLoading, setLicenseLoading] = useState<boolean>(false);

  const [cookiePolicy, setCookiePolicy] = useState<string | null>(null);
  const [cookiePolicyLoading, setCookiePolicyLoading] =
    useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLicense() {
      setLicenseLoading(true);
      try {
        const { data } = await axios.get(
          `/LICENSE_${getLanguage(i18n.language)}.txt`
        );
        setLicense(data);
      } catch (err) {
        setError(
          isAxiosError(err)
            ? err.response?.data?.err || err.message
            : (err as Error).message
        );
      } finally {
        setLicenseLoading(false);
      }
    }

    async function fetchCookiePolicy() {
      setCookiePolicyLoading(true);
      try {
        const { data } = await axios.get(
          `/COOKIES_${getLanguage(i18n.language)}.txt`
        );
        setCookiePolicy(data);
      } catch (err) {
        setError(
          isAxiosError(err)
            ? err.response?.data?.err || err.message
            : (err as Error).message
        );
      } finally {
        setCookiePolicyLoading(false);
      }
    }

    fetchLicense();
    fetchCookiePolicy();
  }, [i18n.language]);

  useEffect(() => {
    if (!window.location.hash || licenseLoading || cookiePolicyLoading) return;
    if (["#tos", "#cookie"].includes(window.location.hash)) {
      const elem = document.getElementById(window.location.hash.slice(1));
      if (elem) {
        elem.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
      }
    }
  }, [cookiePolicyLoading, licenseLoading]);

  return (
    <div className="p-3">
      <h1 className="text-xl font-medium tracking-tighter">{t("tos.title")}</h1>
      <p className="text-gray-500 font-light text-sm">{t("tos.note")}</p>

      {i18n.language !== "it" && (
        <div className="flex justify-center my-2">
          <Button
            className="rounded-lg mt-3"
            onClick={() => i18n.changeLanguage("it")}
          >
            {t("tos.changeToItalian")}
          </Button>
        </div>
      )}

      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}

      <Section
        id="tos"
        title={t("tos.tos")}
        loading={licenseLoading}
        content={license}
      />
      <Section
        id="cookie"
        title={t("tos.cookie")}
        loading={cookiePolicyLoading}
        content={cookiePolicy}
      />
    </div>
  );
};

export default License;
