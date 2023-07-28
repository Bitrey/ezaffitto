import { RentalPost } from "@/interfaces/RentalPost";
import { Swiper, SwiperSlide } from "swiper/react";
import Zoom from "react-medium-image-zoom";
import React, { FunctionComponent, HTMLAttributes, useEffect } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Button from "./Button";

interface RentViewProps extends HTMLAttributes<HTMLDivElement> {
  post: RentalPost;
}

const RentView: FunctionComponent<RentViewProps> = ({ post }) => {
  async function imageExists(imageUrl: string) {
    try {
      const { data } = await axios.head(imageUrl);
      console.log({ data });
      return true;
    } catch (err) {
      console.log("sasso", (err as AxiosError)?.response?.data || err);
      return false;
    }
  }

  const [images, setImages] = React.useState<string[] | null>(null);

  const jsonImages = JSON.stringify(post.images);

  useEffect(() => {
    setImages(null);
    async function filterImages() {
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
    <div>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  className="object-cover object-center h-96 w-full"
                  src={e}
                  alt={"Post image " + (i + 1)}
                />
              </Zoom>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>DEBUG caricamento...</p>
      )}

      <div className="p-2">
        <div className="mt-4 mb-8 grid grid-cols-1 md:grid-cols-2">
          <div>
            <p className="font-semibold tracking-tighter">{post?.rentalType}</p>

            <p className="text-lg">
              €{post?.monthlyPrice} <span className="font-light">/mese</span>
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              {post?.date &&
                format(post.date, "'📅' E d MMM yyyy 'alle' HH:mm", {
                  locale: it
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
            <Button className="p-3 rounded-full font-medium tracking-tight">
              Contatta <span className="font-bold">{post?.authorUsername}</span>
            </Button>
          </div>
        )}

        <h1>debug</h1>
        <pre>
          <code>{JSON.stringify(post, null, 4)}</code>
        </pre>
      </div>
    </div>
  );
};

export default RentView;
