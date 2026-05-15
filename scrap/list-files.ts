import fs from "fs";
import path from "path";

const scrapDir = path.resolve(__dirname);

const files = fs.readdirSync(scrapDir);

console.log(`Files in /scrap (${files.length} total):`);
files.forEach((file) => {
  const fullPath = path.join(scrapDir, file);
  const stat = fs.statSync(fullPath);
  console.log(`  [${stat.isDirectory() ? "DIR " : "FILE"}] ${file}`);
});
