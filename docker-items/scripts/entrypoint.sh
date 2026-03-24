#!/bin/bash

set -e

configure_environment() {
    echo "Configurimg environment"
    mkdir -p $MUSIC_CACHE $PODCAST_CACHE $CACHE_FOLDER /data/snapserver /config /music /data/golibrespot /run/dbus $MUSIC_FOLDER

    echo "Environment configured."

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
        exec /usr/bin/wireplumber -c /usr/share/wireplumber/wireplumber.conf &
    fi

    exec /usr/bin/pipewire-pulse -c /etc/pipewire/pipewire-pulse.conf &
    echo "Pipewire started"

    echo "Starting Snapcast Client"
    snapclient --player alsa -s "hw:CARD=AUDIO,DEV=0" \
        --hostID "VIOX Speaker" \
        --sampleformat "48000:16:2" \
        --logsink stdout \
        --host 127.0.0.1 &

    echo "Snapcast Client started"

}

echo "Entrypoint script: Running initialization tasks..."

# 1. Run configuration logic
configure_environment

echo "Initialization complete. Starting application."


mkdir -p /data/golibrespot/
cp  /app/golibrespot-config.template  /data/golibrespot/config.yml
/usr/local/bin/go-librespot --config_dir /data/golibrespot &

node /app/api/index.js
