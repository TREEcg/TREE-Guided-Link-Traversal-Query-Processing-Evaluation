#!/bin/sh

. ./script.sh --source-only

touch ./evaluation/server_log
: > ./evaluation/server_log

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
    --download-dataset)
        downloadDahcc1ParticipantDataset
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
    shift # remove the current value for `$1` and use the next
done

case $data_source in
    dahcc-1-participant)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataSourceDahcc1PDataDump &
        else
            startDataSourceDahcc1PDataDump
            exit 0
        fi
        evaluationFollowDataDump $demo
        ;;
    location-LDES)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataSourceLocationDataDump &
        else
            startDataSourceLocationDataDump
            exit 0
        fi
        evaluationFollowDataDump $demo
        ;;
    location-LDES-1-446)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataDourceLocationLdes_1_446Topology &
        else
            startDataDourceLocationLdes_1_446Topology
            exit 0
        fi
        ;;
    location-LDES-20-10)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataDourceLocationLdes_20_10Topology 
        else
            startDataDourceLocationLdes_1_446Topology
            exit 0
        fi
        ;;
    location-LDES-5-5)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataDourceLocationLdes_5_5Topology &
        else
            startDataDourceLocationLdes_5_5Topology
            exit 0
        fi
        ;;
    dahcc-1-participant-100k)
        liberateLDESHostingPort
        liberateDataDumpPort
        if [ $server = 0 ]; then
            startDataDourceDahcc1P_100kTopology 
        else
            startDataDourceDahcc1P_100kTopology
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

liberateLDESHostingPort
liberateDataDumpPort

