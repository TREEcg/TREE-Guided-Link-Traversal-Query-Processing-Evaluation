import { extractMembers } from "@treecg/ldes-snapshot";
import { storeFromFile, TSMongoDBIngestorBTREE } from "@treecg/ldes-timeseries";
import { Command } from 'commander';
import fs from 'fs';

// https://github.com/SolidLabResearch/LDES-in-SOLID-Semantic-Observations-Replay
// https://dahcc.idlab.ugent.be/dataset.html

const configDataFilePath = 'evaluation/data/config.json';
const configDataFile = JSON.parse(fs.readFileSync(configDataFilePath).toString());
const program = new Command();
const supportedSource = new Map(Object.entries(configDataFile));
const configPath = './evaluation/source_config/data_source_info.json';


program
    .name('ldes-time-series-initializer')
    .description('CLI program to initialize an LDES time serie for evaluation of link traversal query processing SPARQL query engine')
    .version('0.0.0')

    .requiredOption('-p, --page-size <number>', 'The number of members per leaf nodes.', 20)
    .requiredOption('-l, --layer-size <number>', 'The number of relation per node.', 10)
    .requiredOption('-s, --source <string>', 'The data source file. Can be either "location-LDES" or "ship-LDES"', 'location-LDES')
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
        timestampPath: dataSource.timestampPath,
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