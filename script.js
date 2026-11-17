
let records = [];


// Convert text into numbers
function toNumber(value) {
  return parseFloat(String(value).replace(",", "."));
}


// Fill the Year dropdown
function fillYears() {

  const select = document.getElementById("SelectYear");
  const years = [];

  // Get unique years from records
  records.forEach(record => {
    if (!years.includes(record.year)) {
      years.push(record.year);
    }
  });

  // Sort years from oldest to newest
  years.sort((a, b) => a - b);

  // Add years to dropdown
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  });

  // Select the latest year
  if (years.length > 0) {
    select.value = years[years.length - 1];
  }
}


// Find a specific unemployment value
function getValue(education, gender, year) {

  for (let i = 0; i < records.length; i++) {

    if (
      records[i].education === education &&
      records[i].gender === gender &&
      records[i].year === year
    ) {
      return records[i].value;
    }
  }

  return null;
}


// Calculate and display dashboard statistics
function updateStatistics() {

  if (records.length === 0) {
    return;
  }

  // Get selected education
  const education = document.getElementById("SelectEducation").value;

  // Get Total records for selected education
  const totals = records.filter(record =>
    record.education === education &&
    record.gender === "Total"
  );

  // Calculate average unemployment rate
  let sum = 0;

  totals.forEach(record => {
    sum += record.value;
  });

  const average = totals.length > 0
    ? sum / totals.length
    : 0;

  // Find the highest unemployment rate
  let highest = null;

  totals.forEach(record => {
    if (highest === null || record.value > highest.value) {
      highest = record;
    }
  });

  // Display average
  document.getElementById("avgRate").textContent =
    totals.length > 0 ? average.toFixed(1) + "%" : "--";

  // Display highest unemployment year
  document.getElementById("highestYear").textContent =
    highest ? highest.year : "--";
}


// Load the CSV file
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

    // fix the data
    rows.forEach(row => {

      let education = "Unknown";
      let gender = "Total";

      // Identify education level
      if (row["Series Code"].includes("ADVN")) {
        education = "Advanced";
      } else if (row["Series Code"].includes("INTM")) {
        education = "Intermediate";
      } else if (row["Series Code"].includes("BASC")) {
        education = "Basic";
      }

      // Identify gender
      if (row["Series Code"].includes(",FE,")) {
        gender = "Female";
      } else if (row["Series Code"].includes(",MA,")) {
        gender = "Male";
      }

      // Extract years and values
      Object.keys(row).forEach(column => {

        if (column.includes("[YR")) {

          const year = parseInt(column.slice(0, 4));
          const value = toNumber(row[column]);

          if (!isNaN(value)) {

            records.push({
              year: year,
              education: education,
              gender: gender,
              value: value
            });

          }
        }
      });
    });

    // Display results in console
    console.log("Final records:", records);
    console.log("Number of records:", records.length);
    console.log("First record:", records[0]);

    // Fill dropdown and update statistics
    fillYears();
    updateStatistics();

  })

  .catch(error => {
    console.log("Error loading CSV:", error);
  });


// Update statistics when education changes
document.getElementById("SelectEducation")
  .addEventListener("change", updateStatistics);
