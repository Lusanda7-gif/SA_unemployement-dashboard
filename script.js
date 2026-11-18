
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

let lineChartObject = null;

function updateLineChart() {

  // Get selected education level
  const education = document.getElementById("SelectEducation").value;

  // Collect all available years
  const years = [];

  records.forEach(record => {
    if (!years.includes(record.year)) {
      years.push(record.year);
    }
  });

  // Sort years
  years.sort((a, b) => a - b);

  // Get female and male unemployment values
  const femaleData = years.map(year =>
    getValue(education, "Female", year)
  );

  const maleData = years.map(year =>
    getValue(education, "Male", year)
  );

  // Remove the old chart
  if (lineChartObject) {
    lineChartObject.destroy();
  }

  // Create the new line chart
  lineChartObject = new Chart(document.getElementById("lineChart"), {

    type: "line",

    data: {
      labels: years,

      datasets: [
        {
          label: "Female",
          data: femaleData,
          borderColor: "#e63946",
          tension: 0.3
        },
        {
          label: "Male",
          data: maleData,
          borderColor: "#1d3557",
          tension: 0.3
        }
      ]
    },

    options: {
      responsive: true,

      scales: {
        y: {
          title: {
            display: true,
            text: "Unemployment rate (%)"
          }
        }
      }
    }
  });
}


let barChartObject = null;

function updateBarChart() {

  // Get the selected year
  const year = parseInt(document.getElementById("SelectYear").value);
console.log("Selected year:", year);
  // Education levels to compare
  const levels = ["Basic", "Intermediate", "Advanced"];

  // Get female and male unemployment rates
  const femaleData = levels.map(level =>
    getValue(level, "Female", year)
  );

  const maleData = levels.map(level =>
    getValue(level, "Male", year)
  );

  // Display data in console for testing
console.log("Selected year:", year);
console.log("Female data:", femaleData);
console.log("Male data:", maleData);
  // Remove the previous chart
  if (barChartObject) {
    barChartObject.destroy();
  }

  // Create the bar chart
  barChartObject = new Chart(document.getElementById("barChart"), {

    type: "bar",

    data: {
      labels: levels,

      datasets: [
        {
          label: "Female",
          data: femaleData,
          backgroundColor: "#e63946"
        },
        {
          label: "Male",
          data: maleData,
          backgroundColor: "#1d3557"
        }
      ]
    },

    options: {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Unemployment rate (%)"
          }
        }
      }
    }
  });
}


let gapChartObject = null;

function updateGapChart() {

  // Get selected education level
  const education = document.getElementById("SelectEducation").value;

  // Collect all years
  const years = [];

  records.forEach(record => {
    if (!years.includes(record.year)) {
      years.push(record.year);
    }
  });

  // Sort years
  years.sort((a, b) => a - b);

  // Calculate the gender gap for each year
  const gapData = years.map(year => {

    const female = getValue(education, "Female", year);
    const male = getValue(education, "Male", year);

    if (female === null || male === null) {
      return null;
    }

    return Number((female - male).toFixed(2));
  });

  // Remove the previous chart
  if (gapChartObject) {
    gapChartObject.destroy();
  }

  // Create the line chart
  gapChartObject = new Chart(document.getElementById("gapChart"), {

    type: "line",

    data: {
      labels: years,

      datasets: [
        {
          label: "Female minus male",
          data: gapData,
          borderColor: "#2a9d8f",
          backgroundColor: "#2a9d8f",
          tension: 0.3
        }
      ]
    },

    options: {
      responsive: true,

      scales: {
        y: {
          title: {
            display: true,
            text: "Gap (percentage points)"
          }
        }
      }
    }
  });
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
    updateLineChart();
    updateBarChart();
    updateGapChart();
  })

  .catch(error => {
    console.log("Error loading CSV:", error);
  });


// Update statistics when education changes
document.getElementById("SelectEducation")
  .addEventListener("change", updateStatistics);
  document.getElementById("SelectEducation")
  .addEventListener("change", updateLineChart);
document.getElementById("SelectYear")
  .addEventListener("change", updateBarChart);
  document.getElementById("SelectEducation")
  .addEventListener("change", updateGapChart);