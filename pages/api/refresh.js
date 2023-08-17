import axios from "axios";

const refresh = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } else {
    try {
      const response = await axios.post(
        "https://api.drugbank.com/v1/tokens",
        { ttl: "15m" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.DRUG_BANK_AUTH,
            "Cache-Control": "no-cache",
          },
        }
      );

      const token = response.data.token;
      res.statusCode = 200;
      res.end(token);
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.statusCode = 500;
      res.json({ error: "Failed to refresh token" });
    }
  }
};

export default refresh;
