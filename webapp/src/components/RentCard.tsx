import { RentalPost } from "@/interfaces/RentalPost";
import React, { FunctionComponent, HTMLAttributes, Key } from "react";
// import ReactPlaceholder from "react-placeholder";

interface RentCardProps extends HTMLAttributes<HTMLDivElement> {
  onCardSelected?: (selected: RentalPost) => any;
  post?: RentalPost; // if null, it will simulate loading
}

const RentCard: FunctionComponent<RentCardProps> = ({
  post,
  onCardSelected,
  ...rest
}) => {
  return (
    <div
      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-300 flex flex-col p-4 min-w-[12rem] min-h-[12rem]"
      onClick={() => onCardSelected && post && onCardSelected(post)}
      {...rest}
    >
      {/* <ReactPlaceholder showLoadingAnimation type="text" ready={!!post}> */}
      <p className="font-semibold tracking-tighter">{post?.rentalType}</p>

      <p className="mb-2 text-lg font-light">€{post?.monthlyPrice}</p>

      <p className="line-clamp-3">{post?.description}</p>

      <div className="flex items-center gap-2">
        <p className="mt-2 text-gray-500">{post?.date.toISOString()}</p>
        <p>.</p> {/* TODO fallo meglio */}
        <p className="mt-2 text-gray-500">{post?.address}</p>
      </div>
      {/* </ReactPlaceholder> */}
    </div>
  );
};

export default RentCard;
