/**
 * One-time script: Extract COVID-19 daily case data from OWID CSV
 * and output a compact JSON file for the visualization.
 *
 * Usage:  node scripts/process-owid-data.mjs
 * Input:  scripts/owid-covid-data.csv  (download from OWID GitHub)
 * Output: src/data/case-data.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, "owid-covid-data.csv");
const outPath = join(__dirname, "..", "src", "data", "case-data.json");

// Date range: Dec 2019 through June 2021 (covers Ch 1-7 with buffer)
const START = "2019-12-01";
const END = "2021-07-01";

const csv = readFileSync(csvPath, "utf-8");
const lines = csv.split("\n");
const headers = lines[0].split(",");

// Find column indices
const iLocation = headers.indexOf("location");
const iDate = headers.indexOf("date");
const iSmoothed = headers.indexOf("new_cases_smoothed");

if (iLocation < 0 || iDate < 0 || iSmoothed < 0) {
  console.error("Missing expected columns in CSV");
  process.exit(1);
}

// Collect data keyed by date
const dateMap = new Map(); // date -> { g: global, u: us }

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Simple CSV parse (OWID data doesn't have quoted fields in these columns)
  const cols = line.split(",");
  const location = cols[iLocation];
  const date = cols[iDate];
  const smoothed = parseFloat(cols[iSmoothed]);

  if (date < START || date > END) continue;
  if (location !== "World" && location !== "United States") continue;

  if (!dateMap.has(date)) {
    dateMap.set(date, { d: date, g: 0, u: 0 });
  }

  const entry = dateMap.get(date);
  const val = isNaN(smoothed) ? 0 : Math.round(smoothed);

  if (location === "World") entry.g = val;
  if (location === "United States") entry.u = val;
}

// Sort by date and output
const result = [...dateMap.values()].sort((a, b) => (a.d < b.d ? -1 : 1));

writeFileSync(outPath, JSON.stringify(result), "utf-8");

console.log(`✓ Wrote ${result.length} entries to ${outPath}`);
console.log(`  Date range: ${result[0]?.d} → ${result[result.length - 1]?.d}`);
console.log(`  File size: ${(JSON.stringify(result).length / 1024).toFixed(1)} KB`);

// Show a few sample entries
console.log("\nSample entries:");
const samples = [0, 60, 100, 150, 200, result.length - 1];
for (const idx of samples) {
  if (result[idx]) {
    console.log(`  ${result[idx].d}  global: ${result[idx].g.toLocaleString()}  US: ${result[idx].u.toLocaleString()}`);
  }
}
