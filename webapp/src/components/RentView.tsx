import { Swiper, SwiperSlide } from "swiper/react";
import Zoom from "react-medium-image-zoom";
import React, { FunctionComponent, HTMLAttributes, useEffect } from "react";
import { Autoplay, Navigation, Pagination } from "swiper";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import Button from "./Button";
import { RentalPost } from "../interfaces/RentalPost";
import { useTranslation } from "react-i18next";

interface RentViewProps extends HTMLAttributes<HTMLDivElement> {
  post?: RentalPost;
}

const RentView: FunctionComponent<RentViewProps> = ({
  post,
  className,
  ...rest
}) => {
  const { t, i18n } = useTranslation();

  async function imageExists(imageUrl: string) {
    try {
      // const { data } = await axios.head(imageUrl);
      // console.log({ data });
      await axios.head(imageUrl);
      return true;
    } catch (err) {
      console.log((err as AxiosError)?.response?.data || err);
      return false;
    }
  }

  const [images, setImages] = React.useState<string[] | null>(null);

  const jsonImages = post && JSON.stringify(post.images);

  useEffect(() => {
    setImages(null);
    async function filterImages() {
      if (!post) return;

      const existingImages: string[] = [];
      for (const img of post.images) {
        const exists = await imageExists(img);
        if (exists) existingImages.push(img);
      }
      setImages(existingImages);
    }
    filterImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonImages]);

  return (
    <div className={`sticky top-0 ${className || ""}`} {...rest}>
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
                  className="object-contain object-center h-96 w-full"
                  src={e}
                  alt={"Post image " + (i + 1)}
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
        <div className="mt-4 mb-8 grid grid-cols-1 md:grid-cols-2">
          <div>
            {post?.rentalType && (
              <p className="font-semibold tracking-tighter">
                {t(`rentalType.${post.rentalType}`)}
              </p>
            )}

            <p className="text-lg">
              €{post?.monthlyPrice}{" "}
              <span className="font-light">{t("rentViewer.perMonth")}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              {post?.date &&
                format(new Date(post.date), "'📅' E d MMM yyyy HH:mm", {
                  locale: i18n.language === "it" ? it : enUS
                })}
            </p>
            {post?.address && (
              <p className="mt-2 text-gray-700">📍 {post?.address}</p>
            )}
          </div>
        </div>
        <p>{post?.description}</p>
        {post && (
          <div className="mt-4 flex justify-center">
            <Button
              href={post.url || "#"}
              className="p-3 rounded-full font-medium tracking-tight"
            >
              {t("common.contact")}{" "}
              <span className="font-bold">{post?.authorUsername}</span>
            </Button>
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
