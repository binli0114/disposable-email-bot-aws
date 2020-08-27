#!/usr/bin/env bash

echo 'Configuring env variables'
export ENVIRONMENT=development SERVICE_VERSION=v1 AWS_PROFILE=mylab

echo 'Deploying'

sls deploy --profile mylab --region us-east-1 --domainName happyeme.com

echo 'Done'
