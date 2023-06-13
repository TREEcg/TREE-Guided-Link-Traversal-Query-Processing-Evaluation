import fs from 'fs';
import { exec } from 'child_process';
import { basename } from 'node:path';

// https://stackoverflow.com/questions/23327149/how-can-i-create-a-boxplot-for-each-x-value#
// https://stackoverflow.com/questions/69793623/how-to-plot-grouped-boxplot-by-gnuplot
// https://stackoverflow.com/questions/5483006/gnuplot-multiple-stacked-histograms-each-group-using-the-same-key
const plotting_command = (unit, input_file, output_file) => {
    return `
set style fill solid 0.25 border -1;
set style boxplot outliers pointtype 7;
set style data boxplot;

set xtics ('ALL' 1,'TREE' 2, 'TREE-guided' 3);
set xlabel 'reachability criterium';
set ylabel '${unit}';
set logscale y;
set term svg ;
set output '${output_file}' ;

plot for[i=1:3] '${input_file}' using (i):i notitle;
`};

const result_fields = [
    'number_result',
    'time_exec_last_result',
    'number_request'
];

const config_name_files = [
    'config_comunica_follow_all.json',
    'config_comunica_follow_tree.json',
    'config_comunica_follow_tree_solver.json'
];

const unit = [
    'number of result',
    "execution time (ms)",
    "number of request"
]


function groupResult(benchmark_folder) {
    const ploting_directory = `${benchmark_folder}/plot`;
    if (!fs.existsSync(ploting_directory)) {
        fs.mkdirSync(ploting_directory);
    }

    const figure_directory = `${benchmark_folder}/plot/figure`;
    if (!fs.existsSync(figure_directory)) {
        fs.mkdirSync(figure_directory);
    }

    const results_grouped = {};
    let n_result = undefined;
    for (const config_name_file of config_name_files) {
        const result = JSON.parse(fs.readFileSync(`${benchmark_folder}/${config_name_file}`));
        if (!n_result) {
            n_result = result['n_repetition']
        } else if (n_result !== result['n_repetition']) {
            throw Error('the number of repetion should be the same for every setup');
        }
        for (const [_, info] of Object.entries(result.queries)) {
            for (const field of result_fields) {
                if (!results_grouped[info['id_filter']]) {
                    results_grouped[info['id_filter']] = {};
                }
                if (!results_grouped[info['id_filter']][field]) {
                    results_grouped[info['id_filter']][field] = [info[field]['raw']];
                } else {
                    results_grouped[info['id_filter']][field].push(info[field]['raw']);
                }

            }
        }
    }
    //console.log(results_grouped);
    let files = create_result_file(ploting_directory, results_grouped);
    create_plot(files, figure_directory);
}

function create_result_file(ploting_directory, results_grouped) {
    const string_data_files = {};
    const files = []
    for (const [id_filter, fields] of Object.entries(results_grouped)) {
        string_data_files[id_filter] = {};
        for (const [field, value] of Object.entries(fields)) {
            string_data_files[id_filter][field] = "";
            const transposed_field = transpose(value);
            for (const row of transposed_field) {
                for (const val of row) {
                    string_data_files[id_filter][field] += `${val} `
                }
                string_data_files[id_filter][field] = string_data_files[id_filter][field]
                    .substring(0, string_data_files[id_filter][field].length - 1);
                string_data_files[id_filter][field] += '\n';
            }
            string_data_files[id_filter][field] = string_data_files[id_filter][field]
                .substring(0, string_data_files[id_filter][field].length - 1);
            const filename = `${ploting_directory}/${field}_filter-${id_filter}.dat`;
            fs.writeFileSync(filename, string_data_files[id_filter][field]);
            files.push(filename);
        }
    }
    return files;
}

async function create_plot(files, figure_directory) {
    for (const file of files) {
        for (let i = 0; i < result_fields.length; i++) {
            if (file.includes(result_fields[i])) {
                let gnuplot_command = plotting_command(unit[i], file, `${figure_directory}/${basename(file)}.svg`);
                await exec(`gnuplot -e "${gnuplot_command}"`, (error, _, stderr) => {
                    if (error) {
                        throw error
                    }
                    if (stderr) {
                        if (!String(stderr).includes('adjusting')) {
                            throw Error(`stderr: ${stderr}`);
                        }
                    }
                });
            }
        }

    }
}

function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) { return r[c]; });
    });
}

groupResult('./benchmark/results/location-LDES-page_size_20_layerSize_10')
