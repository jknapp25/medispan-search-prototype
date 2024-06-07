import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const { search } = req.query;

  const data = JSON.stringify({
    customerTransactionId: "1234",
    criteria: [
      {
        field: "name",
        operator: "startsWith",
        value: search,
      },
    ],
    fields: ["all"],
  });
  try {
    const results = await axios.post(
      "https://mscservices.wolterskluwercdi.com/3/medispan/packageddrugs",
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Basic cGhvdG9uaGx0aDoyN1U1RkpHMw==",
        },
      }
    );
    res.status(200).json({ results: results.data.results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
