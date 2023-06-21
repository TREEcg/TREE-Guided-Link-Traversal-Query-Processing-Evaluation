#!/bin/sh

function cleanDocker {
    (docker stop $(docker ps -a -q) && docker container prune -f) || true
}

function startMongo {
    docker run -d -p 27017:27017 --name mongo-comunica-filter-benchmark mongo:latest
}


function startBenchmarkServer {
    (npx community-solid-server -c ./benchmark/config.json -f ./benchmark/data) >/dev/null 2>&1 
}

function startDataDourceLocationLdes_1_446Topology {
    cleanDocker
    startMongo &
    node initialize_ldes.mjs -p 1 -l 446 -s 'location-LDES'
    startBenchmarkServer &
}

function startDataDourceLocationLdes_20_10Topology {
    cleanDocker
    startMongo &
    node initialize_ldes.mjs -p 20 -l 10 -s 'location-LDES'
    startBenchmarkServer &
}

function startDataDourceLocationLdes_5_5Topology {
    cleanDocker
    startMongo &
    node initialize_ldes.mjs -p 5 -l 5 -s 'location-LDES'
    startBenchmarkServer &
}

function startDataSourceLocationDataDump {
    node data_dump_config_generation.mjs -s "location-LDES" && (npx http-server ./benchmark/data/location-LDES -p 8080) >/dev/null 2>&1 
}

function startDataSourceDahcc1PDataDump {
    node data_dump_config_generation.mjs -s "dahcc-1-participant" && npx http-server benchmark/data/dahcc_1_participant -p 8080 >/dev/null 2>&1
}

function liberateSPARQLEndpointPort {
    (fuser -k 5000/tcp || true)
}

function liberateLDESHostingPort {
    (fuser -k 3000/tcp || true)
}

function liberateDataDumpPort {
    (fuser -k 8080/tcp || true)
}

function createNewOutputFile {
    rm ./benchmark/output -f && touch ./benchmark/output
}
function createSPARQLEnpoint {
        export NODE_OPTIONS="--max-old-space-size=8000"  
        comunica-sparql-http http://localhost:8080/data.ttl -p 5000 -t $COMUNICA_TIMEOUT -i -l info -w 3 --freshWorker --lenient
}
function createSPARQLLTQTEnpoint {
    node ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $1 -p 5000 -i -l info -w 3 --freshWorker --lenient
}

function runBenchmark {
    if [ $1 = 1 ] ; then 
        sleep 5 && node benchmark.mjs -d
    else 
        sleep 5 && node benchmark.mjs 
    fi
}

function protoBenchmark {
    sleep 10
    liberateSPARQLEndpointPort
    createNewOutputFile
    if [[ $2 = 0 ]]; then
        echo link traversal 
        (createSPARQLLTQTEnpoint $1 &> ./benchmark/output) &
    else
        echo single endpoint
        (createSPARQLEnpoint $1 &> ./benchmark/output) &
    fi
    runBenchmark $3
    liberateSPARQLEndpointPort 
}

function benchmarkFollowTree {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_tree.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark $DATASOURCE_PATH 0 $1
}

function benchmarkFollowTreeSolver {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_tree_solver.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark $DATASOURCE_PATH 0 $1
}

function benchmarkFollowAll {
    export COMUNICA_CONFIG=./benchmark/config_comunica_follow_all.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoBenchmark $DATASOURCE_PATH 0 $1
}

function benchmarkFollowDataDump {
    unset COMUNICA_CONFIG
    export COMUNICA_TIMEOUT=6000
    DATASOURCE_PATH=http://localhost:8080/data.ttl
    protoBenchmark $DATASOURCE_PATH $1
    unset NODE_OPTIONS
}

function usage {
    cat usage
}
