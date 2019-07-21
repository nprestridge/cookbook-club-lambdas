#!/bin/bash

set -e

package="package.zip"
if [ -f $package ]
then
    rm $package
fi

cp src/config/local.ci.js src/config/local.js
sed -e "s/ENDPOINT/${ENDPOINT}/g" -e "s/REGION/${REGION}/g" src/config/production.ci.js > src/config/production.js
