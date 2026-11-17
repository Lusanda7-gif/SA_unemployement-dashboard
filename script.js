
let records = [];

function toNumber(value) {
  return parseFloat(String(value).replace(",", "."));
}


function fillYears() {

  // Find the year dropdown
  const select = document.getElementById("SelectYear");

  // Create an empty list for years
  const years = [];

  // Get years from the records
  records.forEach(record => {
    if (!years.includes(record.year)) {
      years.push(record.year);
    }
  });

  // Sort years from oldest to newest
  years.sort((a, b) => a - b);

  // Add years to the dropdown
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  });

  // Select the latest year
  select.value = years[years.length - 1];
}


fetch("unemployment_sa_2017_2024.csv")
  .then(response => response.text())
  .then(text => {

    // Read the CSV file
    const result = Papa.parse(text, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true
    });

    // Remove empty rows
    const rows = result.data.filter(row => row["Series Code"]);

    console.log("Original rows:", rows);
    console.log("Number of rows:", rows.length);

    // Change the data into a simpler format
    rows.forEach(row => {

      let education = "Unknown";
      let gender = "Total";

      if (row["Series Code"].includes("ADVN")) {
        education = "Advanced";
      } else if (row["Series Code"].includes("INTM")) {
        education = "Intermediate";
      } else if (row["Series Code"].includes("BASC")) {
        education = "Basic";
      }

      if (row["Series Code"].includes(",FE,")) {
        gender = "Female";
      } else if (row["Series Code"].includes(",MA,")) {
        gender = "Male";
      }

      // Get the values for each year
      Object.keys(row).forEach(column => {

        if (column.includes("[YR")) {
          let year = parseInt(column.slice(0, 4));
          let value = toNumber(row[column]);

          if (!isNaN(value)) {
            records.push({
              year: year,
              education: education,
              gender: gender,
              value: value});} }}); });

    console.log("Final records:", records);
    console.log("Number of records:", records.length);
    console.log("First record:", records[0]);

    // Fill the Year dropdown
    fillYears();

  });
