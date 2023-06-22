import { Command } from 'commander';
import fs from 'fs';
import path from "path";

const program = new Command();
const configDataFilePath = path.resolve('evaluation/data/config.json');
const configDataFile = JSON.parse(fs.readFileSync(configDataFilePath));
const supportedSource = new Map(Object.entries(configDataFile));
const configPath = path.resolve('./evaluation/source_config/data_source_info.json');
program
    .name('ldes-time-series-initializer')
    .description('CLI program to initialize an LDES time serie in the topology of a linked list for evaluation of link traversal query processing SPARQL query engine')
    .version('0.0.0')

    .requiredOption('-b, --bucket-size <number>', 'The number of members inside an LDES bucket.', 20)
    .requiredOption('-s, --source <string>', 'The data source file. Can be either "location-LDES" or "ship-LDES"', 'location-LDES')
    .parse(process.argv);

const options = program.opts();
const bucketSize = options.bucketSize;

const datasoureInfo = supportedSource.get(options.source);
datasoureInfo['topology'] = {
    'bucket_size': bucketSize
};

if (datasoureInfo === undefined) {
    throw new Error("The source is not supported");
}

const relay_properties = {
    'port': 3001,
    'loglevel': 'info',
    'logname': 'WEB API',
    'datasetFolders': "/home/id357/Documents/PhD/coding/comunica_filter_benchmark/evaluation/data/dahcc_1_participant",//path.parse(datasoureInfo.path).dir,
    'credentialsFileName': null,
    'lilURL': 'http://localhost:3000/ldes/test',
    'treePath': datasoureInfo.timestampPath,
    'chunkSize': 10,
    'batchSize': Number(bucketSize),
    'bucketSize': Number(bucketSize),
    'targetResourceSize': 1024
};

fs.writeFileSync(configPath, JSON.stringify(datasoureInfo));

const relayConfigPath = path.resolve("./LDES-in-SOLID-Semantic-Observations-Replay/engine/src/config");
const relayConfigPathFilePath = path.resolve(relayConfigPath, "replay_properties.json");

if (!fs.existsSync(relayConfigPath)) {
    fs.mkdirSync(relayConfigPath);
}

fs.writeFileSync(relayConfigPathFilePath, JSON.stringify(relay_properties));
