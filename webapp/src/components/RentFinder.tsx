import axios, { AxiosError } from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import ReactGA from "react-ga4";
import RentCard from "./RentCard";
import CustomSelect from "./Select";
import Button from "./Button";
import RentView from "./RentView";
import Textbox from "./Textbox";
import { RentalPostJSONified } from "../interfaces/RentalPost";
import { config, gaEvents, rentalTypeOptions } from "../config";
import Search from "../icons/Search";
// import ReactPaginate from "react-paginate";
// import Forward from "../icons/Forward";
// import Backwards from "../icons/Backwards";
import { SearchQueryContext } from "../Homepage";
import { translatePostJSON } from "../misc/translatePostJSON";

const RentFinder = () => {
  const [maxPrice, setMaxPrice] = useState<number>(10_000);

  const { isLoading, setIsLoading, searchQuery } =
    useContext(SearchQueryContext);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // TOOD debug
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [turnstileToken, setTurnstileToken] = useState<string | null>("valid");

  const navigate = useNavigate();

  const [rentalTypes, setRentalTypes] = useState<string[]>(
    rentalTypeOptions.map(e => e.value)
  );

  const { i18n, t } = useTranslation();

  const [count, setCount] = useState(Infinity);

  const turnstileRef = React.useRef<TurnstileInstance>();

  // let cursor: number = 0;
  const [cursor, setCursor] = useState(0);
  const limit: number = 30;

  // const posts: RentalPostJSONified[] = [];
  const [posts, setPosts] = useState<RentalPostJSONified[]>([]);

  const [selected, setSelected] = useState<RentalPostJSONified | null>(null);

  const fetchData = useCallback(
    async (
      e?: React.FormEvent<HTMLFormElement>,
      concat: boolean = false
    ): Promise<RentalPostJSONified[] | null> => {
      e?.preventDefault();

      // TODO DEBUG
      if (!turnstileToken) {
        console.error("No turnstile token");
        window.alert(t("turnstile.pleaseSolve"));
        return null;
      }

      // await fetchCount();

      console.log("Fetching posts", {
        limit,
        skip: cursor,
        rentalTypes,
        maxPrice,
        q: searchQuery
      });

      setIsLoading(true);
      try {
        const res = await axios.get("/api/v1/rentalpost", {
          params: {
            captcha: turnstileToken,
            limit,
            skip: cursor,
            rentalTypes: rentalTypes.length > 0 ? rentalTypes : null,
            maxPrice,
            q: searchQuery.length > 0 ? searchQuery : null
          }
        });
        const { data, count } = res.data;

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
        const mapped = (data as RentalPostJSONified[]).map(e =>
          translatePostJSON(e)
        );
        console.log("Fetched posts", mapped, "out of", count);
        // posts.push(...mapped);

        if (concat) {
          setPosts([...posts, ...mapped]);
        } else {
          setPosts(mapped);
        }

        if (mapped.length > 0 && !selected) {
          setSelected(mapped[0]);
        }

        return mapped;
      } catch (err) {
        // DEBUG
        console.error((err as AxiosError)?.response?.data || err);
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
      turnstileToken,
      selected,
      posts
    ]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!turnstileToken) {
      return;
    }
    fetchData(undefined, cursor !== 0); // concatenation if not first page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, turnstileToken]);

  return (
    <div className="p-2 pb-8">
      <h3 className="mt-8 mb-2 text-center font-semibold text-2xl">
        {t("homepage.banner")}
      </h3>

      <form
        onSubmit={e => {
          e.preventDefault();
          turnstileRef?.current?.reset();
        }}
        className="mt-4 mx-auto w-full md:w-[50vw]"
      >
        <div className="flex items-center gap-4">
          <CustomSelect
            primaryColor="red"
            isMultiple
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

        <div className="mt-2 flex justify-center">
          <Turnstile
            siteKey={config.turnstileSiteKey}
            onSuccess={setTurnstileToken}
            onError={() => {
              window.scrollTo(0, 0);
              window.alert(t("turnstile.error"));
            }}
            onExpire={() => setTurnstileToken(null)}
            options={{
              action: "find-rentalposts",
              language: i18n.language,
              theme: "light"
            }}
            ref={turnstileRef}
          />
        </div>

        <div className="mt-2 flex justify-center items-center gap-2">
          <p>{t("rentFinder.maxPrice")}</p>
          <div className="flex items-center rounded border border-inherit outline-none focus:border-red-600">
            <p className="ml-2 prefix font-light text-gray-500">€</p>
            <Textbox
              type="number"
              value={maxPrice}
              onChange={v => setMaxPrice(parseInt(v.target.value) || 0)}
              className="border-none"
            />
          </div>
          <p className="text-gray-600 text-sm">{t("rentViewer.perMonth")}</p>
        </div>
      </form>

      <div className="mt-6 md:mt-16 grid grid-cols-1 md:grid-cols-2">
        <div>
          {/* <div className="flex items-center mx-auto">
            <ReactPaginate
              activeClassName={"item active "}
              breakClassName={"item break-me "}
              breakLabel={"..."}
              containerClassName={"pagination"}
              disabledClassName={"disabled-page"}
              marginPagesDisplayed={2}
              nextClassName={"item next "}
              nextLabel={<Forward />}
              onPageChange={handlePageClick}
              pageCount={pageCount}
              pageClassName={"item pagination-page "}
              pageRangeDisplayed={2}
              previousClassName={"item previous"}
              previousLabel={<Backwards />}
            />
          </div> */}

          <InfiniteScroll
            // height={600}
            dataLength={posts?.length}
            next={async () => {
              setCursor(cursor + limit);
              turnstileRef?.current?.reset(); // reset captcha
            }}
            hasMore={
              posts?.length === 0
                ? false
                : !posts || !count || posts.length < count
            }
            loader={
              <p className="bg-gray-100 flex justify-center items-center w-full min-w-[16rem] h-16 mx-auto animate-pulse">
                {t("common.loading")}
              </p>
            }
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>{t("rentFinder.noMorePosts")}</b>
              </p>
            }
            // below props only if you need pull down functionality
            refreshFunction={fetchData}
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
                  <RentCard
                    post={e}
                    onClick={() =>
                      navigate(`/post/${e._id}`, {
                        state: {
                          post: JSON.stringify(e)
                        }
                      })
                    }
                  />
                </div>
              </React.Fragment>
            ))}
          </InfiniteScroll>
        </div>
        <div>
          {selected ? (
            <RentView
              post={selected}
              className="cursor-pointer hidden md:block"
              onClick={() =>
                navigate(`/post/${selected._id}`, {
                  state: {
                    post: JSON.stringify(selected)
                  }
                })
              }
            />
          ) : isLoading ? (
            <p className="bg-gray-100 w-full min-w-[16rem] h-16 mx-auto animate-pulse"></p>
          ) : (
            <p className="text-center text-gray-500">
              {t("rentFinder.noPostSelected")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentFinder;
