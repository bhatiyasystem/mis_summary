// Script to check Column V (index 21) and Column W (index 22) of Data sheet
// Run with: node scratch/check_vw_columns.cjs

const SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL || require('fs').readFileSync('.env', 'utf8')
  .split('\n').find(l => l.startsWith('VITE_APPS_SCRIPT_URL='))?.split('=').slice(1).join('=').trim() || '';

if (!SCRIPT_URL) {
  console.error("Could not read VITE_APPS_SCRIPT_URL from .env");
  process.exit(1);
}

async function checkColumns() {
  console.log("Fetching Data sheet...");
  const res = await fetch(`${SCRIPT_URL}?sheet=Data`);
  const result = await res.json();

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch Data sheet:", result);
    return;
  }

  const rows = result.data;
  console.log(`\nTotal rows (including header): ${rows.length}`);
  console.log("\n=== HEADER ROW (row 0) ===");
  const header = rows[0] || [];
  console.log(`Col V (index 21): "${header[21]}"`);
  console.log(`Col W (index 22): "${header[22]}"`);
  console.log(`Col U (index 20): "${header[20]}"`);
  console.log(`Col X (index 23): "${header[23]}"`);

  // Print ALL header columns to see full structure
  console.log("\n=== ALL HEADER COLUMNS ===");
  header.forEach((val, i) => {
    const colLetter = i < 26 ? String.fromCharCode(65 + i) : 'A' + String.fromCharCode(65 + (i - 26));
    console.log(`Col ${colLetter} (index ${i}): "${val}"`);
  });

  console.log("\n=== FIRST 5 DATA ROWS - Column V and W values ===");
  const dataRows = rows.slice(1); // skip header
  dataRows.slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i + 2}: Name="${row[4]}" | Task="${row[3]}" | V(21)="${row[21]}" | W(22)="${row[22]}"`);
  });

  // Also look for any row that has a value in col 21 or 22
  console.log("\n=== Rows WITH non-empty V or W columns ===");
  const filledRows = dataRows.filter(row => row[21] || row[22]);
  if (filledRows.length === 0) {
    console.log("⚠️  NO rows found with data in Column V or W!");
    console.log("This means fromDate/toDate are ALWAYS empty → no filtering happens.\n");
    
    // Find which columns have date-like values
    console.log("=== Scanning for date-like values across all columns (first 5 rows) ===");
    dataRows.slice(0, 5).forEach((row, i) => {
      row.forEach((val, ci) => {
        if (val && String(val).match(/202\d|date|from|to/i)) {
          const colLetter = ci < 26 ? String.fromCharCode(65 + ci) : 'A' + String.fromCharCode(65 + (ci - 26));
          console.log(`  Row ${i+2}, Col ${colLetter}(${ci}): "${val}"`);
        }
      });
    });
  } else {
    console.log(`Found ${filledRows.length} rows with V/W data:`);
    filledRows.slice(0, 10).forEach(row => {
      console.log(`  Name="${row[4]}" | V="${row[21]}" | W="${row[22]}"`);
    });
  }
}

checkColumns().catch(console.error);
