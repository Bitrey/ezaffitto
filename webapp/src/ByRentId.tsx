import { FunctionComponent, useEffect, useState } from "react";
import ReactGA from "react-ga4";
import axios, { AxiosError } from "axios";
import { Turnstile } from "@marsidev/react-turnstile";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RentView from "./components/RentView";
import Button from "./components/Button";
import { RentalPostJSONified } from "./interfaces/RentalPost";
import { config, gaEvents } from "./config";

const ByRentId: FunctionComponent<any> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const { i18n, t } = useTranslation();

  const [post, setPost] = useState<RentalPostJSONified | undefined>(undefined);

  // route is :id
  const { id } = useParams<{ id: string }>();

  const { state } = useLocation();

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      try {
        const { data } = (await axios.get(`/api/v1/rentalpost/${id}`, {
          params: {
            captcha: turnstileToken
          }
        })) as { data: RentalPostJSONified | null };

        ReactGA.event(
          gaEvents.findOnePost,
          data
            ? {
                address: data.address,
                date: data.date,
                price: data.monthlyPrice,
                source: data.source
              }
            : undefined
        );

        console.log("Fetched post data", data);
        setPost(data || undefined);
      } catch (err) {
        // DEBUG
        console.error((err as AxiosError)?.response?.data || err);
        setPost(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    if (state?.post) {
      setPost(JSON.parse(state.post));
      return;
    }
    if (!turnstileToken || post) {
      return;
    }

    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnstileToken]);

  return (
    <div>
      {!turnstileToken && !state?.post && (
        <Turnstile
          siteKey={config.turnstileSiteKey}
          onError={() => window.alert(t("turnstile.error"))}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          options={{
            action: "fetch-rentalpost",
            language: i18n.language
          }}
        />
      )}
      {post || isLoading ? (
        <div className="p-2 md:p-4">
          <Button className="rounded-lg" href="/">
            {t("rentViewer.backToSearch")}
          </Button>
          <RentView className="mt-4" post={post} />
        </div>
      ) : (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("common.error")}</strong>
          <span className="block">{t("rentViewer.postNotFound")}</span>{" "}
          <Link to="/" className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>{t("common.close")}</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ByRentId;
