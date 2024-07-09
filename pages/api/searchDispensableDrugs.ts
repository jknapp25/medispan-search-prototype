import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// Configuration variables
const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
};
const CUSTOMER_TRANSACTION_ID = "1234";

const fetch = async (searchCriteria: any) => {
  const detailSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: searchCriteria,
    count: "25",
    fields: ["name"],
  });

  const response = await axios.post(
    `${API_BASE_URL}/medispan/dispensabledrugs`,
    detailSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  return response?.data?.results ?? [];
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
    const searchCriteria = searchTerms.map((term, i) => ({
      field: "name",
      operator: i === 0 ? "startsWith" : "contains",
      value: term,
    }));

    const initialResults = await fetch(searchCriteria);

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
