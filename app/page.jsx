"use client";
import { data } from "autoprefixer";
import { useEffect, useMemo, useState, useCallback } from "react";

function boldSubstring(inputString, substring) {
  const parts = inputString.split(new RegExp(`(${substring})`, "gi"));
  return parts.map((part, index) => {
    if (part.toLowerCase() === substring.toLowerCase()) {
      return (
        <strong key={index} className="font-bold">
          {part}
        </strong>
      );
    } else {
      return part;
    }
  });
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [filters, setFilters] = useState(new Set());
  const [dataCount, setDataCount] = useState(0);

  // cGhvdG9uaGx0aDoyN1U1RkpHMw==

  useEffect(() => {
    const searchConcepts = async () => {
      if (search && search.length > 2) {
        setDrugs([]);
        setSelectedDrug(null);
        setFilters(new Set());
        const response = await fetch(
          `/api/searchMedispanByConcept?search=${search}`
        );
        const data = await response.json();
        console.log("data!!!", data);
        setDataCount(data.length);
        setConcepts(data?.results || []);
      } else {
        setDrugs([]);
        setDataCount(0);
        setConcepts([]);
      }
    };

    searchConcepts();
  }, [search]);

  useEffect(() => {
    const searchDrugs = async () => {
      if (selectedConcept) {
        const response = await fetch(
          `/api/searchByDBId?conceptId=${selectedConcept.drugbank_pcid}`
        );
        const data = await response.json();

        // filter the drugs by creating a Set of "{d.rx_norm_prescribable_name}-{d.route}-{d.dosage_form}", if it exists in the Set, don't add it to the array
        const filteredDrugs = [];
        const drugSet = new Set();
        data.forEach((d) => {
          const drugKey = `${d.rx_norm_prescribable_name}-${d.route}-${d.dosage_form}`;
          if (!drugSet.has(drugKey)) {
            drugSet.add(drugKey);
            filteredDrugs.push(d);
          }
        });

        console.log("data", filteredDrugs);
        // setDrugs(data ? data : []);
        setDrugs(filteredDrugs ? filteredDrugs : []);
      }
    };
    searchDrugs();
  }, [selectedConcept]);

  const drugForms = useMemo(() => {
    return drugs.length > 0
      ? [...new Set(drugs.map((d) => d.dosage_form))]
      : [];
  }, [drugs.length]);

  const drugRoutes = useMemo(() => {
    return drugs.length > 0 ? [...new Set(drugs.map((d) => d.route))] : [];
  }, [drugs.length]);

  const drugStrengths = useMemo(() => {
    return drugs.length > 0
      ? [
          ...new Set(
            drugs
              .map((d) => {
                if (d?.rx_norm_prescribable_name?.includes("%")) {
                  // if name "ketoconazole 2 % Topical Cream" use regex to return "2%" grab the number before the % sign
                  const regex = /(\d+)(?=\s?%)/g;
                  const match = d.rx_norm_prescribable_name.match(regex);
                  if (match) {
                    return match[0] + "%";
                  }
                }

                // go through each drug.ingredients.strength `{number: '125', unit: 'mg/1'}` and return as a string `125 mg/1`
                return d.ingredients
                  .map((i) => `${i.strength.number} ${i.strength.unit}`)
                  .join(" / ");
              })
              .flat()
          ),
        ]
      : [];
  }, [drugs.length]);

  const setFilterCallback = useCallback(
    (filter) => {
      if (filters.has(filter)) {
        filters.delete(filter);
        setFilters(new Set([...filters]));
      } else {
        setFilters(new Set([...filters, filter]));
      }
    },
    [filters]
  );

  const filteredDrugs = useMemo(() => {
    if (filters.size === 0) {
      return drugs;
    }
    // filter drugs by d.dosage_form, d.route, d.ingredients.strength
    // if drug has all filters, return true
    const fd = drugs.filter((d) => {
      const drugForm = d.dosage_form;
      const drugRoute = d.route;
      let drugStrength = d.ingredients
        .map((i) => `${i.strength.number} ${i.strength.unit}`)
        .join(" / ");

      console.log(
        "drugStrength",
        drugStrength,
        "drugForm",
        drugForm,
        "drugRoute",
        drugRoute
      );
      // also check for % in drug name either like "2%" or with a space "2 %"
      if (d?.rx_norm_prescribable_name?.includes("%")) {
        const regex = /(\d+)(?=\s?%)/g;
        const match = d.rx_norm_prescribable_name.match(regex);
        if (match) {
          drugStrength = match[0] + "%";
        }
      }

      const drugFilters = [drugForm, drugRoute, drugStrength];
      return [...filters].every((f) => drugFilters.includes(f));
    });
    console.log("fd", fd);
    return fd;
  }, [filters, drugs]);

  return (
    <div className="p-5 grid grid-cols-4">
      <div className="col-span-1"></div>
      <div className="col-span-2">
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder="Start typing..."
          className="mb-2 block w-full rounded-lg border-0 py-4 text-lg text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6 px-5"
        />
        {search.length === 0 ? null : search.length > 0 && search.length < 3 ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">
              Enter atleast 3 characters
            </div>
          </div>
        ) : concepts.length > 0 ? (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <ul className="divide-y">
              {concepts.map((c) => {
                const displayName = `${c.name} ${c.strength} ${c.form}`
                  .trim()
                  .replace(/\s+/g, " ");
                const boldedContent = boldSubstring(displayName, search);
                return (
                  <li
                    key={c.mediSpanId}
                    className={`py-2 cursor-pointer hover:bg-gray-50`}
                    onClick={() => {
                      setSelectedConcept(c);
                    }}
                  >
                    <div className="text-sm">{boldedContent}</div>
                    <div className="text-xs	text-gray-400">
                      Name: {c.name} - Strength: {c.strength || "None"} - Form:{" "}
                      {c.form || "None"}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mb-4 block w-full rounded-lg border-0 py-4 text-gray-900 shadow-md px-5 ring-1 ring-inset ring-gray-300">
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        )}
      </div>
      <div className="col-span-1"></div>
    </div>
  );
}
