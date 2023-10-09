import axios, { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import RentCard from "./RentCard";
import CustomSelect from "./Select";
import Button from "./Button";
import RentView from "./RentView";
import Textbox from "./Textbox";
import { RentalPostJSONified } from "../interfaces/RentalPost";
import { rentalTypeOptions } from "../config";
import Search from "../icons/Search";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import Forward from "../icons/Forward";
import Backwards from "../icons/Backwards";
import { useNavigate } from "react-router-dom";

const RentFinder = () => {
  const [posts, setPosts] = useState<RentalPostJSONified[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // TOOD debug
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [turnstileToken, setTurnstileToken] = useState<string | null>("valid");

  const navigate = useNavigate();

  // TODO use infinite scroller
  const limit = 30;
  const [cursor, setCursor] = useState(0);

  const itemsPerPage = 10;

  const endCursor = cursor + itemsPerPage;
  const shownPosts = posts?.slice(cursor, endCursor);
  const pageCount = posts ? Math.ceil(posts.length / itemsPerPage) : 0;

  const handlePageClick = (event: { selected: number }) => {
    if (!posts) return;
    const newCursor = (event.selected * itemsPerPage) % posts.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newCursor}`
    );
    setCursor(newCursor);
  };

  const [selected, setSelected] = useState<RentalPostJSONified | null>(null);

  // MIGLIORA TYPING!! (array di chiavi di rentalTypeOptions[i].value)
  const [rentalTypes, setRentalTypes] = useState<string[]>([
    "singleRoom",
    "doubleRoom",
    "studio",
    "apartment",
    "house",
    "other"
  ]);

  const { t } = useTranslation();

  async function fetchData(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    // TODO DEBUG
    // if (!turnstileToken) {
    //   console.error("No turnstile token");
    //   window.alert("Please solve the captcha");
    //   return;
    // }

    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/v1/rentalpost", {
        params: {
          captcha: turnstileToken,
          limit,
          cursor,
          rentalTypes: rentalTypes.length > 0 ? rentalTypes : null,
          maxPrice
        }
      });
      // DEBUG
      console.log("Fetched parsed data", data);
      // parse dates
      const mapped = (data as RentalPostJSONified[]).map(e => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.date),
        updatedAt: new Date(e.date)
      }));
      setPosts(mapped);
      if (mapped.length > 0) {
        setSelected(mapped[0]);
      }
    } catch (err) {
      // DEBUG
      console.error((err as AxiosError)?.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    if (!turnstileToken) {
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, limit]);

  return (
    <div>
      <h3 className="mt-8 mb-2 text-center font-semibold text-2xl">
        {t("homepage.banner")}
      </h3>

      <form onSubmit={fetchData} className="mt-4 mx-auto w-full md:w-[50vw]">
        <div className="flex items-center gap-4">
          <CustomSelect
            primaryColor="red"
            isMultiple
            defaultValues={[rentalTypeOptions[0]]}
            options={rentalTypeOptions}
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
          {/* TODO add back in prod DEBUG */}
          {/* <Turnstile
            siteKey="0x4AAAAAAALPWjAvPc2W_e1h"
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
          /> */}
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
        </div>
      </form>

      <div className="mt-6 md:mt-16 grid grid-cols-1 md:grid-cols-2">
        <div>
          <div className="flex items-center mx-auto">
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
          </div>

          {posts && shownPosts && !isLoading ? (
            <div>
              {shownPosts.map(e => (
                <>
                  <div className="hidden md:block">
                    <RentCard
                      key={e.postId}
                      post={e}
                      onClick={() => e && setSelected(e)}
                    />
                  </div>
                  <div className="md:hidden">
                    <RentCard
                      key={e.postId}
                      post={e}
                      onClick={() => navigate(`/${e._id}`)}
                    />
                  </div>
                </>
              ))}
            </div>
          ) : isLoading ? (
            Array.from({ length: 10 }, (_, i) => i + 1).map(e => (
              <RentCard key={e} />
            ))
          ) : (
            <p>DEBUG errore</p>
          )}
        </div>
        <div>
          {selected && !isLoading ? (
            <RentView
              post={selected}
              onClick={() => navigate(`/${selected._id}`)}
            />
          ) : isLoading ? (
            <p>DEBUG caricamento...</p>
          ) : (
            <p>DEBUG ciao</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentFinder;
