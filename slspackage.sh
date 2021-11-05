#!/usr/bin/env bash

echo 'Configuring env variables'
export ENVIRONMENT=development SERVICE_VERSION=v1 AWS_PROFILE=mylab

echo 'Packaging'

sls package --profile mylab --region us-east-1

echo 'Done'
