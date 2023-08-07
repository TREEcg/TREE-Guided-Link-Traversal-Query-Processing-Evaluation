import { QueryEngineFactory as QueryEngineFactoryLTQT} from "@comunica/query-sparql-link-traversal";
import { QueryEngine } from "@comunica/query-sparql-link-traversal";

import fs from 'fs';
import { Command } from 'commander';

const program = new Command();
program
    .name('evaluation')
    .description('CLI program to run a TREE evaluation')
    .version('0.0.0')

    .requiredOption('-f, --file-path <string>', 'File path of the query to be executed')
    .option('-m, --mode <mode>', 'if true execute an LTQT query', 'TREE')
    .requiredOption('-r, --root-nodes <string...>', 'the first data sources to query')
    .option('-t, --timeout <number>', 'Timeout of the query in second', 120)
    .parse(process.argv);

const options = program.opts();
const queryFilePath = options.filePath;
const timeout = options.timeout * 1000;
const rootNodes = options.rootNodes;
const mode = options.mode;
let engine = null;

if (mode === "TREE") {
    const config = "./evaluation/config_comunica_follow_tree.json";
    engine = await new QueryEngineFactoryLTQT().create({ configPath: config });
} else if (mode === "TREE-GUIDED") {
    const config = "./evaluation/config_comunica_follow_tree_solver.json";
    engine = await new QueryEngineFactoryLTQT().create({ configPath: config });
} else if (mode === "DATA-DUMP") {
    engine = new QueryEngine();
} else {
    throw new Error(`the mode "${mode}" is not supported`);
}

const regexpSummary = /(TOTAL),([+-]?[0-9]*[.]?[0-9]+),([0-9]+)/;

const returnedMessage = (nResults, timeExec, nRequest) => {
    const resp = {
        nResults,
        timeExec,
        nRequest
    };
    return JSON.stringify(resp);
};

const query = fs.readFileSync(queryFilePath).toString();

const results = await engine.query(
    query, {
    sources: rootNodes,
    lenient: true,
});

const { data } = await engine.resultToString(results,
    'stats');

let nResults = 0;
let timeExec = NaN;
let nRequests = NaN;

data.on('data', (res) => {
    const currentRes = res.toString();
    if (regexpSummary.test(currentRes)) {
        let tag = (currentRes).match(regexpSummary);
        timeExec = Number(tag[2]);
        nRequests = Number(tag[3])
    }
    nResults += 1;
});

data.on('error', (_) => {
    console.log(returnedMessage(NaN, NaN, NaN));
    process.exit(1);
});

data.on('end', () => {

    console.log(returnedMessage(nResults, timeExec, nRequests));
    process.exit(0)
});

setTimeout(() => {
    console.log(returnedMessage(nResults, timeout));
    process.exit(1);
}, timeout);