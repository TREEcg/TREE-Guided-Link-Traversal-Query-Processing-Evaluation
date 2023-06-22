import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import fs from 'fs';
import { setTimeout as promiseSetTimeout } from "timers/promises";
import path from "path";
import { Command } from 'commander';
import  * as https  from 'node:https';
import * as http from 'node:http';


const program = new Command();
program
    .name('evaluation')
    .description('CLI program to run a TREE evaluation')
    .version('0.0.0')

    .requiredOption('-n, --number-repetition <number>', 'The number of repetion for each test cases', 20)
    .option('-d, --demo-mode', "Don't record the results and do three repetition of two filter expression and triple pattern", false)
    .option('-k, --keep-output-history', 'keep the history of the comunica output', true)
    .parse(process.argv);

const options = program.opts();
const demoMode = options.demoMode;
const keepOutputHistory = options.keepOutputHistory;
const nRepetition = demoMode ? 3 : options.numberRepetition;

if (demoMode) {
    console.log('DEMO MODE');
}

const rootNode = "http://localhost:5000/sparql";
const evaluation_folder = './evaluation';
const config = process.env.COMUNICA_CONFIG || 'config_comunica_data_dump';
const sparqlEndpointOutputFile = `${evaluation_folder}/output`;
const sparqlEndpointOutputHistoryFile = `${evaluation_folder}/output_history`;
const dataSourceInfoPath = `${evaluation_folder}/source_config/data_source_info.json`
const dataSourceInfo = JSON.parse(fs.readFileSync(dataSourceInfoPath));
const flatTopology = (topology) => {
    let resp = '';
    for (const [k, v] of Object.entries(topology)) {
        resp += `${k}_${v}_`;
    }
    return resp.substring(0, resp.length - 1);
}

const directory = `${evaluation_folder}/results/${dataSourceInfo.name}-${flatTopology(dataSourceInfo.topology)}`
const resultFile = `${directory}/${path.basename(config, '.json')}.json`;

if (!fs.existsSync(directory) && !demoMode) {
    fs.mkdirSync(directory);
}

if (keepOutputHistory) {
    fs.closeSync(fs.openSync(sparqlEndpointOutputHistoryFile, 'w'));
}

if (!demoMode) {
    console.log(`will save at ${resultFile}`);
}


const protoQuery = (filterExpression, triple_paterns) => {
    return `
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX etsi: <https://saref.etsi.org/core/>

SELECT * WHERE {
    ${triple_paterns}
    FILTER(${filterExpression})
}
`
};

const maxExecutionTime = Number(process.env.COMUNICA_TIMEOUT) * 1000;
if (!maxExecutionTime) {
    throw new Error('The env variable COMUNICA_TIMEOUT is not defined');
}

const waitingTimeSec = 1;

const filterExpressions = demoMode ? dataSourceInfo.filters.slice(0, 2) : dataSourceInfo.filters;
const triplePatternsQuery = demoMode ? dataSourceInfo.triple_patterns_query.slice(0, 2) : dataSourceInfo.triple_patterns_query;


const rawSumaryResults = {};
const regexpSummary = /(TOTAL),([+-]?[0-9]*[.]?[0-9]+),([0-9]+)/;
const regexpCurrentExec = /([0-9]+),([+-]?[0-9]*[.]?[0-9]+),([0-9]+)/;

async function engineExecution(query) {
    return new Promise(async (resolve, _reject) => {
        const engine = await new QueryEngine();
        engine.invalidateHttpCache();
        const results = await engine.query(
            query, {
            sources: [rootNode],
            lenient: true,
        });
        const { data } = await engine.resultToString(results,
            'stats');
        let nRes = 0;
        let summary = {
            'time_exec_last_result': maxExecutionTime,
            'number_result': 0,
        };

        data.on('data', (res) => {
            try {
                const currentRes = res.toString();
                if (regexpSummary.test(currentRes)) {
                    let tag = (currentRes).match(regexpSummary);
                    summary = {
                        'time_exec_last_result': Number(tag[2]),
                        'number_result': nRes,
                    };
                } else if (regexpCurrentExec.test(currentRes)) {
                    nRes++;
                    let tag = (currentRes).match(regexpCurrentExec);
                    summary = {
                        'time_exec_last_result': Number(tag[2]),
                        'number_result': nRes,
                    };
                }

            } catch (error) {
                summary = error;
            }

        });

        data.on('error', () => { resolve(summary) });

        const exiting = () => {
            engine.invalidateHttpCache();
            resolve(summary);
        };

        data.on('close', () => {
            exiting();
        });

        data.on('end', () => {
            exiting();
        });

    })
}

