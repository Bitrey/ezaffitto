import { FunctionComponent, useCallback, useEffect, useState } from "react";
import ReactGA from "react-ga4";
import axios, { AxiosError } from "axios";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RentView from "./components/RentView";
import Button from "./components/Button";
import { RentalPostJSONified } from "./interfaces/RentalPost";
import { gaEvents } from "./config";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import ErrorDialog from "./components/ErrorDialog";
import Container from "./components/Container";

const ByRentId: FunctionComponent<any> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    const token = await executeRecaptcha(gaEvents.findPosts.action);
    setCaptchaToken(token);
  }, [executeRecaptcha]);

  const [post, setPost] = useState<RentalPostJSONified | undefined>(undefined);

  // route is :id
  const { id } = useParams<{ id: string }>();

  const { state } = useLocation();

  useEffect(() => {
    if (state?.post) {
      setPost(JSON.parse(state.post));
      return;
    } else if (!executeRecaptcha) {
      return;
    }

    handleReCaptchaVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeRecaptcha]);

  useEffect(() => {
    if (!captchaToken) return;

    async function fetchPost() {
      setIsLoading(true);
      try {
        const { data } = (await axios.get(`/api/v1/rentalpost/${id}`, {
          params: {
            captcha: captchaToken
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
        setError(null);
        setPost(data || undefined);
      } catch (err) {
        // DEBUG
        const errorStr = (err as AxiosError)?.response?.data as
          | { err: string }
          | undefined;
        console.error(errorStr || err);
        // window.alert(errorStr?.err ? t(errorStr.err) : t("common.error"));
        setError(errorStr?.err || "common.error");
        setPost(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaToken]);

  return (
    <Container>
      {post || isLoading ? (
        <div className="p-2 md:p-4">
          <Button
            className="rounded-lg"
            href={state.prevPath || "/"}
            state={
              state.posts
                ? { posts: state.posts, selected: state.selected }
                : undefined
            }
          >
            {t("rentViewer.backToSearch")}
          </Button>
          <RentView className="mt-4" post={post} />
        </div>
      ) : (
        <ErrorDialog
          title={error && t(error)}
          error={t("rentViewer.postNotFound")}
          navigateToOnClose="/"
        />
      )}
    </Container>
  );
};

export default ByRentId;
