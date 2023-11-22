import { Swiper, SwiperSlide } from "swiper/react";
import Zoom from "react-medium-image-zoom";
import {
  Fragment,
  FunctionComponent,
  HTMLAttributes,
  useEffect,
  useState
} from "react";
import { Autoplay, Navigation, Pagination } from "swiper";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Button from "./Button";
import { RentalPostJSONified } from "../interfaces/RentalPost";
import { getLanguage } from "../misc/getLanguage";
import { config } from "../config";
import { MarkerIcon } from "../misc/MarkerIcon";

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

  const pathname = window.location.pathname;

  useEffect(() => {
    if (!post || pathname === "/") {
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
  }, [i18n.language, pathname, post, t]);

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
                  className="object-contain object-center h-96 max-h-full w-full"
                  src={e}
                  alt={"Post image " + (i + 1)}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/500x500.png?text=" +
                      encodeURIComponent(t("rentViewer.loadingError"));
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
            {post?.url && pathname !== "/" ? (
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
        <p className="text-gray-800 dark:text-gray-200">
          {post?.description?.split("\n").map((e, i) => (
            <Fragment key={i}>
              {e}
              <br />
            </Fragment>
          )) || t("rentViewer.noDescription")}
        </p>

        <div className="mx-2 my-6 grid border grid-cols-2 justify-center items-center">
          {/* any sennò rompe */}
          {config.postDynamicFeatures
            .filter(
              e => post && e in post && post[e as keyof typeof post] !== null
            )
            .map((e, i) => {
              if (
                !post ||
                !(e in post) ||
                typeof post[e as keyof typeof post] === "undefined"
              )
                return false;
              return (
                <Fragment key={e}>
                  <p
                    className={`pl-4 py-1 font-medium tracking-tight ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-600"
                    }`}
                  >
                    {t("rentalPost." + e)}
                  </p>
                  <p
                    className={`pr-4 py-1 ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-600"
                    }`}
                  >
                    {e === "sexRestrictions"
                      ? t("sexRestrictions." + post[e])
                      : e === "occupationalRestrictions"
                      ? t("occupationalRestrictions." + post[e])
                      : typeof post[e as keyof typeof post] === "boolean"
                      ? post[e as keyof typeof post]
                        ? "✅"
                        : "❌"
                      : [
                          "availabilityStartDate",
                          "availabilityEndDate"
                        ].includes(e)
                      ? format(
                          new Date(post[e as keyof typeof post]),
                          "E d MMM yyyy",
                          {
                            locale:
                              getLanguage(i18n.language) === "it" ? it : enUS
                          }
                        )
                      : e === "rentalType"
                      ? t("rentalType." + post[e as keyof typeof post])
                      : e === "monthlyPrice"
                      ? "€" + post[e as keyof typeof post]
                      : post[e as keyof typeof post]?.toString()}
                  </p>
                </Fragment>
              );
            })}
        </div>

        {post?.latitude && post?.longitude && (
          <div className="my-6 flex flex-col items-center justify-center w-full select-none">
            <h3 className="mb-2 text-lg font-medium">
              {t("map.approxPosition")}
            </h3>
            <MapContainer
              style={{
                height: "50vh",
                width: "70vw",
                maxWidth: "90%",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)"
              }}
              center={[post.latitude, post.longitude]}
              zoom={14}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                icon={MarkerIcon({ title: post.address })}
                position={[post.latitude, post.longitude]}
              >
                <Popup>
                  {post.address || `${post.latitude},${post.longitude}`}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {post && (
          <div className="mt-4 flex justify-center">
            {/* if we are at /, show <Link>, else button */}
            {pathname === "/" ? (
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
