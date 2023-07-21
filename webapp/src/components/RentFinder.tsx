"use client";

import { RentalPost, RentalPostJSONified } from "@/interfaces/RentalPost";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import RentCard from "./RentCard";
import CustomSelect from "./Select";
import { rentalTypeOptions } from "@/config";
import { labels } from "@/i18n/labels";
import Button from "./Button";
import Search from "@/icons/Search";
import ReactPlaceholder from "react-placeholder";

const RentFinder = () => {
  const [posts, setPosts] = useState<RentalPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // TODO use infinite scroller
  const [limit, setLimit] = useState(10);
  const [cursor, setCursor] = useState(0);

  const [selected, setSelected] = useState<RentalPost | null>(null);

  // MIGLIORA TYPING!! (array di chiavi di rentalTypeOptions[i].value)
  const [rentalTypes, setRentalTypes] = useState<string[]>(["singleRoom"]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/parsed", {
        params: {
          limit,
          cursor,
          rentalTypes: rentalTypes.length > 0 ? rentalTypes : null
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
      <div className="mt-4 mx-auto w-full md:w-[50vw]">
        <div className="flex items-center gap-4">
          <CustomSelect
            primaryColor="red"
            isMultiple
            defaultValues={[rentalTypeOptions[0]]}
            options={rentalTypeOptions}
            noOptionsMessage={labels.selectNoOptionsMessage}
            onChange={s => setRentalTypes(s.map(e => e.value))}
          />
          <Button
            onClick={fetchData}
            className="p-3 rounded-full font-medium tracking-tight"
          >
            <Search />
          </Button>
        </div>
      </div>

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
              <pre>
                <code>{JSON.stringify(selected, null, 4)}</code>
              </pre>
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
