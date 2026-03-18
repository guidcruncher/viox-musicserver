#!/bin/bash

pactl list "$1" short | jq -R -s '
  split("\n") | map(select(length > 0)) | map(
    split("\t") | {
      id: .[0] | tonumber,
      name: .[1],
      driver: .[2],
      sample_spec: .[3],
      state: .[4]
    }
  )
'

