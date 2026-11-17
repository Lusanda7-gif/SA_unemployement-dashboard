fetch("unemployment_sa_2017_2024.csv")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    const result = Papa.parse(text, {
      header: true,
      delimiter: ";",
      skipEmptyLines: "greedy"
    });

    const rows = result.data.filter(function (row) {
      return row["Series Code"];
    });

    console.log(rows);
    console.log(rows.length);
  });