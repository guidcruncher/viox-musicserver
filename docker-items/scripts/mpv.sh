#!/bin/bash

echo "Starting MPV"
pid=$(pgrep mpv)

if [ -n "$pid" ]; then 
    kill -9 $pid
fi

rm -rf /tmp/mpv-ipc/socket
mkdir -p /tmp/mpv-ipc
chmod 777 /tmp/mpv-ipc
exec  mpv --idle --no-terminal --really-quiet --no-video --ao=pulse --input-ipc-server=/tmp/mpv-ipc/socket --vo=null --osc=no --osd-level=0 --audio-buffer=0.5 --pulse-host=unix:/run/user/1000/pulse/native & > /dev/null
echo "MPV started"
