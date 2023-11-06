import { FunctionComponent, HTMLAttributes } from "react";
import { enUS, it } from "date-fns/locale";
import { formatDistance } from "date-fns";
import { RentalPost } from "../interfaces/RentalPost";
import Fb from "../icons/Fb";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../misc/getLanguage";

// import ReactPlaceholder from "react-placeholder";

interface RentCardProps extends HTMLAttributes<HTMLDivElement> {
  post?: RentalPost; // if null, it will simulate loading
}

const RentCard: FunctionComponent<RentCardProps> = ({ post, ...rest }) => {
  const { i18n, t } = useTranslation();

  return (
    <div
      className="max-w-full overflow-hidden text-ellipsis cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-300 flex p-4 min-w-[12rem] min-h-[12rem]"
      {...rest}
    >
      {post?.images && post.images.length > 0 && (
        <img
          className="w-32 h-32 my-auto mr-3 object-cover object-center"
          src={post.images[0]}
          alt="rental"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/500x500.png?text=" +
              encodeURIComponent(t("rentViewer.imageError"));
          }}
        />
      )}
      {/* <ReactPlaceholder showLoadingAnimation type="text" ready={!!post}> */}
      {post?.rentalType && (
        <p className="font-semibold tracking-tighter">
          {t(`rentalType.${post.rentalType}`)}
        </p>
      )}

      {typeof post?.monthlyPrice === "number" && (
        <p className="mb-2 text-lg font-light">€{post?.monthlyPrice}</p>
      )}

      <p className="line-clamp-3">{post?.description || post?.address}</p>

      <div className="flex flex-col md:flex-row">
        <div className="flex items-center gap-2">
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {post?.date &&
              formatDistance(post.date, new Date(), {
                addSuffix: true,
                locale: getLanguage(i18n.language) === "it" ? it : enUS
              })}
          </p>
          <p className="hidden md:block">.</p>
          <p className="hidden md:block mt-2 text-gray-500 capitalize">
            {post?.source === "facebook" ? (
              <Fb className="fill-gray-500" />
            ) : post?.source ? (
              post?.source
            ) : null}
          </p>
        </div>
        {post?.address && (
          <>
            <p className="hidden md:block">.</p>
            <p className="mt-2 text-gray-500 hidden md:block">
              {post?.address.length > 15
                ? post?.address.slice(0, 15) + "..."
                : post?.address}
            </p>
          </>
        )}
      </div>
      {/* </ReactPlaceholder> */}
    </div>
  );
};

export default RentCard;