async function main() {
    if (config === undefined) {
        throw new Error('no config are defined in the environment')
    }

    console.log(`--------------${config}--------------`);
    await promiseSetTimeout(waitingTimeSec * 1_000);
    let id_filter = 0;
    let id_triple_pattern = 0;
    for (const triplePatternQuery of triplePatternsQuery) {
        console.log(`--------------triple patterns inside the query: "${triplePatternQuery}"--------------`);
        id_filter = 0;
        rawSumaryResults[triplePatternQuery] = {};
        for (const filterExpression of filterExpressions) {
            console.log(`--------------filter expression: "${filterExpression}"--------------`)
            rawSumaryResults[triplePatternQuery][filterExpression] = [];
            for (let i = 0; i < nRepetition; i++) {
                try {
                    await executeQuery(filterExpression,
                        triplePatternQuery,
                        nRepetition,
                        i,
                        rawSumaryResults,
                        id_filter,
                        id_triple_pattern)
                } catch (e) {
                    console.log(`--------------second try because of--------------`);
                    console.error(e);
                    await executeQuery(filterExpression,
                        triplePatternQuery,
                        nRepetition,
                        i,
                        rawSumaryResults,
                        id_filter,
                        id_triple_pattern)
                }

            }
            id_filter += 1;
        }
        id_triple_pattern += 1;
    }
    console.log(`--------------THE END--------------`);
    await save_result(rawSumaryResults, true);
    console.log(`result file available at ${resultFile}`);
    return;
}

async function save_result(rawSumaryResults, print_result = false) {
    const sumaryResult = createSummary(rawSumaryResults);
    const stringSumaryResult = JSON.stringify(sumaryResult, null, 4);
    if (print_result) {
        console.log(`Sumary:\n${stringSumaryResult}`);
    }
    if (!demoMode) {
        fs.writeFile(resultFile, stringSumaryResult, () => {
            console.log(`result file available at ${resultFile}`)
        });
    }
}

async function executeQuery(filterExpression, triplePatternQuery, nRepetition, i, rawSumaryResults, id_filter, id_triple_pattern) {
    console.log(`--------------repetition: ${i + 1} out of ${nRepetition}--------------`)
    const query = protoQuery(filterExpression, triplePatternQuery);
    const sumary = await engineExecution(query);
    await promiseSetTimeout(waitingTimeSec * 1_000);
    console.log(`Waited ${waitingTimeSec}s`);
    const [nRequest, urlsRequested] = getRequestionInfo();
    sumary['number_request'] = nRequest;
    sumary['request_size'] = await getSizeRequests(urlsRequested);
    sumary['id_filter'] = id_filter;
    sumary['id_triple_pattern'] = id_triple_pattern;
    rawSumaryResults[triplePatternQuery][filterExpression].push(sumary);
    save_result(rawSumaryResults);
}

function createSummary(rawSumaryResults) {
    const sumary = {};
    for (const [triple_patterns, values] of Object.entries(rawSumaryResults)) {
        sumary[triple_patterns] = {};
        for (const [filterExpression, results] of Object.entries(values)) {
            const keys = ['time_exec_last_result', 'number_result', 'number_request', 'request_size'];
            const subSumary = {
                'id_filter': results[0]['id_filter'],
            };

            for (const key of keys) {
                subSumary[key] = calculateStat(results, key);
            }
            sumary[triple_patterns][filterExpression] = subSumary;
        }
    }
    sumary['n_repetition'] = nRepetition;
    sumary['config'] = config;
    return sumary;
}

function calculateStat(values, key) {
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    const raw_values = values.map((val) => {
        const value = val[key];
        if (value > max) {
            max = value;
        }

        if (value < min) {
            min = value;
        }
        return value;
    });

    let meanTimeKey = 0;
    for (const val of raw_values) {
        meanTimeKey += val;
    }
    meanTimeKey /= raw_values.length;

    let variance = 0;
    for (const val of raw_values) {
        variance += Math.pow(val - meanTimeKey, 2);
    }
    variance /= nRepetition;

    if (!Number.isFinite(min)) {
        min = maxExecutionTime;
    }

    if (!Number.isFinite(max)) {
        max = maxExecutionTime;
    }
    return {
        'avg': Number.isFinite(meanTimeKey) === true ? meanTimeKey : maxExecutionTime,
        'var': Number.isFinite(variance) === true ? variance : 0,
        'min': Number.isFinite(min) === true ? min : maxExecutionTime,
        'max': Number.isFinite(max) === true ? max : maxExecutionTime,
        'raw': raw_values
    };
}

async function getSizeRequests(requests) {
    let sizesRequests = 0;
    for (const request_url of requests) {
        const requestSize = await new Promise((resolve, _reject) => {
            const uri = new URL(request_url);
            const { get } = uri.protocol === 'https:' ? https : http;
            get(request_url, res => {
                let byte_size = 0;
                res.on('data', chunk => {
                    byte_size += Buffer.byteLength(chunk, 'utf8');
                });
                res.on('error', () => {
                    console.log(error)
                    resolve(0);
                });
                res.on('end', () => {
                    resolve(byte_size);
                });
            });
        });
        sizesRequests += requestSize;
    }
    return sizesRequests;
}

function getRequestionInfo() {
    const sparqlEndpointOutput = fs.readFileSync(sparqlEndpointOutputFile).toString();
    const regex = /Requesting (http[s]?:(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)/g;
    const matchRequest = sparqlEndpointOutput.matchAll(regex);
    let nRequest = 0;
    const links = [];
    for (const match of matchRequest) {
        links.push(match[1]);
        nRequest += 1;
    }
    fs.writeFileSync(sparqlEndpointOutputFile, '');
    fs.appendFileSync(sparqlEndpointOutputHistoryFile, sparqlEndpointOutput);
    return [nRequest, links];
}

await main();