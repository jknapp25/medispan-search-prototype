import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

function concatenateNameWithForm(results: any) {
  return results.flatMap((item: any) => {
    let nameParts: any = [];
    let mediSpanId = null;
    item.relatedConcepts.forEach((itm: any) => {
      if (itm.conceptType === "medispan/routeddrugs") {
        nameParts.push(itm.concepts[0].name);
        mediSpanId = itm.concepts[0].mediSpanId;
      }

      if (itm.conceptType === "medispan/doseforms") {
        nameParts.push(itm.concepts[0].name);
      }
    });

    return {
      name: nameParts.join(" "),
      mediSpanId,
    };
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

const fetch = async (searchCriteria: any) => {
  const detailSearchData = JSON.stringify({
    customerTransactionId: CUSTOMER_TRANSACTION_ID,
    criteria: searchCriteria,
    fields: ["name"],
    relatedConcepts: [
      {
        conceptType: "medispan/routeddrugs",
        fields: ["name", "mediSpanId"],
      },
      {
        conceptType: "medispan/doseforms",
        fields: ["name"],
      },
    ],
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
    const final = concatenateNameWithForm(initialResults);

    const uniqueResults = final.reduce((acc: any, current: any) => {
      if (!acc.some((item: any) => item.name === current.name)) {
        acc.push(current);
      }
      return acc;
    }, []);
    // console.log(uniqueResults);

    res.status(200).json({ results: uniqueResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
