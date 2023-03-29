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
const flatTopology = (topology)=>{
    let resp = '';
    for( const [k, v] of Object.entries(topology)) {
        resp+=`${k}_${v}_`;
    }
    return resp.substring(0, resp.length-1);
}
const resultFile = `${benchmark_folder}/results/${path.basename(config,'.json')}-${dataSourceInfo.name}-${flatTopology(dataSourceInfo.topology)}.json`;


const protoQuery = (filterExpression) => {
    return `
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 

SELECT ?s ?t WHERE {
    ?s sosa:resultTime ?t.
FILTER(${filterExpression})
}
`
};

const nRepetition = 2;

const filterExpressions = [
    '?t>"2022-08-07T08:37:12.000Z"^^xsd:dateTime',
    '?t>"1800-08-07T08:37:12.000Z"^^xsd:dateTime',
];

const rawSumaryResults = {};
const regexpSummary = /(TOTAL),([+-]?[0-9]*[.]?[0-9]+),([0-9]+)/;
const regexpCurrentExec = /([0-9]+),([+-]?[0-9]*[.]?[0-9]+),([0-9]+)/;

async function engineExecution(query) {
    return new Promise(async (resolve, reject) => {
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
            'time_exec_last_result': Number.NaN,
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
            rawSumaryResults[config][filterExpression].push(sumary);
        }

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
    sumary[config] = {};
    for (const [filterExpression, value] of Object.entries(rawSumaryResults[config])) {
        const keys = ['time_exec_last_result', 'number_result', 'number_request'];
        sumary[config][filterExpression] = {
            'number_result': value[0]['number_result']
        };

        for (const key of keys) {
            sumary[config][filterExpression][key] = calculateStat(value, key);
        }
    }

    return sumary;
}

function calculateStat(value, key) {
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    const timeExecValue = value.map((val) => {
        const time = val[key];
        if (time > max) {
            max = time;
        }

        if (time < min) {
            min = time;
        }
        return time;
    });

    let meanTimeKey = 0;
    for (const val of timeExecValue) {
        meanTimeKey += val;
    }
    meanTimeKey /= nRepetition;

    let varianceKey = 0;
    for (const val of timeExecValue) {
        varianceKey += Math.pow(val - meanTimeKey, 2);
    }
    varianceKey /= nRepetition;
    return {
        'avg': meanTimeKey,
        'var': varianceKey,
        'min': min,
        'max': max
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