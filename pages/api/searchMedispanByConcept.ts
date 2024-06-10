// REGULAR WORKING

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// Configuration variables
const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3/medispan";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
};
const CUSTOMER_TRANSACTION_ID = "1234";

// Helper functions
const fetchInitialResults = async (searchCriteria: any) => {
  const initialSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: searchCriteria,
    fields: ["all"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/drugnames`,
    initialSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results?.slice(0, 50) ?? [];
};

const fetchDetailResults = async (mediSpanId: string) => {
  const detailSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: [
      {
        field: "mediSpanId",
        operator: "isEqualTo",
        value: mediSpanId,
      },
    ],
    fields: ["name"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/dispensabledrugs`,
    detailSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results[0] ?? null;
};

const fetchYall = async (searchCriteria: any) => {
  const detailSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: searchCriteria,
    fields: ["name"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/dispensabledrugs`,
    detailSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results ?? [];
};

const fetchDoseForm = async (doseFormId: string) => {
  const doseFormSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: [
      {
        field: "mediSpanId",
        operator: "isEqualTo",
        value: doseFormId,
      },
    ],
    fields: ["all"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/doseforms`,
    doseFormSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results[0]?.name ?? null;
};

// Detect search term type (name, strength, etc.)
const detectSearchType = (term: string) => {
  if (/^\d+$/.test(term)) {
    return { field: "strength", operator: "contains", value: term };
  }
  return { field: "name", operator: "contains", value: term };
};

// Main handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const { search } = req.query;

  try {
    const searchTerms = (search as string).split(" ");
    const searchCriteria = searchTerms.map((term) => detectSearchType(term));

    // Initial search for drug names
    // const initialResults = await fetchInitialResults(searchCriteria);
    const initialResults = await fetchYall(searchCriteria);

    // Fetch strengths and dose form, then concatenate
    // const detailedResults = await Promise.all(
    //   initialResults.map(async (drug: any) => {
    //     const detail = await fetchDetailResults(drug.mediSpanId);
    //     // console.log(detail.name);
    //     // console.log(drug.name);
    //     console.log("INITIAL");
    //     console.log(drug);
    //     const name = drug?.name || "";
    //     console.log("DETAIL");
    //     console.log(detail);
    //     const strength = detail?.strength ?? "";
    //     const doseFormId = detail?.doseForm?.value;

    //     let doseForm = "";
    //     if (doseFormId) {
    //       doseForm = await fetchDoseForm(doseFormId);
    //     }

    //     const form = doseForm ?? "";

    //     return {
    //       mediSpanId: drug.mediSpanId,
    //       name,
    //       strength,
    //       form,
    //     };
    //   })
    // );

    const uniqueResults = initialResults.reduce((acc: any, current: any) => {
      if (!acc.some((item: any) => item === current.name)) {
        acc.push(current.name);
      }
      return acc;
    }, []);

    res.status(200).json({ results: uniqueResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

// STENGTHS WORKING????

// import axios from "axios";
// import { NextApiRequest, NextApiResponse } from "next";

// // Configuration variables
// const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3/medispan";
// const HEADERS = {
//   "Content-Type": "application/json",
//   Accept: "application/json",
//   Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
// };
// const CUSTOMER_TRANSACTION_ID = "1234";

// // Helper functions
// const fetchInitialResults = async (search: string) => {
//   const initialSearchData = JSON.stringify({
//     customerTransactionId: CUSTOMER_TRANSACTION_ID,
//     criteria: [
//       {
//         field: "name",
//         operator: "contains",
//         value: search,
//       },
//     ],
//     fields: ["all"],
//   });

//   const response = await axios.post(
//     `${API_BASE_URL}/drugnames`,
//     initialSearchData,
//     { withCredentials: true, headers: HEADERS }
//   );

//   return response?.data?.results?.slice(0, 50) ?? [];
// };

// const fetchDetailResults = async (mediSpanId: string, strength?: string) => {
//   const criteria = [
//     {
//       field: "mediSpanId",
//       operator: "isEqualTo",
//       value: mediSpanId,
//     },
//   ];

//   if (strength) {
//     console.log("SEARCHING WITH: ", strength);
//     criteria.push({
//       field: "strength",
//       operator: "contains",
//       value: strength,
//     });
//   }

//   const detailSearchData = JSON.stringify({
//     customerTransactionId: CUSTOMER_TRANSACTION_ID,
//     criteria: criteria,
//     fields: ["all"],
//   });

//   const response = await axios.post(
//     `${API_BASE_URL}/dispensabledrugs`,
//     detailSearchData,
//     { withCredentials: true, headers: HEADERS }
//   );

//   return response?.data?.results[0] ?? null;
// };

// const fetchDoseForm = async (doseFormId: string) => {
//   const doseFormSearchData = JSON.stringify({
//     customerTransactionId: CUSTOMER_TRANSACTION_ID,
//     criteria: [
//       {
//         field: "id",
//         operator: "isEqualTo",
//         value: doseFormId,
//       },
//     ],
//     fields: ["all"],
//   });

//   const response = await axios.post(
//     `${API_BASE_URL}/doseforms`,
//     doseFormSearchData,
//     { withCredentials: true, headers: HEADERS }
//   );

//   return response?.data?.results[0]?.name ?? null;
// };

// // Detect search term type (name, strength, etc.)
// const detectSearchType = (term: string) => {
//   if (/^\d+$/.test(term)) {
//     return { type: "strength", value: term };
//   }
//   return { type: "name", value: term };
// };

// // Main handler
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "GET") {
//     res.statusCode = 405;
//     return res.end("Method Not Allowed");
//   }

//   const { search } = req.query;

//   try {
//     const searchTerms = (search as string).split(" ");
//     const searchCriteria = searchTerms.map((term) => detectSearchType(term));

//     // Separate name and strength terms
//     const nameTerms = searchCriteria
//       .filter((term) => term.type === "name")
//       .map((term) => term.value)
//       .join(" ");
//     const strengthTerms = searchCriteria
//       .filter((term) => term.type === "strength")
//       .map((term) => term.value);

//     // Initial search for drug names
//     const initialResults = await fetchInitialResults(nameTerms);

//     // Fetch strengths and dose form, then concatenate
//     const detailedResults = await Promise.all(
//       initialResults.map(async (drug: any) => {
//         let detail;
//         if (strengthTerms.length > 0) {
//           for (const strength of strengthTerms) {
//             detail = await fetchDetailResults(drug.mediSpanId, strength);
//             if (detail) break;
//           }
//         } else {
//           detail = await fetchDetailResults(drug.mediSpanId);
//         }

//         const name = detail?.name || drug?.name || "";
//         const strength = detail?.strength ?? "";
//         const doseFormId = detail?.doseForm?.value;

//         let doseForm = "";
//         if (doseFormId) {
//           doseForm = await fetchDoseForm(doseFormId);
//         }

//         return {
//           mediSpanId: drug.mediSpanId,
//           name: name,
//           strength,
//           form: doseForm ?? "",
//         };
//       })
//     );

//     res.status(200).json({ results: detailedResults });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// }

// import axios from "axios";
// import { NextApiRequest, NextApiResponse } from "next";

// // Configuration variables
// const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3/medispan";
// const HEADERS = {
//   "Content-Type": "application/json",
//   Accept: "application/json",
//   Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
// };
// const CUSTOMER_TRANSACTION_ID = "1234";

// // Helper functions
// const fetchInitialResults = async (searchTerm: string) => {
//   const initialSearchData = JSON.stringify({
//     customerTransactionId: CUSTOMER_TRANSACTION_ID,
//     criteria: [
//       {
//         field: "name",
//         operator: "contains",
//         value: searchTerm,
//       },
//     ],
//     fields: ["all"],
//   });

//   const response = await axios.post(
//     `${API_BASE_URL}/drugnames`,
//     initialSearchData,
//     { withCredentials: true, headers: HEADERS }
//   );

//   return response?.data?.results?.slice(0, 100) ?? [];
// };

// const fetchDetailResults = async (mediSpanId: string) => {
//   const detailSearchData = JSON.stringify({
//     customerTransactionId: CUSTOMER_TRANSACTION_ID,
//     criteria: [
//       {
//         field: "mediSpanId",
//         operator: "isEqualTo",
//         value: mediSpanId,
//       },
//     ],
//     fields: ["all"],
//   });

//   const response = await axios.post(
//     `${API_BASE_URL}/dispensabledrugs`,
//     detailSearchData,
//     { withCredentials: true, headers: HEADERS }
//   );

//   return response?.data?.results ?? [];
// };

// // Main handler
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "GET") {
//     res.statusCode = 405;
//     return res.end("Method Not Allowed");
//   }

//   const { search } = req.query;

//   try {
//     // Initial search for drug names
//     const initialResults = await fetchInitialResults(search as string);

//     // Fetch strengths for each drug
//     const detailedResults = await Promise.all(
//       initialResults.map(async (drug: any) => {
//         const details = await fetchDetailResults(drug.mediSpanId);
//         const strengths = details.map((detail: any) => detail.strength);

//         return {
//           mediSpanId: drug.mediSpanId,
//           name: drug.name,
//           strengths: strengths,
//         };
//       })
//     );

//     res.status(200).json({ results: detailedResults });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// }
