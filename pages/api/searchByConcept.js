const searchByConcept = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const { search } = req.query;

  if (!search) {
    res.statusCode = 400;
    return res.json({ error: "Search parameter is required" });
  }

  const myHeaders = new Headers();
  myHeaders.append("Authorization", process.env.DRUG_BANK_AUTH);

  try {
    const response = await fetch(
      `https://api.drugbank.com/v1/product_concepts?q=${search}`,
      {
        method: "GET",
        headers: myHeaders,
      }
    );
    if (!response.ok) {
      throw new Error("API Response not OK");
    }

    const data = await response.json();
    res.statusCode = 200;
    res.json(data);
  } catch (error) {
    res.statusCode = 500;
    res.json({ error: "Unable to fetch data" });
  }
};

export default searchByConcept;
