import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

function concatenateNameWithForm(results: any) {
  return results.flatMap((item: any) => {
    // Extract drug name
    const drugName = item.name;

    // Extract form names from relatedConcepts
    const formNames = item.relatedConcepts.flatMap((concept: any) =>
      concept.concepts.map((form: any) => form.name)
    );

    return formNames.map((formName: any) => `${drugName} ${formName}`);
  });
}

// Configuration variables
const API_BASE_URL = "https://mscservices.wolterskluwercdi.com/3";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${process.env.MEDISPAN_AUTH}`,
};
const CUSTOMER_TRANSACTION_ID = "1234";

const fetchYall = async (searchCriteria: any) => {
  const detailSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: searchCriteria,
    fields: ["name"],
    relatedConcepts: [
      {
        conceptType: "medispan/doseforms",
        fields: ["name"],
      },
    ],
  });

  const response = await axios.post(
    `${API_BASE_URL}/medispan/routeddrugs`,
    detailSearchData,
    { withCredentials: true, headers: HEADERS }
  );

  console.log(response);

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
    const searchCriteria = searchTerms.map((term) => ({
      field: "name",
      operator: "contains",
      value: term,
    }));

    const initialResults = await fetchYall(searchCriteria);
    const final = concatenateNameWithForm(initialResults);

    res.status(200).json({ results: final });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
