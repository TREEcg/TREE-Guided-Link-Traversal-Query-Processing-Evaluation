#!/bin/sh

. ./script.sh --source-only

follow_all_config=0
follow_tree_config=0
follow_tree_solver_config=0

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
        startDataSourceDahcc1PDataDump &
        benchmarkFollowDataDump $demo
        ;;
    location-LDES)
        liberateLDESHostingPort
        liberateDataDumpPort
        startDataSourceLocationDataDump &
        benchmarkFollowDataDump $demo
        ;;
    location-LDES-1-446)
        liberateLDESHostingPort
        liberateDataDumpPort
        startDataDourceLocationLdes_1_446Topology &
        ;;
    location-LDES-20-10)
        liberateLDESHostingPort
        liberateDataDumpPort
        startDataDourceLocationLdes_20_10Topology &
        ;;
    location-LDES-5-5)
        liberateLDESHostingPort
        liberateDataDumpPort
        startDataDourceLocationLdes_5_5Topology &
        ;;

    *)
        echo not a supported dataset
        usage
        exit 1
        ;;
esac

if [ $follow_tree_solver_config = 1 ]; then
    benchmarkFollowTree $demo
fi

if [ $follow_tree_config = 1 ] ; then
    benchmarkFollowTreeSolver $demo
fi

if [ $follow_all_config = 1 ]; then
    benchmarkFollowAll $demo
fi

liberateLDESHostingPort
liberateDataDumpPort

