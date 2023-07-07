#!/bin/sh

export COMUNICA_TIMEOUT=120
export DATASOURCE_LDES=http://localhost:8080/0.ttl
export DATASOURCE_DATADUMP=http://localhost:8080/data.ttl
export DATASOURCE_METADATA=http://localhost:8080/metadata.ttl

export FRAGMENTATION_NAME="undefined_"
export CONFIG_NAME="undefined"

function startDataSourceDahcc1PDataDump {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    FRAGMENTATION_NAME="datadump"
    npx http-server evaluation/data/dahcc_1_participant -p 8080 >/dev/null &> ./evaluation/server_log &
    if [ $1 = 1 ] ; then 
        touch ./evaluation/sparql_comunica_log
        : > ./evaluation/sparql_comunica_log
        createSPARQLEnpoint &> ./evaluation/sparql_comunica_log
        exit 0
    fi
}

function startDataSourceDahcc1PLDEServer {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    cp ./evaluation/data/dahcc_1_participant/metadata.ttl ./evaluation/data/dahcc_1_participant_ldes/metadata.ttl
    npx http-server ./evaluation/data/dahcc_1_participant_ldes -p 8080 >/dev/null &> ./evaluation/server_log &
    if [ $1 = 1 ] ; then 
        touch ./evaluation/sparql_comunica_log
        : > ./evaluation/sparql_comunica_log
        export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree_solver.json
        createSPARQLLTQTEnpoint &> ./evaluation/sparql_comunica_log
        exit 0
    fi
}


function startLDESOneAry100FragmentDataSourceDahcc1P {
    export n=100
    export f=oneAryTree
    FRAGMENTATION_NAME="${f}${n}"
    mkdir -p ./evaluation/data/dahcc_1_participant_ldes
    node ./ldes_config_generator.mjs -s dahcc-1-participant -n $n
    ./TREE-datadump-injestor/target/release/data-dump-to-tree -n $n -c ./TREE-datadump-injestor/config.json -o ./evaluation/data/dahcc_1_participant_ldes -f $f
    startDataSourceDahcc1PLDEServer $1
    
 }

function liberateSPARQLEndpointPort {
    (fuser -k 5000/tcp || true)
}

function liberateDataHostingPort {
    (fuser -k 8080/tcp || true)
}

function createNewOutputFile {
    touch ./evaluation/output
    : > ./evaluation/output
}

function createSPARQLEnpoint {
    export NODE_OPTIONS="--max-old-space-size=8000"
    comunica-sparql-http $DATASOURCE_DATADUMP $DATASOURCE_METADATA -p 5000 -t $COMUNICA_TIMEOUT -i -l info -w 1 --freshWorker --lenient
    unset NODE_OPTIONS
}

function createSPARQLLTQTEnpoint {
    node --max-old-space-size=8000 ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $DATASOURCE_LDES $DATASOURCE_METADATA -p 5000 -i -l info -w 1 -t $COMUNICA_TIMEOUT --freshWorker --lenient
}

function runEvaluation {
    unset NODE_OPTIONS
    sparql-benchmark-runner -e http://localhost:5000/sparql -q ./evaluation/query --output "./results/${FRAGMENTATION_NAME}_${CONFIG_NAME}" --replication 1 --warmup 1

}

function protoEvaluation {
    liberateSPARQLEndpointPort
    createNewOutputFile
    if [[ $2 = 0 ]]; then
        echo link traversal 
        (createSPARQLLTQTEnpoint &> ./evaluation/output) &
    else
        echo single endpoint
        (createSPARQLEnpoint &> ./evaluation/output) &
    fi
    sleep 10
    runEvaluation
    liberateSPARQLEndpointPort 
}

function evaluationFollowTree {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree.json
    protoEvaluation 0
}

function evaluationFollowTreeSolver {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree_solver.json
    protoEvaluation  0
}

function evaluationFollowDataDump {
    unset COMUNICA_CONFIG
    protoEvaluation 1
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
