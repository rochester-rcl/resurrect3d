#!/bin/bash

cd /home/node/working

if [ ! -d "node_modules" ]; then
    echo "Installing Node Modules" && npm install
fi

exec npm start