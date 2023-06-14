import { extractMembers } from "@treecg/ldes-snapshot";
import { storeFromFile, TSMongoDBIngestorBTREE } from "@treecg/ldes-timeseries";
import { Command } from 'commander';
import fs from 'fs';

// https://github.com/SolidLabResearch/LDES-in-SOLID-Semantic-Observations-Replay
// https://dahcc.idlab.ugent.be/dataset.html

const program = new Command();
const supportedSource = new Map(Object.entries({
    'location-LDES':
    {
        'path': './benchmark/data/location-LDES/data',
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
        ]
    },
    'ship-LDES':
    {
        'path': './benchmark/data/ship-LDES.ttl',
        'date_first_element': "2021-08-18T14:05:18.000Z",
        'name': 'ship-LDES',
        'ldesIdentifier': 'http://www.example.com/ldes'
    }
}));
const configPath = './benchmark/source_config/data_source_info.json';


program
    .name('ldes-time-series-initializer')
    .description('CLI program to initialize an LDES time serie for benchmarking of link traversal query processing SPARQL query engine')
    .version('0.0.0')

    .requiredOption('-p, --page-size <number>', 'The number of members per leaf nodes.')
    .requiredOption('-l, --layer-size <number>', 'The number of relation per node.')
    .requiredOption('-s, --source <option>', 'The data source file. Can be either "location-ldes" or "ship-LDES" ')
    .parse(process.argv);

const options = program.opts();
const pageSize = Number(options.pageSize);
const layerSize = Number(options.layerSize);
const dataSource = supportedSource.get(options.source);
if (pageSize === Number.NaN || layerSize === Number.NaN) {
    throw new Error("--page-size or --layer-size arguments are not numbers");
}
if (dataSource === undefined) {
    throw new Error("The source is not supported");
}

dataSource['topology'] = {
    'page_size': pageSize,
    'layerSize': layerSize,
};

dataSource['filters'] = dataSource.filters;


async function initialized_ldes() {
    // load some members
    const ldesIdentifier = dataSource.ldesIdentifier;
    const mongoDBURL = "mongodb://localhost:27017"
    const store = await storeFromFile(dataSource.path);
    const members = extractMembers(store, ldesIdentifier);
    console.log(`---${members.length} loaded---`);

    const streamIdentifier = "http://example.org/myStream#eventStream";
    const viewDescriptionIdentifier = "http://example.org/myStream#viewDescription";

    const ldesTSConfig = {
        timestampPath: "http://www.w3.org/ns/sosa/resultTime",
        pageSize: pageSize,
        date: new Date(dataSource.date_first_element)
    }
    const ingestor = new TSMongoDBIngestorBTREE({ mongoDBURL: mongoDBURL, streamIdentifier: streamIdentifier, viewDescriptionIdentifier: viewDescriptionIdentifier });
    ingestor.layerSize = layerSize

    await ingestor.instantiate(ldesTSConfig);

    await ingestor.publish(members);
    await ingestor.exit();

    fs.writeFileSync(configPath, JSON.stringify(dataSource));
}

async function main() {
    await initialized_ldes();
}
main()