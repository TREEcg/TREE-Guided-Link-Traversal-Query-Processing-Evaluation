#!/bin/sh

function startDataSourceDahcc1PDataDump {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    node data_dump_config_generation.mjs -s "dahcc-1-participant" 
    npx http-server evaluation/data/dahcc_1_participant -p 8080 >/dev/null &> ./evaluation/server_log
}

function startDataSourceDahcc1PLDEServer {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    npx http-server ./evaluation/data/dahcc_1_participant_ldes -p 8080 >/dev/null &> ./evaluation/server_log
}


function startLDESOneAry100FragmentDataSourceDahcc1P {
    export n=100
    export f=oneAryTree
    mkdir -p ./evaluation/data/dahcc_1_participant_ldes
    node ./ldes_config_generator.mjs -s dahcc-1-participant -n $n
    ./TREE-datadump-injestor/target/release/data-dump-to-tree -n $n -c ./TREE-datadump-injestor/config.json -o ./evaluation/data/dahcc_1_participant_ldes -f $f
    if [ $1 = 1 ] ; then 
        touch ./evaluation/sparql_comunica_log
    : > ./evaluation/sparql_comunica_log
        startDataSourceDahcc1PLDEServer &
        export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree_solver.json
        export COMUNICA_TIMEOUT=60
        DATASOURCE_PATH=http://localhost:8080/0.ttl
        createSPARQLLTQTEnpoint $DATASOURCE_PATH &> ./evaluation/sparql_comunica_log
    else 
        startDataSourceDahcc1PLDEServer &
    fi
 }

function liberateSPARQLEndpointPort {
    (fuser -k 5000/tcp || true)
}

function liberateDataHostingPort {
    (fuser -k 8080/tcp || true)
}

function createNewOutputFile {
    rm ./evaluation/output -f && touch ./evaluation/output
}
function createSPARQLEnpoint {
    export NODE_OPTIONS="--max-old-space-size=8000"
    comunica-sparql-http http://localhost:8080/data.ttl -p 5000 -t $COMUNICA_TIMEOUT -i -l info -w 3 --freshWorker --lenient
    unset NODE_OPTIONS
}
function createSPARQLLTQTEnpoint {
    node --max-old-space-size=8000 ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $1 -p 5000 -i -l info -w 1 -t $COMUNICA_TIMEOUT --freshWorker --lenient
}

function runevaluation {
    unset NODE_OPTIONS
    if [ $1 = 1 ] ; then 
        sleep 5 && node evaluation.mjs -d
    else 
        sleep 5 && node evaluation.mjs 
    fi
}

function protoEvaluation {
    sleep 10
    liberateSPARQLEndpointPort
    createNewOutputFile
    if [[ $2 = 0 ]]; then
        echo link traversal 
        (createSPARQLLTQTEnpoint $1 &> ./evaluation/output) &
    else
        echo single endpoint
        (createSPARQLEnpoint $1 &> ./evaluation/output) &
    fi
    runevaluation $3
    liberateSPARQLEndpointPort 
}

function evaluationFollowTree {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:8080/0.ttl
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowTreeSolver {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree_solver.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:8080/0.ttl
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowAll {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_all.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:8080/0.ttl
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowDataDump {
    unset COMUNICA_CONFIG
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:8080/data.ttl
    protoEvaluation $DATASOURCE_PATH 1 $1
}

function downloadDahcc1ParticipantDataset { 
    curl https://dahcc.idlab.ugent.be/data/data_kg/dataset_participant31.nt.gz > ./evaluation/data/dahcc_1_participant/archive.nt.gz
    gzip -d -c ./evaluation/data/dahcc_1_participant/archive.nt.gz > ./evaluation/data/dahcc_1_participant/data.ttl
    rm ./evaluation/data/dahcc_1_participant/archive.nt.gz
}

function installTreeDataDumpInjestor {
    cd ./TREE-datadump-injestor && cargo build --release
    cd ..
}

function usage {
    cat usage
}
