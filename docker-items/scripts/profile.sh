#!/bin/bash

    export SNAPSERVER_DATADIR=$CACHE_FOLDER/snapserver/
    export SNAPCLIENT_HOSTID="$SPOTIFY_DEVICE_NAME"
    export SNAPSERVER_SAMPLEFORMAT="$AUDIO_RATE:$AUDIO_SAMPLERATE:$AUDIO_CHANNELS"
    export SNAPSERVER_SOURCE="pipe:///tmp/outputstream?name=pipewire&sampleformat=$SNAPSERVER_SAMPLEFORMAT&mode=read"
    export SNAPCLIENT_SAMPLEFORMAT="$AUDIO_RATE:$AUDIO_SAMPLERATE:*"

    export AUDIO_FORMAT="S$AUDIO_SAMPLERATE$AUDIO_BYTE_ORDER"

    # Check if D-Bus session bus address is set
    if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
        if [ -f "/run/dbus.pid" ]; then
            rm -f /run/dbus.pid
        fi

        if [ ! -f "/run/dbus/machine-id" ]; then
            dbus-uuidgen > /run/dbus/machine-id
        fi

        export $(dbus-launch)
        echo "D-Bus session launched. Address is: $DBUS_SESSION_BUS_ADDRESS"
    else
        echo "D-Bus session already running."
    fi

