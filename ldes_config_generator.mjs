import { Command } from 'commander';
import fs from 'fs';

const program = new Command();
const configDataFilePath = './evaluation/data/config.json';
const configDataFile = JSON.parse(fs.readFileSync(configDataFilePath).toString());
const configPath = './evaluation/source_config/data_source_info.json';

program
    .name('generate-config-file-data-dump')
    .description('CLI program to generate the config file of a data dump')
    .version('0.0.0')

    .requiredOption('-s, --source <option>', 'The data source file. Can be "dahcc-1-participant"')
    .requiredOption('-n, --n-fragments-first-row <number>', 'The number of fragments of the first row')
    .option('-d, --depth <number>', 'The number of row of the fragmentation')

    .parse(process.argv);

const options = program.opts();
const dataSource = configDataFile[options.source];
if (dataSource === undefined) {
    throw new Error("The source is not supported");
}
const n_fragments_first_row = options.nFragmentsFirstRow;
const depth = options.depth;

dataSource['topology'] = {
    'n_fragments_first_row': n_fragments_first_row
};
if (depth !== undefined) {
    dataSource['topology']['depth'] = depth;
}

fs.writeFileSync(configPath, JSON.stringify(dataSource));
