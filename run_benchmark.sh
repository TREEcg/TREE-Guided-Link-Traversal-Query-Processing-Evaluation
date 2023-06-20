#!/bin/sh

. ./script.sh --source-only

data_dump_config=false
follow_all_config=false
follow_tree_config=false
follow_tree_solver_config=false

data_source=''

if [ $# -eq 0 ]; then
    usage 
    exit 1
fi

data_source=$1
shift

while [ "$1" != "" ]; do
    case $1 in
    --all)
        follow_all_config=true
        echo going to test with the follow all criteria
        ;;
    --tree)
        follow_tree_config=true
        echo going to test with the follow TREE criteria
        ;;
    --tree-solver)
        follow_tree_solver_config=true
        echo going to test with the follow TREE-Guided criteria
        ;;
    --data-dump)
        data_dump_config=true
        echo going to test the data dump
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
