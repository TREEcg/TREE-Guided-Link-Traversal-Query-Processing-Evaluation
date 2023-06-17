import { Command } from 'commander';
import fs from 'fs';

const program = new Command();
const configDataFilePath = 'benchmark/data/config.json';
const configDataFile = JSON.parse(fs.readFileSync(configDataFilePath).toString());

const supportedSource = new Map(Object.entries(configDataFile));
supportedSource.get('location-LDES')['topology'] = {
    'n_member': 446
};

const configPath = './benchmark/source_config/data_source_info.json';

program
    .name('generate-config-file-data-dump')
    .description('CLI program to generate the config file of a data dump')
    .version('0.0.0')

    .requiredOption('-s, --source <option>', 'The data source file. Can be either "location-ldes" or "ship-LDES" ')
    .parse(process.argv);

const options = program.opts();
const dataSource = supportedSource.get(options.source);

if (dataSource === undefined) {
    throw new Error("The source is not supported");
}

fs.writeFileSync(configPath, JSON.stringify(dataSource));
