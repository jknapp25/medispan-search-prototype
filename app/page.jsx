"use client";
import { data } from "autoprefixer";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [filters, setFilters] = useState(new Set());
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    const searchConcepts = async () => {
      if (search) {
        setDrugs([]);
        setSelectedDrug(null);
        setFilters(new Set());
        const response = await fetch(`/api/searchByConcept?search=${search}`);
        const data = await response.json();
        console.log(data);
        setDataCount(data.length);
        setConcepts(
          data
            ? data
                .filter((c) => c.standing === "active")
                .filter((c) => c.regions.us)
                .filter((c) => c.rxnorm_concepts.length > 0 || c.brand)
            : []
        );
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
    <div className="p-5 grid grid-cols-3 divide-x">
      <div className="px-4">
        <h1 className="text-lg mb-4 font-bold	">
          1. Search{dataCount > 0 ? `, ${concepts.length} / ${dataCount}` : ""}
        </h1>
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className="mb-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
        />
        <ul className="divide-y">
          {concepts.map((c) => (
            <li
              key={c.drugbank_pcid}
              className={`py-2 cursor-pointer ${
                c?.rxnorm_concepts?.length === 0 &&
                selectedConcept?.drugbank_pcid !== c.drugbank_pcid
                  ? "bg-red-50"
                  : ""
              } ${
                selectedConcept?.drugbank_pcid === c.drugbank_pcid
                  ? "bg-blue-200"
                  : ""
              }`}
              onClick={() => {
                setSelectedConcept(c);
              }}
            >
              <div className="text-sm">{c.name}</div>
              <div className="text-xs	">Drug Bank ID: {c.drugbank_pcid}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* drug filter */}
      <div className="px-4">
        <h1 className="text-lg mb-4 font-bold	">2. Filter</h1>
        {drugs.length > 0 && (
          <>
            <h2 className="my-4 font-bold	">Forms</h2>
            <ul className="divide-y flex flex-wrap">
              {drugForms.map((f) => (
                <li
                  key={f}
                  className={`rounded-full cursor-pointer px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ${
                    filters.has(f) ? "bg-blue-200" : "bg-gray-200"
                  }`}
                  onClick={() => {
                    setFilterCallback(f);
                  }}
                >
                  <div className="text-sm">{f}</div>
                </li>
              ))}
            </ul>
            <h2 className="my-4 font-bold	">Route</h2>
            <ul className="divide-y flex flex-wrap">
              {drugRoutes.map((r) => (
                <li
                  key={r}
                  className={`rounded-full cursor-pointer px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ${
                    filters.has(r) ? "bg-blue-200" : "bg-gray-200"
                  }`}
                  onClick={() => {
                    setFilterCallback(r);
                  }}
                >
                  <div className="text-sm">{r}</div>
                </li>
              ))}
            </ul>
            <h2 className="my-4 font-bold	">Strength</h2>
            <ul className="divide-y flex flex-wrap">
              {drugStrengths.map((s) => (
                <li
                  key={s}
                  className={`rounded-full cursor-pointer px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ${
                    filters.has(s) ? "bg-blue-200" : "bg-gray-200"
                  }`}
                  onClick={() => {
                    setFilterCallback(s);
                  }}
                >
                  <div className="text-sm">{s}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* drug list */}
      <div className="px-4">
        <h1 className="text-lg mb-4 font-bold	">3. Select</h1>
        <ul className="divide-y">
          {filteredDrugs.map((d) => (
            <li
              key={d.ndc_product_code}
              className={`py-2 cursor-pointer ${
                selectedDrug?.ndc_product_code === d.ndc_product_code
                  ? "bg-blue-200"
                  : ""
              }`}
              onClick={() => {
                setSelectedDrug(d);
              }}
            >
              <div>
                {d?.rx_norm_prescribable_name ||
                  d?.prescribable_name ||
                  d?.name}
              </div>
              <div className="text-xs	">
                {d.dosage_form} - {d.route}
                {/* - {d?.labeller?.name} */}
              </div>
              <div className="text-xs	text-gray-400">
                NDC Code: {d.ndc_product_code}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
