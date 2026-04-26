#!/bin/bash

set -e

configure_environment() {

    export IR_RESPONSE_BASE=/app/ir-files

    if chrt -f 1 true 2>/dev/null; then 
      export HAS_CAP_SYS_NICE=true
      echo "CAP_SYS_NICE detected. Real-time priority enabled."
    else
      export HAS_CAP_SYS_NICE=false
      echo "CAP_SYS_NICE not detected. Running with default priority."
    fi

    echo "Configurimg environment"
    mkdir -p $CACHE_FOLDER /data/auth /data/snapserver /config /music /data/golibrespot /run/dbus $MUSIC_FOLDER

    echo "Environment configured."

    if [ -f "/data/nowplaying.json" ]; then
       rm /data/nowplaying.json
    fi

    if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
        if [ ! -f "/run/dbus/machine-id" ]; then
            dbus-uuidgen > /run/dbus/machine-id
        fi

        if [ -f "/run/dbus.pid" ]; then
            rm -f /run/dbus.pid
        fi
        export $(dbus-launch)
        echo "D-Bus session launched. Address is: $DBUS_SESSION_BUS_ADDRESS"
    else
        echo "D-Bus session already running."
    fi

    echo "Setting up audio output device"
    rm -f /tmp/outputstream
    mkfifo /tmp/outputstream
    chmod 666 /tmp/outputstream

    echo "Starting Snapcast Server"
    /usr/bin/snapserver -d -c /etc/snapserver.conf

    sleep 3
    chmod 666 /tmp/outputstream
    echo "Snapcast Server started"

    echo "Starting Pipewire"
    exec /usr/bin/pipewire -c /etc/pipewire/pipewire.conf &

    while [ "$(pgrep -f /usr/bin/pipewire)" = "" ]; do
            sleep 1
    done

    if [ -x /usr/bin/wireplumber ]; then
        exec /usr/bin/wireplumber -c /etc/wireplumber/wireplumber.conf &
    fi

    exec /usr/bin/pipewire-pulse -c /etc/pipewire/pipewire-pulse.conf &
    sleep 3
    pactl set-default-sink input.eq-sink

    until pactl info > /dev/null 2>&1; do
      echo "Waiting for PulseAudio server..."
      sleep 0.5
    done

    echo "Pipewire started"

    echo "Starting MPV"

    rm -rf /tmp/mpv-ipc
    mkdir -p /tmp/mpv-ipc
    chmod 777 /tmp/mpv-ipc
    exec mpv --idle --no-video --no-terminal --really-quiet --ao=pulse --input-ipc-server=/tmp/mpv-ipc/socket --vo=null --osc=no --osd-level=0 --audio-buffer=0.5 --pulse-host=unix:/run/user/1000/pulse/native & >/dev/null
    sleep 2
    echo "MPV started"

}

echo "Entrypoint script: Running initialization tasks..."

# 1. Run configuration logic
configure_environment

echo "Initialization complete. Starting application."


mkdir -p /data/golibrespot/
cp  /app/golibrespot-config.template  /data/golibrespot/config.yml
/usr/local/bin/go-librespot --config_dir /data/golibrespot &

node /app/api/index.js
