const fs = require('fs');

async function testDrillDown() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDjU2-nlA5awiEkKWBOd5cWL8X2-q8KyYqZnACDIY_WY549GneFqo59W-DbswSOh5YUw/exec';
  const MASTER_SHEET_ID = '1qlSZ41zJ2vh_7o8LxQJgoWx7c2pEOnf41wmiuL1iup4';

  console.log("1. Fetching Master Data sheet...");
  const dataRes = await fetch(`${SCRIPT_URL}?sheet=Data&spreadsheetId=${MASTER_SHEET_ID}`);
  const dataResult = await dataRes.json();
  
  if (!dataResult.success) {
    console.error("Failed to fetch Data sheet");
    return;
  }

  const dataRows = dataResult.data;
  console.log(`Fetched ${dataRows.length} rows from Master Data sheet.`);

  // Find the task for Ayush Satimade
  const targetEmployee = "Ayush Satimade";
  let targetRow = null;

  // Header is row 0, data starts at row 1
  for (let i = 1; i < dataRows.length; i++) {
    const row = dataRows[i];
    const dataName = String(row[4] || "").trim(); // Column E is Person Name in mapping? Wait, handleRowClick maps row[4]
    if (dataName === targetEmployee && String(row[3]).includes("Checklist Task")) {
      targetRow = row;
      break;
    }
  }

  if (!targetRow) {
    console.error("Could not find Checklist Task for Ayush Satimade");
    return;
  }

  console.log("\n2. Found Target Row in Master Data Sheet:");
  console.log(`FMS Name: ${targetRow[2]}`);
  console.log(`Task Name: ${targetRow[3]}`);
  
  const fmsSheetId = targetRow[5]; // Column F
  const plannedSheetRef = targetRow[7]; // Column H
  const actualSheetRef = targetRow[8]; // Column I
  const nameColRef = targetRow[9]; // Column J
  const taskNameColRef = targetRow[26]; // Column AA
  const fromDate = targetRow[21]; // Column V
  const toDate = targetRow[22]; // Column W

  console.log(`FMS Sheet ID: ${fmsSheetId}`);
  console.log(`Planned Sheet Ref: ${plannedSheetRef}`);
  console.log(`Name Col Ref: ${nameColRef}`);
  console.log(`Date Range: From ${fromDate} To ${toDate}`);

  const parseSheetRef = (ref) => {
    if (!ref) return null;
    const str = String(ref).trim();
    const bangIndex = str.indexOf("!");
    if (bangIndex === -1) return { sheetName: str, colIndex: -1, startRowIndex: 0 };
    const sheetName = str.substring(0, bangIndex);
    const rangePart = str.substring(bangIndex + 1);
    const colMatch = rangePart.match(/^([A-Za-z]+)(\d*)/);
    if (!colMatch) return { sheetName, colIndex: -1, startRowIndex: 0 };
    const colLetter = colMatch[1].toUpperCase();
    let colIndex = 0;
    for (let i = 0; i < colLetter.length; i++) { colIndex = colIndex * 26 + (colLetter.charCodeAt(i) - 64); }
    colIndex -= 1;
    const startRow = colMatch[2] ? parseInt(colMatch[2]) : 1;
    const startRowIndex = startRow > 0 ? startRow - 1 : 0;
    return { sheetName, colIndex, startRowIndex };
  };

  const pRef = parseSheetRef(plannedSheetRef);
  const nRef = parseSheetRef(nameColRef);
  const aRef = parseSheetRef(actualSheetRef);
  const tRef = parseSheetRef(taskNameColRef);

  if (!pRef || !nRef) {
    console.error("Invalid sheet references");
    return;
  }

  console.log(`\n3. Fetching FMS Sheet '${pRef.sheetName}' from Spreadsheet ID '${fmsSheetId}'...`);
  const fmsRes = await fetch(`${SCRIPT_URL}?sheet=${encodeURIComponent(pRef.sheetName)}&spreadsheetId=${encodeURIComponent(fmsSheetId)}`);
  const fmsResult = await fmsRes.json();

  if (!fmsResult.success) {
    console.error("Failed to fetch FMS sheet");
    return;
  }

  const fmsRows = fmsResult.data;
  console.log(`Fetched ${fmsRows.length} rows from FMS sheet.`);

  const parseFilterDate = (val) => {
    if (!val) return null;
    const str = String(val).trim();
    const datePart = str.split(' ')[0];
    const parts = datePart.split(/[-/]/);
    if (parts.length === 3 && parts[2].length === 4) {
       return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const filterFrom = parseFilterDate(fromDate);
  const filterTo = parseFilterDate(toDate);
  if (filterTo) filterTo.setHours(23, 59, 59, 999);

  console.log(`\n4. Filtering rows for '${targetEmployee}' and Date Range: ${filterFrom} to ${filterTo}`);

  const drillDownRows = [];
  let totalPersonMatches = 0;

  for (let i = nRef.startRowIndex; i < fmsRows.length; i++) {
    const row = fmsRows[i];
    if (!row) continue;

    const nameInSheet = String(row[nRef.colIndex] || "").trim();
    if (nameInSheet === targetEmployee) {
      totalPersonMatches++;
      
      const plannedDate = String(row[pRef.colIndex] || "").trim();
      const actualDate = String(row[aRef.colIndex] || "").trim();
      const taskDesc = String(row[tRef?.colIndex] || "").trim();

      if (!plannedDate) continue;

      let inRange = true;
      const pDateObj = parseFilterDate(plannedDate);
      if (pDateObj) {
         if (filterFrom && pDateObj < filterFrom) inRange = false;
         if (filterTo && pDateObj > filterTo) inRange = false;
      }

      if (inRange) {
        drillDownRows.push({
          taskName: taskDesc,
          planned: plannedDate,
          actual: actualDate
        });
      }
    }
  }

  console.log(`\n[Results]`);
  console.log(`Total rows assigned to ${targetEmployee} in FMS: ${totalPersonMatches}`);
  console.log(`Total rows after applying Date Range Filter: ${drillDownRows.length}`);
  console.log(`\nSample of filtered rows:`);
  console.log(drillDownRows.slice(0, 3));
  
  fs.writeFileSync('drilldown_test_output.json', JSON.stringify(drillDownRows, null, 2));
}

testDrillDown();
