#!/bin/sh
echo "STARTING DNS"
DOCKER_ROTATOR_HOSTNAME=rotating_tor
FILE_PATH=/etc/proxychains/proxychains.conf
sed -i "s/{{IP_PROXY}}/$(dig +short $DOCKER_ROTATOR_HOSTNAME)/g" $FILE_PATH

