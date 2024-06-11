"use client";

import { useEffect, useState, useRef } from "react";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { boldSubstring } from "../utils";

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConcepts = async (query) => {
    const response = await fetch(`/api/searchRxNorm?search=${query}`);
    const data = await response.json();
    setConcepts(data?.results || []);
    setLoading(false);
  };

  const debouncedFetchConcepts = useRef(
    debounce((query) => {
      fetchConcepts(query);
    }, 300)
  ).current;

  useEffect(() => {
    setLoading(true);

    if (search.length > 2) {
      debouncedFetchConcepts(search);
    } else {
      setConcepts([]);
      setLoading(false);
    }
  }, [search, debouncedFetchConcepts]);

  useEffect(() => {
    return () => {
      debouncedFetchConcepts.cancel();
    };
  }, [debouncedFetchConcepts]);

  return (
    <div className="p-5 grid grid-cols-4">
      <div className="col-span-1">
        <div
          className="text-gray-600 hover:underline font-semibold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Go back
        </div>
      </div>
      <div className="col-span-2">
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder="Start typing..."
          className="mb-2 block w-full rounded-lg border-0 py-4 text-lg text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6 px-5"
        />
        {loading ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ) : null}
        {!loading &&
        search.length > 0 &&
        search.length < 3 &&
        concepts.length === 0 ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">
              Enter atleast 3 characters
            </div>
          </div>
        ) : null}
        {!loading && search.length > 2 && concepts.length === 0 ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">
              No results, try less specific
            </div>
          </div>
        ) : null}
        {!loading && search.length > 0 && concepts.length > 0 ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <ul className="divide-y">
              {concepts.map((c, i) => {
                const boldedContent = boldSubstring(c, search);
                return (
                  <li
                    key={c}
                    className={`py-2 cursor-pointer hover:bg-gray-50`}
                  >
                    <div className="text-sm">{boldedContent}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="col-span-1"></div>
    </div>
  );
}
