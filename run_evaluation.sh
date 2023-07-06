#!/bin/sh

. ./script.sh --source-only

follow_all_config=0
follow_tree_config=0
follow_tree_solver_config=0
server=0

data_source=''

demo=0

if [ $# -eq 0 ]; then
    usage 
    exit 1
fi

data_source=$1
shift

while [ "$1" != "" ]; do
    case $1 in
    --all)
        follow_all_config=1
        echo going to test with the follow all criteria
        ;;
    --tree)
        follow_tree_config=1
        echo going to test with the follow TREE criteria
        ;;
    --tree-solver)
        follow_tree_solver_config=1
        echo going to test with the follow TREE-Guided criteria
        ;;
    --demo)
        demo=1
        ;;
    --server)
        server=1
        ;;
    -h | --help)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
    esac
    shift
done

case $data_source in
    install-injestor)
        installTreeDataDumpInjestor
        exit 0
        ;;
    download-dataset)
        downloadDahcc1ParticipantDataset
        exit 0
        ;;
    dahcc-1-participant)
        liberateDataHostingPort
        if [ $server = 0 ]; then
            startDataSourceDahcc1PDataDump &
        else
            startDataSourceDahcc1PDataDump
            exit 0
        fi
        evaluationFollowDataDump $demo
        ;;
    dahcc-1-participant-one-ary-tree-100)
        liberateDataHostingPort
        if [ $server = 0 ]; then
            startLDESOneAry100FragmentDataSourceDahcc1P 0
        else
            startLDESOneAry100FragmentDataSourceDahcc1P 1
            liberateSPARQLEndpointPort
            exit 0
        fi
        ;;
    *)
        echo not a supported dataset
        usage
        exit 1
        ;;
esac

if [ $follow_tree_solver_config = 1 ]; then
    evaluationFollowTree $demo
fi

if [ $follow_tree_config = 1 ] ; then
    evaluationFollowTreeSolver $demo
fi

if [ $follow_all_config = 1 ]; then
    evaluationFollowAll $demo
fi

liberateSPARQLEndpointPort
liberateDataHostingPort

