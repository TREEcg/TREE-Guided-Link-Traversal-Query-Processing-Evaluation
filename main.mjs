import { extractMembers } from "@treecg/ldes-snapshot";
import { storeFromFile, TSMongoDBIngestorBTREE } from "@treecg/ldes-timeseries";
const rootNode  = "http://localhost:3000/ldes/test";

async function initialized() {
    // load some members
    const fileName = "./data/location-LDES.ttl";
    const ldesIdentifier = "http://localhost:3000/lil/#EventStream";
    const mongoDBURL = "mongodb://localhost:27017"
    const store = await storeFromFile(fileName);
    const members = extractMembers(store, ldesIdentifier);


    const streamIdentifier = "http://example.org/myStream#eventStream";
    const viewDescriptionIdentifier = "http://example.org/myStream#viewDescription";

    const pageSize = 2;
    const layerSize = 10;
    
    const ldesTSConfig = {
        timestampPath: "http://www.w3.org/ns/sosa/resultTime",
        pageSize: pageSize,
        date: new Date("2022-08-07T08:08:21Z")
    }
    const ingestor = new TSMongoDBIngestorBTREE({ mongoDBURL:mongoDBURL, streamIdentifier: streamIdentifier, viewDescriptionIdentifier: viewDescriptionIdentifier });
    ingestor.layerSize = layerSize

    await ingestor.instantiate(ldesTSConfig);

    await ingestor.publish(members);
    await ingestor.exit();
}

async function main() {
    await initialized();
}
main()