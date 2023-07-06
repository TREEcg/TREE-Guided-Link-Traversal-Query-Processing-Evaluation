import { Command } from 'commander';
import fs from 'fs';
import path from 'node:path';

const query_folder_path = "./evaluation/query";

const program = new Command();
const configDataFilePath = './evaluation/data/config.json';
const configDataFile = JSON.parse(fs.readFileSync(configDataFilePath).toString());

const supportedSource = new Map(Object.entries(configDataFile));

program
    .name('generate-config-file-data-dump')
    .description('CLI program to generate the config file of a data dump')
    .version('0.0.0')

    .requiredOption('-s, --source <option>', 'The data source file. Can be either "dahcc-1-participant"')
    .parse(process.argv);

const options = program.opts();
const dataSource = supportedSource.get(options.source);

if (dataSource === undefined) {
    throw new Error("The source is not supported");
}

const createQuery = (filterExpression, triple_paterns) => {
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
let string_query_file = "";
let i = 0;
for (const tp of dataSource.triple_patterns_query) {
    let triple_patterns = "";
    for (const triple_pattern of tp) {
        triple_patterns += `${triple_pattern}\n`
    }

    for (const filter of dataSource.filters) {
        string_query_file += `${createQuery(filter, triple_patterns)}\n`
    }

    const query_file = path.join(query_folder_path, `A${i}.txt`);
    fs.writeFileSync(query_file, string_query_file);
    string_query_file = "";
    i+=1;
    console.log(`query file generated at ${query_file}`)
}


if (!fs.existsSync(query_folder_path)) {
    fs.mkdirSync(query_folder_path);
}
