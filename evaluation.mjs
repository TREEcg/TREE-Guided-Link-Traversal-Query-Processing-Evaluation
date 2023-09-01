import fs from 'fs';
import path from "path";
import { Command } from 'commander';
import { execSync } from 'child_process';


const program = new Command();
program
    .name('evaluation')
    .description('CLI program to run a TREE evaluation')
    .version('0.0.0')

    .requiredOption('-n, --number-repetition <number>', 'The number of repetion for each test cases', 20)
    .requiredOption('-t, --topology <string>', 'The topology of the TREE document')
    .requiredOption('-m, --mode <mode>', 'The configuration of the engine', 'TREE')
    .requiredOption('--dataset-name <string>','The name of the dataset')

    .option('-d, --demo-mode', "Don't record the results and do three repetition of two filter expression and triple pattern", false)
    .option('-s, --space-size <number>', 'The memory size for the SPARQL engine', 10_000)
    .option('--timeout <number>', 'The timeout of the query', 60)

    .parse(process.argv);

const options = program.opts();
const demoMode = options.demoMode;
const nRepetition = demoMode ? 3 : options.numberRepetition;
const mode = options.mode;
const topology = options.topology;
const memorySize = options.spaceSize;
const timeout = options.timeout;
const datasetName = options.datasetName;

if (demoMode) {
    console.log('DEMO MODE');
}
let rootNodes = null;

if (mode === "TREE" || mode === "TREE-GUIDED") {
    rootNodes = ["http://localhost:8080/0.ttl", "http://localhost:8080/metadata.ttl"];
} else if (mode === "DATA-DUMP") {
    rootNodes = ["http://localhost:8080/data.ttl", "http://localhost:8080/metadata.ttl"];
} else {
    throw new Error(`the mode "${mode}" is not supported`);
}

const evaluation_folder = './evaluation';

const directory = `${evaluation_folder}/results/${datasetName}/${topology}`
const resultFile = `${directory}/${mode}_${memorySize}_memory.json`;

if (!fs.existsSync(directory) && !demoMode) {
    fs.mkdirSync(directory, { recursive: true });
}

if (!demoMode) {
    console.log(`will save at ${resultFile}`);
}

const queryFolder = './evaluation/query';
let queryFiles = [];

fs.readdirSync(queryFolder).forEach(file => {
    if (file.endsWith("txt") && file.indexOf("0") == -1) {
        queryFiles.push(
            `${queryFolder}/${file}`
        );
    }
});

if (demoMode) {
    queryFiles = queryFiles.slice(0, 3)
}

const createCommand = (memorySize, queryPath, rootNodes, timeout, mode) => {
    return `node --max-old-space-size=${memorySize} ./comunica_runner.mjs -f ${queryPath} -r ${rootNodes.join(' ')} -t ${timeout} -m ${mode}`;
}

const failedTest = { "nResults": NaN, "timeExec": NaN, "nRequest": NaN };

const sumaryResults = {};

async function main() {
    console.log(`-------------- ${mode} --------------`);
    for (const queryFile of queryFiles) {
        console.log(`-------------- The query file: "${queryFile}" --------------`);
        sumaryResults[queryFile] = [];
        for (let i = 0; i < nRepetition; i++) {
            try {
                await executeQuery(
                    queryFile,
                    nRepetition,
                    i,
                    sumaryResults[queryFile]);
                await save_result(sumaryResults);

            } catch (e) {
                console.error(`-------------- Failed with error ${e} --------------`);
                sumaryResults[queryFile].push(failedTest);

                await save_result(sumaryResults);
                break;
            }
        }
    }
    console.log(`--------------THE END--------------`);
    await save_result(sumaryResults, true);
    console.log(`result file available at ${resultFile}`);
    return;
}

async function save_result(results, printResult = false) {
    const stringSumaryResult = JSON.stringify(results, null, 4);
    if (printResult) {
        console.log(`Sumary:\n${stringSumaryResult}`);
    }
    if (!demoMode) {
        fs.writeFileSync(resultFile, stringSumaryResult, () => {
            console.log(`result file available at ${resultFile}`)
        });
    }
}

async function executeQuery(queryFile, nRepetition, i, results) {
    console.log(`--------------repetition: ${i + 1} out of ${nRepetition}--------------`);
    const command = createCommand(memorySize, queryFile, rootNodes, timeout, mode);
    const stdout = execSync(command, { timeout: (timeout + 1) * 1000 });
    const resp = JSON.parse(stdout);
    results.push(resp);
}

await main();
