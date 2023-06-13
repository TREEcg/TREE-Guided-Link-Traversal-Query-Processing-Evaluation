import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import fs from 'fs';
import { setTimeout as promiseSetTimeout } from "timers/promises";
import path from "path";

const rootNode = "http://localhost:5000/sparql";
const benchmark_folder = './benchmark';
const config = process.env.COMUNICA_CONFIG;
const sparqlEndpointOutputFile = `${benchmark_folder}/output`;
const dataSourceInfoPath = `${benchmark_folder}/source_config/data_source_info.json`
const dataSourceInfo = JSON.parse(fs.readFileSync(dataSourceInfoPath));
const flatTopology = (topology) => {
    let resp = '';
    for (const [k, v] of Object.entries(topology)) {
        resp += `${k}_${v}_`;
    }
    return resp.substring(0, resp.length - 1);
}

const directory = `${benchmark_folder}/results/${dataSourceInfo.name}-${flatTopology(dataSourceInfo.topology)}`
const resultFile = `${directory}/${path.basename(config, '.json')}.json`;

if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
}

const protoQuery = (filterExpression) => {
    return `
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 

SELECT DISTINCT ?s ?t WHERE {
    ?s sosa:resultTime ?t.
FILTER(${filterExpression})
}
`
};

const nRepetition = 4;
const max_execution_time = 60_000;

const filterExpressions = dataSourceInfo.filters;

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
            'time_exec_last_result': max_execution_time,
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
    rawSumaryResults[config] = {}
    let beginningIndexOutputFile = 0;
    await promiseSetTimeout(10 * 1_000);
    let id_filter = 0;
    for (const filterExpression of filterExpressions) {
        console.log(`--------------filter expression: "${filterExpression}"--------------`)
        rawSumaryResults[config][filterExpression] = [];
        for (let i = 0; i < nRepetition; i++) {
            console.log(`--------------repetition: ${i + 1} out of ${nRepetition}--------------`)
            const query = protoQuery(filterExpression);
            const sumary = await engineExecution(query);
            await promiseSetTimeout(10 * 1_000);
            console.log("Waited 10s");
            [sumary['number_request'], beginningIndexOutputFile] = getNumberOfRequest(beginningIndexOutputFile);
            sumary['id_filter'] = id_filter;
            rawSumaryResults[config][filterExpression].push(sumary);
        }
        id_filter+=1;
    }
    console.log(`--------------THE END--------------`);
    const sumaryResult = createSummary(rawSumaryResults);
    const stringSumaryResult = JSON.stringify(sumaryResult, null, 4);
    console.log(`Sumary:\n${stringSumaryResult}`);
    fs.writeFileSync(resultFile, stringSumaryResult);
    console.log(`result file available at ${resultFile}`)
    return;
}

function createSummary(rawSumaryResults) {
    const sumary = {};
    sumary['queries'] = {};
    for (const [filterExpression, values] of Object.entries(rawSumaryResults[config])) {
        const keys = ['time_exec_last_result', 'number_result', 'number_request'];
        const subSumary = {
            'number_result': values[0]['number_result'],
            'id_filter': values[0]['id_filter']
        };

        for (const key of keys) {
            subSumary[key] = calculateStat(values, key);
        }
        sumary['queries'][filterExpression] = subSumary;
    }

    sumary['n_repetition'] = nRepetition;
    sumary['config'] = config;
    return sumary;
}

function calculateStat(values, key) {
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    const stat_value = values.map((val) => {
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
    for (const val of stat_value) {
        meanTimeKey += val;
    }
    meanTimeKey /= nRepetition;

    let varianceKey = 0;
    for (const val of stat_value) {
        varianceKey += Math.pow(val - meanTimeKey, 2);
    }
    varianceKey /= nRepetition;

    if (!Number.isFinite(min)) {
        min = max_execution_time;
    }

    if (!Number.isFinite(max)) {
        max = max_execution_time;
    }
    return {
        'avg': meanTimeKey || max_execution_time,
        'var': varianceKey || 0,
        'min': min || max_execution_time,
        'max': max || max_execution_time,
        'raw': stat_value
    };
}

const statementStartQuery = "got assigned a new query";
function getNumberOfRequest(beginningIndex) {
    const sparqlEndpointOutput = fs.readFileSync(sparqlEndpointOutputFile).toString();
    const firstOccurrence = sparqlEndpointOutput.indexOf(statementStartQuery, beginningIndex);
    if (firstOccurrence === -1) {
        throw new Error('there is no request in the output file');
    }
    const indexEndRequest = sparqlEndpointOutput.indexOf(statementStartQuery, firstOccurrence + statementStartQuery.length + 1) !== -1 ?
        sparqlEndpointOutput.indexOf(statementStartQuery, firstOccurrence + statementStartQuery.length + 1) : sparqlEndpointOutput.length;
    const zoneOfInterest = sparqlEndpointOutput.substring(beginningIndex, indexEndRequest);
    const nRequest = (zoneOfInterest.match(/Requesting/g) || []).length;
    return [nRequest, indexEndRequest + statementStartQuery.length + 1];
}

await main();