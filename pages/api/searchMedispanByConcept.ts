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
const fetchInitialResults = async (search: string) => {
  const initialSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: [
      {
        field: "name",
        operator: "contains",
        value: search,
      },
    ],
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
    fields: ["all"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/dispensabledrugs`,
    detailSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results[0] ?? [];
};

const fetchDoseForm = async (doseFormId: string) => {
  const doseFormSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: [
      {
        field: "id",
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

  console.log("form: ", response?.data?.results[0]?.name);

  return response?.data?.results[0]?.name ?? null;
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
    // Initial search for drug names
    const initialResults = await fetchInitialResults(search as string);

    // Fetch strengths and dose form, then concatenate
    const detailedResults = await Promise.all(
      initialResults.map(async (drug: any) => {
        const detail = await fetchDetailResults(drug.mediSpanId);
        const name = drug?.name ?? "";
        const strength = detail?.strength ?? "";
        const doseFormId = detail?.doseForm?.value;

        let doseForm = "";
        if (doseFormId) {
          doseForm = await fetchDoseForm(doseFormId);
        }

        const form = doseForm ?? "";

        return {
          mediSpanId: drug.mediSpanId,
          name: name,
          strength,
          form,
        };
      })
    );

    res.status(200).json({ results: detailedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
