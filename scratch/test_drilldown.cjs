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

  const headerRow = dataResult.data[0] || [];
  const globalFromDate = headerRow[21] ? String(headerRow[21]).trim() : "";
  const globalToDate = headerRow[22] ? String(headerRow[22]).trim() : "";
  console.log(`Global Date Range from Header: From "${globalFromDate}" To "${globalToDate}"`);

  const dataRows = dataResult.data;
  
  // Find the task for Afroj Begam
  const targetEmployee = "Afroj Begam";
  let targetRow = null;

  for (let i = 1; i < dataRows.length; i++) {
    const row = dataRows[i];
    const dataName = String(row[4] || "").trim();
    if (dataName === targetEmployee && String(row[3]).includes("Checklist Task")) {
      targetRow = row;
      break;
    }
  }

  if (!targetRow) return;

  const fmsSheetId = targetRow[5]; 
  const plannedSheetRef = targetRow[7]; 
  const actualSheetRef = targetRow[8]; 
  const nameColRef = targetRow[9]; 
  const taskNameColRef = targetRow[26]; 
  // Simulate logic from Dashboard.jsx
  const fromDateRaw = String(targetRow[21] || "").trim();
  const toDateRaw = String(targetRow[22] || "").trim();
  
  const fromDate = fromDateRaw || globalFromDate;
  const toDate = toDateRaw || globalToDate;

  console.log(`\nTask Data: Name=${targetRow[4]}, fromDate="${fromDate}", toDate="${toDate}"`);

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

  console.log(`\n3. Fetching FMS Sheet '${pRef.sheetName}' from Spreadsheet ID '${fmsSheetId}'...`);
  const fmsRes = await fetch(`${SCRIPT_URL}?sheet=${encodeURIComponent(pRef.sheetName)}&spreadsheetId=${encodeURIComponent(fmsSheetId)}`);
  const fmsResult = await fmsRes.json();
  const fmsRows = fmsResult.data;
  console.log(`Fetched ${fmsRows.length} rows from FMS sheet.`);

  const parseFilterDate = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal > 1000 && numVal < 100000) {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(epoch.getTime() + numVal * 24 * 60 * 60 * 1000);
    }
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }
    const datePart = str.split(' ')[0];
    const parts = datePart.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const filterFrom = parseFilterDate(fromDate);
  const filterTo = parseFilterDate(toDate);
  if (filterTo) filterTo.setHours(23, 59, 59, 999);

  console.log(`[DrillDown Filter] filterFrom: ${filterFrom}, filterTo: ${filterTo}`);

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
}

testDrillDown();
