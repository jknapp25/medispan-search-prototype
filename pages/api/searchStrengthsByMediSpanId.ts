import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
};
const CUSTOMER_TRANSACTION_ID = "1234";

const fetchStrengths = async (mediSpanId: any) => {
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
    count: "25",
    relatedConcepts: [
      {
        conceptType: "medispan/dispensabledrugs",
        fields: ["name", "strength"],
      },
    ],
  });

  const response = await axios.post(
    `${API_BASE_URL}/medispan/routeddrugs`,
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
    const initialResults = await fetchStrengths(search);

    const strengths = initialResults[0].relatedConcepts[0].concepts.map(
      (c: any) => c.strength
    );

    const unique = [...new Set(strengths)];

    res.status(200).json({ results: unique });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
