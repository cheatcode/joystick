#!/bin/bash
PG_PORT=$1
PG_DATA_DIR=$2

sudo -u postgres pg_ctl start -o "-p ${$PG_PORT}" -D $PG_DATA_DIR