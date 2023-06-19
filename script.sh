#!/bin/sh

function cleanDocker {
    (docker stop $(docker ps -a -q) && docker container prune) || true
}

function startMongo {
    docker run -d -p 27017:27017 --name mongo-comunica-filter-benchmark mongo:latest
}


function startBenchmarkServer {
    npx community-solid-server -c ./benchmark/config.json -f ./benchmark/data
}

function startDataDourceLocationLdes_1_446Topology {
    cleanDocker
    startMongo
    node initialize_ldes.mjs -p 1 -l 446 -s 'location-LDES'
    startBenchmarkServer
}

function startDataDourceLocationLdes_20_10Topology {
    cleanDocker
    startMongo
    node initialize_ldes.mjs -p 20 -l 10 -s 'location-LDES'
    startBenchmarkServer
}

function startDataDourceLocationLdes_5_5Topology {
    cleanDocker
    startMongo
    node initialize_ldes.mjs -p 5 -l 5 -s 'location-LDES'
    startBenchmarkServer
}

function startDataSourceLocationDataDump {
    node data_dump_config_generation.mjs -s "location-LDES" && npx http-server ./benchmark/data/location-LDES -p 8080
}

function liberateSPARQLEndpointPort {
    (fuser -k 5000/tcp || true)
}

function createNewOutputFile {
    rm ./benchmark/output -f && touch ./benchmark/output
}

function createSPARQLEnpoint {
    node ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $1 -p 5000 -t $COMUNICA_TIMEOUT -i -l info -w 3 --freshWorker --lenient
}

function runBenchmark {
    if $1 ; then 
        sleep 5 && node benchmark.mjs -d
    else 
        sleep 5 && node benchmark.mjs 
    fi
}

function protoBenchmark {
    liberateSPARQLEndpointPort
    createNewOutputFile
    (createSPARQLEnpoint DATASOURCE_PATH &> ./benchmark/output) &
    runBenchmark true
    liberateSPARQLEndpointPort 
}

function benchmarkFollowTree {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_tree.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark
}

function benchmarkFollowTreeSolver {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_tree_solver.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark
}

function benchmarkFollowAll {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_all.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark
}

function benchmarkFollowDataDump {
    unset COMUNICA_CONFIG
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:8080/data.ttl
    protoBenchmark
}
