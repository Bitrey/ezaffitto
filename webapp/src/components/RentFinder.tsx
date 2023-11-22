import axios, { AxiosError } from "axios";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import ReactGA from "react-ga4";
import RentCard from "./RentCard";
import CustomSelect from "./Select";
import Button from "./Button";
import RentView from "./RentView";
import Textbox from "./Textbox";
import {
  EzaffittoCity,
  RentalPostJSONified,
  RentalPostJSONifiedRaw
} from "../interfaces/RentalPost";
import { config, gaEvents, rentalTypeOptions } from "../config";
import Search from "../icons/Search";
// import ReactPaginate from "react-paginate";
// import Forward from "../icons/Forward";
// import Backwards from "../icons/Backwards";
import { SearchQueryContext } from "../Homepage";
import { translatePostJSON } from "../misc/translatePostJSON";
import { MarkerIcon } from "../misc/MarkerIcon";
import Accordion from "./Accordion";
import Dropdown, { DropdownOption } from "./Dropdown";
import { OrderBy } from "../interfaces/orderBy";
import { format } from "date-fns";
import { getLanguage } from "../misc/getLanguage";
import { enUS, it } from "date-fns/locale";

interface RentFinderProps {}

const RentFinder: FC<RentFinderProps> = () => {
  const [maxPrice, setMaxPrice] = useState<number>(10_000);

  const { isLoading, setIsLoading, searchQuery } =
    useContext(SearchQueryContext);

  const [error, setError] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [rentalTypes, setRentalTypes] = useState<string[]>(
    rentalTypeOptions.map(e => e.value)
  );

  const { i18n, t } = useTranslation();

  const [count, setCount] = useState(Infinity);

  // let cursor: number = 0;
  const [cursor, setCursor] = useState(0);
  const limit: number = 30;

  const orderByOptions: DropdownOption<OrderBy>[] = [
    { key: "dateAsc", value: t("orderByOptions.dateAsc") },
    { key: "dateDesc", value: t("orderByOptions.dateDesc") },
    { key: "priceAsc", value: t("orderByOptions.priceAsc") },
    { key: "priceDesc", value: t("orderByOptions.priceDesc") }
  ];

  // route is :city
  const { city } = useParams<{ city: EzaffittoCity }>();

  const [orderBy, setOrderBy] = useState<OrderBy>("dateDesc");

  async function onOrderChange(option: DropdownOption<OrderBy>): Promise<void> {
    setOrderBy(option.key);
    setCursor(0);
  }

  // const posts: RentalPostJSONified[] = [];
  const [posts, setPosts] = useState<RentalPostJSONified[]>([]);

  const [selected, setSelected] = useState<RentalPostJSONified | null>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha(gaEvents.findPosts.action);
      setCaptchaToken(token);
    } catch (err) {
      setError("errors.timeout");
    } finally {
      setIsLoading(false);
    }
  }, [executeRecaptcha, setIsLoading]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  const fetchData = useCallback(
    async (concat: boolean = false): Promise<RentalPostJSONified[] | null> => {
      if (!captchaToken) {
        console.error("No ReCAPTCHA token");
        window.alert(t("captcha.pleaseSolve"));
        return null;
      }

      // await fetchCount();

      console.log("Fetching posts", {
        city,
        limit,
        skip: cursor,
        rentalTypes,
        maxPrice,
        q: searchQuery,
        orderBy
      });

      setIsLoading(true);
      try {
        const res = await axios.get("/api/v1/rentalpost", {
          params: {
            captcha: captchaToken,
            city,
            limit,
            skip: cursor,
            rentalTypes: rentalTypes.length > 0 ? rentalTypes : null,
            maxPrice: Math.max(maxPrice, config.minMaxPrice),
            q: searchQuery.length > 0 ? searchQuery : null,
            orderBy
          }
        });

        if (maxPrice < config.minMaxPrice) {
          setMaxPrice(config.minMaxPrice);
        }

        const { data, count } = res.data;

        console.log("Posts count", { count });

        ReactGA.event(gaEvents.findPosts, {
          searchQuery,
          rentalTypes,
          maxPrice,
          q: searchQuery,
          count
        });

        setCount(count);

        // DEBUG
        // parse dates
        const mapped = (data as RentalPostJSONifiedRaw[]).map(e =>
          translatePostJSON(e)
        );
        console.log("Fetched posts", mapped, "out of", count);
        // posts.push(...mapped);

        if (concat && cursor !== 0) {
          setPosts([...posts, ...mapped]);
        } else {
          setPosts(mapped);
        }

        if (mapped.length > 0 && !selected) {
          setSelected(mapped[0]);
        }

        setError(null);
        setCaptchaToken(null);

        return mapped;
      } catch (err) {
        // DEBUG
        const errorStr = (err as AxiosError)?.response?.data as
          | { err: string }
          | undefined;
        console.error(errorStr || err);
        setError(
          errorStr?.err ? t(errorStr.err) : t("rentViewer.loadingError")
        );
      } finally {
        setIsLoading(false);
      }

      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cursor,
      rentalTypes,
      maxPrice,
      searchQuery,
      captchaToken,
      selected,
      posts,
      orderBy
    ]
  );

  const { state } = useLocation();

  useEffect(() => {
    let posts = null;
    let selected = null;
    try {
      posts = JSON.parse(state.posts).map((e: RentalPostJSONifiedRaw) =>
        translatePostJSON(e)
      );
      if (!Array.isArray(posts)) {
        throw new Error("sasso");
      }
    } catch (err) {}

    try {
      selected = translatePostJSON(JSON.parse(state.selected));
    } catch (err) {}

    if (posts) {
      setPosts(posts);
      if (posts.length > 0) {
        setSelected(selected || posts[0]);
      }
      console.log(
        "Using cache for posts",
        posts,
        "selected",
        selected || posts[0]
      );
      state.posts = null;
      state.selected = null;
      return;
    }

    if (!captchaToken || isLoading) {
      return;
    }
    fetchData(cursor !== 0); // concatenation if not first page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, captchaToken]);

  return (
    <div className="p-2 pb-8 dark:bg-gray-800 dark:text-white">
      <h3 className="mt-8 mb-2 text-center font-semibold text-2xl">
        {t("homepage.banner", { city: t("city." + city) })}
      </h3>

      <form
        onSubmit={async e => {
          e.preventDefault();
          await handleReCaptchaVerify();
        }}
        className="mt-4 mx-auto w-full"
      >
        <div className="md:w-[50vw] mx-auto">
          <div className="flex items-center gap-4">
            <CustomSelect
              primaryColor="red"
              isMultiple
              i18nIsDynamicList
              defaultValues={[]}
              options={rentalTypeOptions.map(e => ({
                ...e,
                label: t(e.label)
              }))}
              noOptionsMessage={t("rentFinder.noMoreOptions")}
              onChange={s => setRentalTypes(s.map(e => e.value))}
            />
            <Button
              type="submit"
              className="p-3 rounded-full font-medium tracking-tight"
            >
              <Search />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex justify-center md:justify-around w-full flex-col md:flex-row gap-2">
          <div className="flex justify-center items-center gap-2">
            <p>{t("rentFinder.maxPrice")}</p>
            <div className="flex items-center dark:bg-gray-700 rounded border border-inherit outline-none focus:border-red-600">
              <p className="ml-2 prefix font-light text-gray-500">€</p>
              <Textbox
                type="number"
                value={maxPrice}
                onChange={v => setMaxPrice(parseInt(v.target.value) || 0)}
                className="border-none dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t("rentViewer.perMonth")}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2">
            <p>{t("rentFinder.orderBy")}</p>
            <Dropdown
              onSelectCustom={
                // si puo' fare tanto passiamo i types giusti
                onOrderChange as (option: DropdownOption<string>) => void
              }
              defaultOption={{
                key: "dateDesc",
                value: t("orderByOptions.dateDesc")
              }}
              options={orderByOptions}
            />
          </div>
        </div>
      </form>

      {posts &&
        posts.length > 0 &&
        posts.filter(p => p.latitude && p.longitude).length > 0 && (
          <div className="z-0 flex items-center justify-center mt-6">
            <Accordion
              title={t("map.findOnMap") + " 🧭"}
              className="w-full max-h-[80vh]"
            >
              <MapContainer
                style={{
                  zIndex: 10,
                  height: "70vh",
                  width: "100%"
                  // maxHeight: "90vh",
                  // maxWidth: "90%"
                }}
                center={[44.494936, 11.342849]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {posts
                  .filter(e => e.latitude && e.longitude)
                  .map(e => (
                    <Marker
                      key={e._id}
                      icon={MarkerIcon(
                        e.monthlyPrice
                          ? {
                              cost: e.monthlyPrice
                              // title: t("rentalType." + e.rentalType)
                            }
                          : {}
                      )}
                      position={[e.latitude as number, e.longitude as number]}
                    >
                      <Popup>
                        <Link
                          to={`/post/${e._id}`}
                          state={{
                            post: JSON.stringify(e),
                            prevPath: window.location.pathname,
                            posts: JSON.stringify(posts)
                          }}
                        >
                          {e.monthlyPrice && (
                            <p className="mb-0 pb-0 m-0">
                              <strong className="text-black">
                                €{e.monthlyPrice}
                              </strong>
                              <span className="text-black">
                                {t("rentViewer.perMonth")}
                              </span>
                              <span className="mx-1 text-gray-600">·</span>
                              <span className="text-gray-600">
                                {e?.date &&
                                  format(new Date(e.date), "d MMM yyyy", {
                                    locale:
                                      getLanguage(i18n.language) === "it"
                                        ? it
                                        : enUS
                                  })}
                              </span>
                              <span className="mx-1 text-gray-600">·</span>
                              <span className="text-gray-600">
                                {t("rentalType." + e.rentalType)}
                              </span>
                            </p>
                          )}
                          {e.address || `${e.latitude},${e.longitude}`}
                          <span className="mx-1 text-gray-600">·</span>
                          {e.url ? (
                            <span className="text-gray-600">
                              {new URL(e.url).hostname.replace("www.", "")}
                            </span>
                          ) : (
                            <span className="text-gray-600 capitalize">
                              {e.source}
                            </span>
                          )}
                        </Link>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </Accordion>
          </div>
        )}

      <div className="mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-2">
        <div>
          <InfiniteScroll
            // height={600}
            dataLength={posts?.length}
            next={async () => {
              if (isLoading || posts.length === 0) return;
              setCursor(cursor + limit);

              // try to reset recaptcha
              await handleReCaptchaVerify();
            }}
            hasMore={
              !Number.isFinite(count) ||
              isLoading ||
              !posts ||
              typeof count !== "number" ||
              (posts?.length !== 0 && posts.length < count)
            }
            loader={
              <p
                className={`rounded ${
                  error ? "bg-red-100 animate-slideIn" : "bg-gray-100"
                } dark:bg-gray-600 text-center p-2 dark:text-white flex justify-center items-center w-full min-w-[16rem] h-16 mx-auto ${
                  error ? "" : "animate-pulse"
                }`}
              >
                {error || t("rentFinder.loadingPosts")}
              </p>
            }
            endMessage={
              <p className="text-center mt-1">
                <b>
                  {posts?.length === 0
                    ? t("rentFinder.noPostsAvailable")
                    : t("rentFinder.noMorePosts")}
                </b>
              </p>
            }
            // below props only if you need pull down functionality
            refreshFunction={async () => {
              await handleReCaptchaVerify();
            }}
            pullDownToRefresh
            pullDownToRefreshThreshold={50}
            pullDownToRefreshContent={
              <h3 style={{ textAlign: "center" }}>
                &#8595; {t("rentFinder.pullToRefresh")}
              </h3>
            }
            releaseToRefreshContent={
              <h3 style={{ textAlign: "center" }}>
                &#8593; {t("rentFinder.releaseToRefresh")}
              </h3>
            }
          >
            {posts.map(e => (
              <React.Fragment key={e._id}>
                <div className="hidden md:block">
                  <RentCard post={e} onClick={() => e && setSelected(e)} />
                </div>
                <div className="md:hidden">
                  <Link
                    to={`/post/${e._id}`}
                    state={{
                      post: JSON.stringify(e),
                      prevPath: window.location.pathname,
                      posts: JSON.stringify(posts)
                    }}
                  >
                    <RentCard post={e} />
                  </Link>
                </div>
              </React.Fragment>
            ))}
          </InfiniteScroll>
        </div>
        {posts && posts.length > 0 && (
          <div className="hidden md:block">
            {selected ? (
              <Link
                to={`/post/${selected._id}`}
                state={{
                  post: JSON.stringify(selected),
                  prevPath: window.location.pathname,
                  posts: JSON.stringify(posts),
                  selected: JSON.stringify(selected)
                }}
              >
                <RentView
                  post={selected}
                  className="cursor-pointer hidden md:block"
                />
              </Link>
            ) : isLoading ? (
              <p className="bg-gray-100 w-full min-w-[16rem] h-16 mx-auto animate-pulse"></p>
            ) : (
              <p className="text-center text-gray-500">
                {t("rentFinder.noPostSelected")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentFinder;
