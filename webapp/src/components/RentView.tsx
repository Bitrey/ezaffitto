import { RentalPost } from "@/interfaces/RentalPost";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Zoom from "react-medium-image-zoom";
import React, { FunctionComponent, HTMLAttributes, useEffect } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios, { AxiosError } from "axios";

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
        <p className="font-semibold tracking-tighter">{post?.rentalType}</p>

        <p className="mb-2 text-lg font-light">€{post?.monthlyPrice}</p>

        <p>{post?.description}</p>

        <div className="flex items-center gap-2">
          <p className="mt-2 text-gray-500">{post?.date.toISOString()}</p>
          <p>.</p> {/* TODO fallo meglio */}
          <p className="mt-2 text-gray-500">{post?.address}</p>
        </div>

        <h1>debug</h1>
        <pre>
          <code>{JSON.stringify(post, null, 4)}</code>
        </pre>
      </div>
    </div>
  );
};

export default RentView;
