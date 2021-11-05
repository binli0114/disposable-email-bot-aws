#!/usr/bin/env bash

echo 'Configuring env variables'
export ENVIRONMENT=development SERVICE_VERSION=v1 AWS_PROFILE=mylab

echo 'Testing'

sls invoke local -f checkIncomingEmail --profile mylab --region us-east-1 -p ./mocks/sesEvent.json

echo 'Done'
