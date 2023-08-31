import fs from 'fs';
import { exec } from 'child_process';
import { basename } from 'node:path';
import { Command } from 'commander';
import {mean, stdev} from 'stats-lite';

// https://stackoverflow.com/questions/23327149/how-can-i-create-a-boxplot-for-each-x-value#
// https://stackoverflow.com/questions/69793623/how-to-plot-grouped-boxplot-by-gnuplot
// https://stackoverflow.com/questions/5483006/gnuplot-multiple-stacked-histograms-each-group-using-the-same-key


const RESULT_FIELDS = [
    'number_result',
    'time_exec_last_result',
    'number_request'
];

const UNIT = {
    'number_result': 'number of results',
    'time_exec_last_result': 'execution time (ms)',
    'number_request': 'number of request'
};

const program = new Command();

program
    .name('data analysis')
    .description('CLI program to help produce analysis of the benchmark')
    .version('0.0.0')

    //.option('-d, --directory [path...]', 'directory of the benchmark results', RESULTS_PATHS)
    //.option('-f, --result-fields [string...]', 'the fields to analyse', RESULT_FIELDS)
    //.option('-c, --config-file-name [string...]', 'the configuration of the engine', CONFIG_NAME_FILES)
    //.option('-p, --plot <boolean>', 'generate plot of the result', true)
    .parse(process.argv);

const options = program.opts();
const results_files = options.directory;
const result_fields = options.resultFields;
const config_name_files = options.configFileName;
const plot = options.plot;

const plotting_command = (unit, input_file, output_file, xlabel, n) => {
    return `
set style fill solid 0.25 border -1;
set style boxplot outliers pointtype 7;
set style data boxplot;

set xtics (${xlabel});
set xlabel 'reachability criterium';
set ylabel '${unit}';

set term svg ;
set output '${output_file}' ;

plot for[i=1:${n}] '${input_file}' using (i):i notitle;
`};

function getMetricTest(file) {
    const data = JSON.parse(fs.readFileSync(file));
    const dataSummary = {};
    for (const [query, resArray] of Object.entries(data)) {
        dataSummary[query] = {};
        let nResults = [];
        let timeExec = [];
        let nRequest = [];
        let unvalidData = false;

        for (const val of resArray) {
            if(val.nResults !== undefined) {
                nResults.push(val.nResults);
                timeExec.push(val.timeExec);
                nRequest.push(val.nRequest);
            } else{
                unvalidData = true;
                break;
            }
        }

        if (!unvalidData) {
            dataSummary[query]["nResults"] = nResults[0];
            dataSummary[query]["nRequest"] = nRequest[0];
            dataSummary[query]["timeExec"] = {
                mean: mean(nResults),
                std: stdev(nResults)
            };
        }
    }
    console.log(dataSummary);
}


function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) { return r[c]; });
    });
}

function main() {
    const file = "./evaluation/results/oneAryTree100/TREE_9000_memory.json"; 
    getMetricTest(file)
}

main();
