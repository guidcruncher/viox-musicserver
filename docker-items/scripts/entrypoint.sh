#!/bin/bash

set -e

configure_environment() {
    echo "Configurimg environment"
    mkdir -p $MUSIC_CACHE $PODCAST_CACHE $CACHE_FOLDER /data/stores /config /music /data/mpd/playlists /data/mpd $CACHE_FOLDER/golibrespot $CACHE_FOLDER/stores /run/dbus $MUSIC_FOLDER

    export LIBRESPOT_DATADIR=/data/golibrespot/
    export SNAPSERVER_DATADIR=/data/snapserver/
    export SNAPCLIENT_HOSTID="$SPOTIFY_DEVICE_NAME"
    export SNAPSERVER_SAMPLEFORMAT="$AUDIO_RATE:$AUDIO_SAMPLERATE:$AUDIO_CHANNELS"
    export SNAPSERVER_SOURCE="pipe:///tmp/outputstream?name=pipewire&sampleformat=$SNAPSERVER_SAMPLEFORMAT&mode=read"
    export SNAPCLIENT_SAMPLEFORMAT="$AUDIO_RATE:$AUDIO_SAMPLERATE:*"

    export AUDIO_FORMAT="S$AUDIO_SAMPLERATE$AUDIO_BYTE_ORDER"
    mkdir -p $LIBRESPOT_DATADIR $SNAPSERVER_DATADIR

    envsubst < /app/snapserver/snapserver.conf > /etc/snapserver.conf
    envsubst < /app/alsa/asound.conf > /etc/asound.conf
    envsubst < /app/mpd/mpd.conf > /etc/mpd.conf
    envsubst < /app/mpd/mpc.conf > /etc/mpc.conf
    envsubst < /app/librespot/config.yml > $CACHE_FOLDER/golibrespot/config.template

    for filename in /app/dsp/*; do
        target="/etc/pipewire/pipewire.conf.d/$(basename $filename)"
        if [ -f "$filename" ]; then
          envsubst < "$filename" > "$target"
        fi
    done

    for fname in /app/pipewire/*; do
        target="/etc/pipewire/pipewire.conf.d/$(basename $fname)"
        if [ -f "$fname" ]; then
          envsubst < "$fname" > "$target"
        fi
    done

    if [ ! -f "/data/server-config.json" ]; then
       cp /app/server-config.json /data/server-config.json
    fi

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
    mkdir -p /config/hrtf
    cp /app/hrtf/* /config/hrtf/
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
    snapclient --player alsa -s "$SNAPCLIENT_ALSA_DEVICE" \
        --hostID "$SNAPCLIENT_HOSTID" \
        --sampleformat "$SNAPCLIENT_SAMPLEFORMAT" \
        --logsink stdout \
        --host 127.0.0.1 &

    echo "Snapcast Client started"

   echo "{" > /app/client/config.json
   echo "\"baseUrl\": \"${BASE_URL}\"," >> /app/client/config.json 
   echo "\"apiUrl\": \"${BASE_URL}\"" >> /app/client/config.json
   echo "}" >> /app/client/config.json
   cp /app/client/config.json /app/client/public/config.json
}

echo "Entrypoint script: Running initialization tasks..."

# 1. Run configuration logic
configure_environment

echo "Initialization complete. Starting application."

mpd -v /etc/mpd.conf --no-daemon &
sleep 3
mpc volume ${INITIAL_VOLUME}
mpc update
mpc clear 

mkdir -p /data/golibrespot/
cp $CACHE_FOLDER/golibrespot/config.template $LIBRESPOT_DATADIR/config.yml
/usr/local/bin/go-librespot --config_dir $LIBRESPOT_DATADIR &

node /app/api/index.js
