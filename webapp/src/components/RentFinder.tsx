import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import RentCard from "./RentCard";
import CustomSelect from "./Select";
import Button from "./Button";
import RentView from "./RentView";
import Textbox from "./Textbox";
import { RentalPost, RentalPostJSONified } from "../interfaces/RentalPost";
import { rentalTypeOptions } from "../config";
import Search from "../icons/Search";
import { useTranslation } from "react-i18next";

const RentFinder = () => {
  const [posts, setPosts] = useState<RentalPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // TODO use infinite scroller
  const [limit, setLimit] = useState(10);
  const [cursor, setCursor] = useState(0);

  const [selected, setSelected] = useState<RentalPost | null>(null);

  // MIGLIORA TYPING!! (array di chiavi di rentalTypeOptions[i].value)
  const [rentalTypes, setRentalTypes] = useState<string[]>(["singleRoom"]);

  const { t } = useTranslation();

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/parsed", {
        params: {
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, limit]);

  return (
    <div>
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
          {posts && !isLoading ? (
            <div>
              {posts.map(e => (
                <RentCard
                  key={e.postId}
                  post={e}
                  onCardSelected={setSelected}
                />
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
            <div>
              <RentView post={selected} />
            </div>
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
