#!/bin/bash
PG_CTL_PATH=$1
PG_PORT=$2
PG_DATA_DIR=$3

sudo -u postgres $PG_CTL_PATH start -o "-p ${$PG_PORT}" -D $PG_DATA_DIR