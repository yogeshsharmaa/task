import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';

const prefix = 'https://www.volvocars.com';
const delayBR = 250; 
const inputFile = 'input.txt';
const outputFile = 'output.txt';

// Function to check URL with header
async function checkURL(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (response.status === 403) {
            console.log(`403 Forbidden: ${url}`);
            return false;
        } else if (!response.ok) { 
            console.log(`Error: ${url}`);
            return false;
        }
        else {
            console.log(`URL is valid: ${url}`);
        }
        return true;
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return false;
    }
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to process the file 
async function processFile(inputFile, outputFile) {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const validLines = [];

    for await (const line of rl) {
        if (line.startsWith('/')) {
            const parts = line.split(/\s+/); 
            const path = parts[0]; 
            const completeURL = `${prefix}${path.trim()}`; 
            const isValid = await checkURL(completeURL);
            if (isValid) {
                validLines.push(line);
            }
            await delay(delayBR); 
        } else {
            validLines.push(line); // Keep lines that don't start with '/' (comments or other data)
        }
    }

    // Write valid lines to output file
    fs.writeFileSync(outputFile, validLines.join('\n'), 'utf8');
}

processFile(inputFile, outputFile).then(() => {
    console.log("All URLs checked and valid lines written to output file.");
    process.exit(0);
}).catch(error => {
    console.error("Error occurred while processing URLs:", error);
    process.exit(1);
});
