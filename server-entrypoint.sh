#!/bin/bash

cd /home/node/working

if [ ! -d "node_modules" ]; then
    echo "Installing Node Modules" && npm install
fi

if [ "$NODE_ENV" == "production" ] 
then
    echo npm run build
    exec node server-build/index.js
else
    if [ "$TESTING" == "true" ]
    then
        exec npm run test
    else
        exec npm run dev
    fi
fi

