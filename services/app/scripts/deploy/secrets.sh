#!/bin/bash

##
# Update repo secrets 
##

cd $(dirname $0)

output_file="../../deploy/action-secrets.env"
env_file="../../.env"
file_path="../../deploy/action-secrets.conf"

# Read .env file
source $env_file

declare -a files=()

while read -r line; 
do
    [ "${line:0:1}" = "#" ] && continue
    files+=("$line")
done < $file_path


# Loop through 
for file in "${files[@]}"
do
   echo "$file=\"${!file}\""
done > $output_file

# create secret with GitHub cli
gh secret set MYSECRET -f $output_file
