import { FunctionComponent, useEffect, useState } from "react";
import { RentalPost } from "./interfaces/RentalPost";
import RentView from "./components/RentView";
import axios, { AxiosError } from "axios";
// import { Turnstile } from "@marsidev/react-turnstile";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "./components/Button";

const ByRentId: FunctionComponent<any> = () => {
  const [isLoading, setIsLoading] = useState(true);
  //   const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // TODO debug
  // const [turnstileToken, setTurnstileToken] = useState<string | null>("valid");
  const [turnstileToken] = useState<string | null>("valid");

  const { t } = useTranslation();

  const [post, setPost] = useState<RentalPost | null>(null);

  // route is :id
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/v1/rentalpost/${id}`, {
          params: {
            captcha: turnstileToken
          }
        });
        console.log("Fetched post data", data);
        setPost(data);
      } catch (err) {
        // DEBUG
        console.error((err as AxiosError)?.response?.data || err);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!turnstileToken || post) {
      return;
    }

    fetchPost();
  }, [post, id, turnstileToken]);

  return (
    <div>
      {!turnstileToken && (
        <>debug</>
        // <Turnstile
        //   siteKey="0x4AAAAAAALPWjAvPc2W_e1h"
        //   onSuccess={setTurnstileToken}
        //   onExpire={() => setTurnstileToken(null)}
        // />
      )}
      {post || isLoading ? (
        <div className="p-2 md:p-4">
          <Button className="rounded-lg" href="/">
            {t("rentViewer.backToSearch")}
          </Button>
          <RentView className="mt-4" post={post ?? undefined} />
        </div>
      ) : (
        <div>
          <p className="mb-4">{t("rentViewer.postNotFound")}</p>
        </div>
      )}
    </div>
  );
};

export default ByRentId;
