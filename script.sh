#!/bin/sh

function cleanDocker {
    (docker stop $(docker ps -a -q) && docker container prune -f) || true
}

function startMongo {
    docker run -d -p 27017:27017 --name mongo-comunica-filter-evaluation mongo:latest
}


function startEvaluationServer {
    (npx community-solid-server -c ./evaluation/config.json -f ./evaluation/data) &> ./evaluation/server_log
}

function startDataDourceDahcc1P_100kTopology {
    export NODE_OPTIONS="--max-old-space-size=8000" 
    cleanDocker
    startMongo &
    node initialize_linked_list_ldes.mjs -b 100000 -s'dahcc-1-participant'
    startEvaluationServer &
    cd ./LDES-in-SOLID-Semantic-Observations-Replay/engine  
    npm i  
    npm start
    cd ./../..

}

function startDataDourceLocationLdes_1_446Topology {
    cleanDocker
    startMongo &
    node initialize_b_tree_ldes.mjs -p 1 -l 446 -s 'location-LDES'
    startEvaluationServer 
}

function startDataDourceLocationLdes_20_10Topology {
    cleanDocker
    startMongo &
    node --max-old-space-size=8000 initialize_b_tree_ldes.mjs -p 20 -l 10 -s 'location-LDES'
    startEvaluationServer 
}

function startDataDourceLocationLdes_5_5Topology {
    cleanDocker
    startMongo &
    node initialize_b_tree_ldes.mjs -p 5 -l 5 -s 'location-LDES'
    startEvaluationServer 
}

function startDataSourceLocationDataDump {
    node data_dump_config_generation.mjs -s "location-LDES" && (npx http-server ./evaluation/data/location-LDES -p 8080) &> ./evaluation/server_log 
}

function startDataSourceDahcc1PDataDump {
    node data_dump_config_generation.mjs -s "dahcc-1-participant" && npx http-server evaluation/data/dahcc_1_participant -p 8080 >/dev/null &> ./evaluation/server_log
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
    rm ./evaluation/output -f && touch ./evaluation/output
}
function createSPARQLEnpoint {
        export NODE_OPTIONS="--max-old-space-size=8000"  
        comunica-sparql-http http://localhost:8080/data.ttl -p 5000 -t $COMUNICA_TIMEOUT -i -l info -w 3 --freshWorker --lenient
}
function createSPARQLLTQTEnpoint {
    node ./comunica-feature-link-traversal/engines/query-sparql-link-traversal/bin/http.js $1 -p 5000 -i -l info -w 3 --freshWorker --lenient
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
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowTreeSolver {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_tree_solver.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowAll {
    export COMUNICA_CONFIG=./evaluation/config_comunica_follow_all.json
    export COMUNICA_TIMEOUT=60
    DATASOURCE_PATH=http://localhost:3000/ldes/test
    protoEvaluation $DATASOURCE_PATH 0 $1
}

function evaluationFollowDataDump {
    unset COMUNICA_CONFIG
    export COMUNICA_TIMEOUT=6000
    DATASOURCE_PATH=http://localhost:8080/data.ttl
    protoEvaluation $DATASOURCE_PATH $1
    unset NODE_OPTIONS
}

function downloadDahcc1ParticipantDataset { 
    curl https://dahcc.idlab.ugent.be/data/data_kg/dataset_participant31.nt.gz > ./evaluation/data/dahcc_1_participant/archive.nt.gz
    gzip -d -c ./evaluation/data/dahcc_1_participant/archive.nt.gz > ./evaluation/data/dahcc_1_participant/data.ttl
    rm ./evaluation/data/dahcc_1_participant/archive.nt.gz
}

function usage {
    cat usage
}
