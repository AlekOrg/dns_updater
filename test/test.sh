#!/bin/sh

docker compose up --exit-code-from mock_server
test_status=$?
docker compose down
echo $test_status
