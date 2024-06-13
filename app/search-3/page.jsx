"use client";

import { useEffect, useState, useRef } from "react";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { boldSubstring } from "../utils";

function parseDosage(dosage) {
  if (!dosage) return { value: 0, unit: "" };

  const match = dosage.match(/(\d+)\s*(MG|MG\/ML|MG\/5ML)/);
  if (match) {
    return {
      value: parseInt(match[1]),
      unit: match[2],
    };
  }
  return { value: 0, unit: "" };
}

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediSpanId, setMediSpanId] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [selectedStrength, setSelectedStrength] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const fetchConcepts = async (query) => {
    const response = await fetch(
      `/api/searchMedispanLikeDosespot?search=${query}`
    );
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

    if (
      search.length > 2 &&
      (!selectedConcept || search !== selectedConcept.name)
    ) {
      debouncedFetchConcepts(search);
    } else {
      setConcepts([]);
      setLoading(false);
    }
  }, [search, debouncedFetchConcepts, selectedConcept]);

  useEffect(() => {
    return () => {
      debouncedFetchConcepts.cancel();
    };
  }, [debouncedFetchConcepts]);

  const fetchMediSpanIdStrengths = async (query) => {
    const response = await fetch(
      `/api/searchMediSpanIdStrengths?search=${query}`
    );
    const data = await response.json();
    setStrengths(data?.results || []);
  };

  useEffect(() => {
    if (mediSpanId) {
      fetchMediSpanIdStrengths(mediSpanId);
    }
  }, [mediSpanId]);

  useEffect(() => {
    if (strengths.length === 1) {
      setSelectedStrength(strengths[0]);
    }
  }, [strengths]);

  const sorted = strengths.sort((a, b) => {
    const aParsed = parseDosage(a);
    const bParsed = parseDosage(b);

    if (aParsed.value !== bParsed.value) {
      return aParsed.value - bParsed.value;
    } else {
      return aParsed.unit.localeCompare(bParsed.unit);
    }
  });

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
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedConcept(null);
            setSelectedStrength(null);
          }}
          value={search}
          placeholder="Start typing..."
          className={`mb-2 block w-full rounded-lg border-0 py-4 text-lg text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6 px-5`}
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
              Enter at least 3 characters
            </div>
          </div>
        ) : null}
        {!loading &&
        search.length > 2 &&
        concepts.length === 0 &&
        !selectedConcept ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">
              No results, try less specific
            </div>
          </div>
        ) : null}
        {!loading && search.length > 0 && concepts.length > 0 ? (
          <div className="relative mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <ul className="divide-y">
              {concepts.map((c, i) => {
                const boldedContent = boldSubstring(c.name, search);
                return (
                  <li
                    key={i}
                    className="py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setMediSpanId(c.mediSpanId);
                      setSearch(c.name);
                      setSelectedConcept(c);
                      setConcepts([]);
                    }}
                  >
                    <div className="text-sm">{boldedContent}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {selectedConcept ? (
          <div className="mt-4 mb-1">
            Medication: <b>{selectedConcept?.name}</b>
          </div>
        ) : null}

        {strengths?.length > 0 && selectedConcept && (
          <div className="inline-block relative mt-2">
            Strength:{" "}
            {selectedStrength ? (
              <b>{selectedStrength}</b>
            ) : (
              <button
                type="button"
                className="inline-flex justify-center rounded-md shadow-md bg-white px-2 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                id="menu-button"
                aria-expanded={showMenu}
                aria-haspopup={showMenu}
                onClick={() => setShowMenu(!showMenu)}
              >
                Select
                <svg
                  className="-mr-1 ml-2 h-5 w-5 text-gray-400"
                  viewBox="0 -5 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {showMenu && strengths.length > 1 && (
              <div
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  {sorted.map((s, i) => (
                    <a
                      key={i}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      tabIndex="-1"
                      id={`menu-item-${i}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedStrength(s);
                        setShowMenu(false);
                      }}
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="col-span-1"></div>
    </div>
  );
}
