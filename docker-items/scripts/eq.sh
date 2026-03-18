#!/usr/bin/env bash

EQ_NODE=$(pw-cli ls Node | grep '"node.name" = "eq"' -B1 | head -n1 | awk '{print $1}' | tr -d ':')

band="$1"
gain="$2"

if [ -z "$band" ] || [ -z "$gain" ]; then
    echo "Usage: eq <band1..band10> <gain>"
    exit 1
fi

pw-cli set-param "$EQ_NODE" Props "{\"$band\": { \"gain\": $gain }}"

echo "Set $band gain = $gain dB"