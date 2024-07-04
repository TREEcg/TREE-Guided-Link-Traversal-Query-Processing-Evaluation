#!/bin/sh

export COMUNICA_TIMEOUT=60
export DATASOURCE_LDES=http://localhost:8080/0.ttl
export DATASOURCE_DATADUMP=http://localhost:8080/data.ttl
export DATASOURCE_METADATA=http://localhost:8080/metadata.ttl

export FRAGMENTATION_NAME="undefined_"
export CONFIG_NAME="undefined"
export NUMBER_REPETITION=20
export MODE="undefined"
export SPACE_SIZE=9000
export DATASET_NAME="undefined"

function startDataSourceDahcc1PDataDump {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    FRAGMENTATION_NAME="datadump_1_participant_dahcc"
    DATASET_NAME="Dahcc1P"
    npx http-server evaluation/data/dahcc_1_participant -p 8080 >/dev/null &> ./evaluation/server_log &
    if [ $1 = 1 ] ; then 
        touch ./evaluation/sparql_comunica_log
        unset COMUNICA_CONFIG
        : > ./evaluation/sparql_comunica_log
        createSPARQLEnpoint &> ./evaluation/sparql_comunica_log
        exit 0
    fi
}

function startDataSourceDahcc1PLDEServer {
    touch ./evaluation/server_log
    : > ./evaluation/server_log
    DATASET_NAME="Dahcc1P"
    cp ./evaluation/data/dahcc_1_participant/metadata.ttl ./evaluation/data/dahcc_1_participant_ldes/metadata.ttl
    npx http-server ./evaluation/data/dahcc_1_participant_ldes -p 8080 >/dev/null &> ./evaluation/server_log &
    if [ $1 = 1 ] ; then 
        touch ./evaluation/sparql_comunica_log
        : > ./evaluation/sparql_comunica_log
        createSPARQLLTQTEnpoint &> ./evaluation/sparql_comunica_log
        exit 0
    fi
}


function startLDESOneAry100FragmentDataSourceDahcc1P {
    export n=100
    export f=oneAryTree
    FRAGMENTATION_NAME="${f}${n}"
    mkdir -p ./evaluation/data/dahcc_1_participant_ldes
    ./TREE-datadump-injestor/target/release/data-dump-to-tree -n $n -d ./evaluation/data/dahcc_1_participant/data.ttl -c ./TREE-datadump-injestor/config.json -o ./evaluation/data/dahcc_1_participant_ldes -f $f
    startDataSourceDahcc1PLDEServer $1
    
 }

 function startLDESOneAry1000FragmentDataSourceDahcc1P {
    export n=1000
    export f=oneAryTree
    FRAGMENTATION_NAME="${f}${n}"
    mkdir -p ./evaluation/data/dahcc_1_participant_ldes
    ./TREE-datadump-injestor/target/release/data-dump-to-tree -n $n -c ./TREE-datadump-injestor/config.json -o ./evaluation/data/dahcc_1_participant_ldes -f $f
    startDataSourceDahcc1PLDEServer $1

 }

  function startLDESLinkedList1000FragmentDataSourceDahcc1P {
    export n=1000
    export f=linkedList
    FRAGMENTATION_NAME="${f}${n}"
    mkdir -p ./evaluation/data/dahcc_1_participant_ldes
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
    #export NODE_OPTIONS="--max-old-space-size=3000"
    #comunica-sparql-http $DATASOURCE_DATADUMP $DATASOURCE_METADATA -p 3000 -t $COMUNICA_TIMEOUT -i -w 3
    #unset NODE_OPTIONS

    node --max-old-space-size=8000 comunica/engines/query-sparql/bin/http.js $DATASOURCE_DATADUMP $DATASOURCE_METADATA -p 3000 -t $COMUNICA_TIMEOUT -i -w 1
}

function createSPARQLLTQTEnpoint {
    node --max-old-space-size=8000 ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $DATASOURCE_LDES $DATASOURCE_METADATA -p 3000 -i -l info -w 1 -t $COMUNICA_TIMEOUT --freshWorker --lenient
}

function runEvaluation {
    node ./evaluation.mjs -n $NUMBER_REPETITION -t $FRAGMENTATION_NAME -m $MODE -s $SPACE_SIZE --timeout $COMUNICA_TIMEOUT --dataset-name $DATASET_NAME
}

function protoEvaluation {
    createNewOutputFile
    echo $MODE
    runEvaluation 
}

function evaluationFollowTree {
    export MODE="TREE"
    protoEvaluation
}

function evaluationFollowTreeSolver {
    export MODE="TREE-GUIDED"
    protoEvaluation 
}

function evaluationDataDump {
    export MODE="DATA-DUMP"
    protoEvaluation
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
