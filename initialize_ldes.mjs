import { storeFromFile, TSMongoDBIngestorBTREE, TSMongoDBIngestor } from "@treecg/ldes-timeseries";
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
    .description('CLI program to initialize an LDES time serie in the topology of a BTREE or a linked list for evaluation of link traversal query processing SPARQL query engine')
    .version('0.0.0')

    .option('-p, --page-size <number>', 'The number of members per leaf nodes.', 20)
    .option('-l, --layer-size <number>', 'The number of relation per node.', 10)
    .option('-t, --topology <string>', 'The topology of the fragmentation. Can be either "b-tree" or "1-ary-tree"', 'b-tree')
    .requiredOption('-s, --source <string>', 'The data source file. Can be either "location-LDES" or "ship-LDES"', 'location-LDES')
    .parse(process.argv);

const options = program.opts();
const pageSize = Number(options.pageSize);
const layerSize = Number(options.layerSize);
const dataSource = supportedSource.get(options.source);
const topology = options.topology;
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

const mongoDBURL = "mongodb://localhost:27017";
const streamIdentifier = "http://example.org/myStream#eventStream";
const viewDescriptionIdentifier = "http://example.org/myStream#viewDescription";

// just made a small change to https://github.com/TREEcg/LDES-Snapshot/blob/1a85f06995bf1a5b752fa2069999544f52edfcdd/src/util/Conversion.ts#L79
function extractMembers(store, timestampPath) {
    const memberSubjects = store.getSubjects(timestampPath,null, null);
    const members = memberSubjects.map(memberSubject => {
        return {
            id: memberSubject,
            quads: store.getQuads(memberSubject, null, null, null)
        }
    })

    // extract every member based on the subject
    const mainSubjects = new Set(memberSubjects.map(subj => subj.id));

    for (const member of members) {
        // to avoid issues with data referencing themselves in a circle,
        // duplicates are filtered out as well
        // the initial subject (there should only be one still) is added
        // as an initial to-be-ignored object
        const existingObjects = new Set(member.id.value);
        for (const quad of member.quads) {
            if (existingObjects.has(quad.object.value)) {
                continue;
            }
            existingObjects.add(quad.object.value);
            // all quads with subjects equal to its object representation
            // gets added to this resource entry, so the original subjects'
            // data is completely present inside this single resource
            // this approach already works recursively, as push adds new elements
            // to the end, making them appear as subjects in further
            // iterations
            // quads having another main resource (that is not the current resource)
            // as object are getting filtered out as well, as they cannot be further
            // defined within this single resource
            member.quads.push(
                ...store.getQuads(quad.object, null, null, null).filter((obj) => {
                    return obj.object.id === member.id.value || !((mainSubjects).has(obj.object.id))
                })
            );
        }
    }
    return members
}

async function initialized_ldes(ingestor) {
    // load some members
    const store = await storeFromFile(dataSource.path);
    const members = extractMembers(store, dataSource.timestampPath);
    console.log(`---${members.length} loaded---`);

    const ldesTSConfig = {
        timestampPath: dataSource.timestampPath,
        pageSize: pageSize,
        date: new Date(dataSource.date_first_element)
    }

    await ingestor.instantiate(ldesTSConfig);

    await ingestor.publish(members);
    await ingestor.exit();

    fs.writeFileSync(configPath, JSON.stringify(dataSource));
}

async function initialized_ldes_btree() {
    const ingestor = new TSMongoDBIngestorBTREE({ mongoDBURL: mongoDBURL, streamIdentifier: streamIdentifier, viewDescriptionIdentifier: viewDescriptionIdentifier });
    ingestor.layerSize = layerSize;
    initialized_ldes(ingestor);
}

async function initialized_ldes_linked_list() {
    const ingestor = new TSMongoDBIngestor({ mongoDBURL: mongoDBURL, streamIdentifier: streamIdentifier, viewDescriptionIdentifier: viewDescriptionIdentifier });
    initialized_ldes(ingestor);
}

async function main() {
    switch (topology) {
        case '1-ary-tree': {
            initialized_ldes_linked_list()
            break;
        }
        case 'b-tree': {
            await initialized_ldes_btree();
            break;
        }
        default: {
            throw new Error(`topology ${topology} not supported`);
        }
    }
}
main()

