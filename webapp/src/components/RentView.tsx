import { Swiper, SwiperSlide } from "swiper/react";
import Zoom from "react-medium-image-zoom";
import { FunctionComponent, HTMLAttributes, useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import Button from "./Button";
import { RentalPostJSONified } from "../interfaces/RentalPost";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../misc/getLanguage";

interface RentViewProps extends HTMLAttributes<HTMLDivElement> {
  post?: RentalPostJSONified;
}

const RentView: FunctionComponent<RentViewProps> = ({
  post,
  className,
  ...rest
}) => {
  const { t, i18n } = useTranslation();

  const [images, setImages] = useState<string[] | null>(null);

  async function imageExists(imageUrl: string) {
    // try {
    //   await axios.head(imageUrl, {
    //     headers: {
    //       Accept: "image/webp,image/apng,image/*,*/*;q=0.8"
    //     }
    //   });
    // DA SEMPRE ERRORE!!!!
    return true;
    // } catch (err) {
    //   console.log((err as AxiosError)?.response?.data || err);
    //   return false;
    // }
  }

  useEffect(() => {
    if (!post || !Array.isArray(post?.images)) return;

    const filterImages = async () => {
      const existingImages: string[] = [];
      for (const img of post.images) {
        const exists = await imageExists(img);
        if (exists) existingImages.push(img);
      }
      setImages(existingImages);
    };
    filterImages();
  }, [post]);

  useEffect(() => {
    if (!post || window.location.pathname === "/") {
      window.document.title = `${t("common.appName")}`;
    } else {
      window.document.title = `${
        post.description
          ? post.description.slice(0, 30) + "..."
          : `${t(`rentalType.${post.rentalType}`)} ${
              post.address ||
              (post.date &&
                format(post.date, "E d MMM yyyy HH:mm", {
                  locale: getLanguage(i18n.language) === "it" ? it : enUS
                }))
            }`
      } - ${t("common.appNameShort")}`;
    }
  }, [i18n.language, post, t]);

  return (
    <div
      className={`dark:text-white dark:bg-gray-800 sticky top-0 ${
        className || ""
      }`}
      {...rest}
    >
      {images ? (
        <Swiper
          navigation
          pagination
          modules={[Navigation, Autoplay, Pagination]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false
          }}
        >
          {images.map((e, i) => (
            <SwiperSlide key={e}>
              <Zoom>
                <img
                  loading="lazy"
                  className="object-contain object-center h-96 max-h-full select-none w-full"
                  src={e}
                  alt={"Post image " + (i + 1)}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/500x500.png?text=" +
                      encodeURIComponent(t("rentViewer.imageError"));
                  }}
                />
              </Zoom>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="bg-gray-100 w-full min-w-[16rem] h-16 mx-auto animate-pulse"></p>

        // <p>bg-gray-100 w-full min-w-[16rem] h-16 mx-auto animate-pulsericamento...</p>
      )}

      <div className="p-2">
        <div className="mt-4 mb-8 grid grid-cols-1 md:grid-cols-3">
          <div>
            {post?.rentalType && (
              <p className="font-semibold tracking-tighter">
                {t(`rentalType.${post.rentalType}`)}
              </p>
            )}

            <p className="text-lg">
              {typeof post?.monthlyPrice === "number" ? (
                <span>€{post.monthlyPrice}</span>
              ) : (
                <span className="font-light">~</span>
              )}{" "}
              <span className="font-light">{t("rentViewer.perMonth")}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              {post?.date &&
                format(new Date(post.date), "'📅' E d MMM yyyy HH:mm", {
                  locale: getLanguage(i18n.language) === "it" ? it : enUS
                })}
            </p>
            {post?.address && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                📍 {post?.address}
              </p>
            )}
          </div>
          <div>
            {/* print post?.source */}
            {post && <span>🌐</span>}{" "}
            {post?.url && window.location.pathname !== "/" ? (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
              >
                {new URL(post.url).hostname}
              </a>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 hover:text-gray-800 transition-colors">
                {post?.url ? new URL(post.url).hostname : post?.source}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-800 dark:text-gray-200">{post?.description}</p>
        {post && (
          <div className="mt-4 flex justify-center">
            {/* if we are at /, show <Link>, else button */}
            {window.location.pathname === "/" ? (
              <Button
                className="p-3 rounded-full font-medium tracking-tight"
                href={`/post/${post._id}`}
              >
                {t("common.contact")}{" "}
                <span className="font-bold">
                  {" "}
                  {t("common.on")}
                  <span className="capitalize"> {post.source}</span>
                </span>
              </Button>
            ) : (
              <Button
                href={post.url || "#"}
                className="p-3 rounded-full font-medium tracking-tight"
              >
                <span>🔗 | </span>
                {t("common.contact")}{" "}
                <span className="font-bold">
                  {t("common.on")}
                  <span className="capitalize"> {post.source}</span>
                </span>
              </Button>
            )}
          </div>
        )}
        {/* <h1>debug</h1>
          <pre>
            <code>{JSON.stringify(post, null, 4)}</code>
          </pre> */}
      </div>
    </div>
  );
};

export default RentView;
