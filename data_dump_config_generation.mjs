import { Command } from 'commander';
import fs from 'fs';

const program = new Command();
const supportedSource = new Map(Object.entries({
    'location-LDES':
    {
        'path': './benchmark/data/location-LDES/data.ttl',
        'date_first_element': "2022-08-07T08:08:21Z",
        'name': 'location-LDES',
        'ldesIdentifier': 'http://localhost:3000/lil/#EventStream',
        'filters': [
            '?t>="2022-08-07T08:30:45.000Z"^^xsd:dateTime && ?t<"2022-08-07T08:38:50.000Z"^^xsd:dateTime',
            `(?t>="2022-08-07T08:30:45.000Z"^^xsd:dateTime && ?t<"2022-08-07T08:38:50.000Z"^^xsd:dateTime) || (?t<"2022-08-07T08:30:45.000Z"^^xsd:dateTime &&  ?t>="2022-08-07T08:22:16.000Z"^^xsd:dateTime)`,
            '?t<"2022-08-07T08:28:02.000Z"^^xsd:dateTime',
            '?t>="2022-08-07T08:29:23.000Z"^^xsd:dateTime && ?t<"2022-08-07T08:30:45.000Z"^^xsd:dateTime',
            'false',
            'true',
        ],
        'topology': {
            'n_member': 447
        }
    }
}));
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
