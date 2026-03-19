###############################################
# 1. Builder Stage
###############################################
FROM guidcruncher/vioxbase:alpine-latest AS builder

WORKDIR /build

# Copy dependency manifests first for caching
COPY package.json package-lock.json* ./

# Install full dependency tree deterministically
# Note: In Alpine, some npm packages with C++ addons may need:
# RUN apk add --no-cache python3 make g++
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the TypeScript project
RUN npm run build


###############################################
# 2. Runtime Stage
###############################################
FROM guidcruncher/vioxbase:alpine-latest AS runtime

# Install system dependencies via apk
# - gettext provides envsubst
# - procps provides the full 'ps' utility
RUN apk add --no-cache \
    alsa-lib \
    avahi-libs \
    expat \
    ffmpeg \
    flac \
    gettext \
    jq \
    libvorbis \
    opus \
    procps \
    soxr
    
# Environment variables
ENV RADIO_PROVIDER=radiobrowser \
    PODCAST_CACHE=/data/podcastcache \
    MUSIC_CACHE=/data/musiccache \
    MPD_HOST=127.0.0.1 \
    MPD_PORT=6600 \
    MPD_PASSWORD= \
    SPOTIFY_DEVICE_NAME="Speaker" \
    SNAPCLIENT_ALSA_DEVICE="hw:CARD=AUDIO,DEV=0" \
    AUDIO_BACKEND=pulseaudio \
    AUDIO_DEVICE=librespot \
    INITIAL_VOLUME=75 \
    AUDIO_BITRATE=320 \
    AUDIO_RATE=48000 \
    AUDIO_SAMPLERATE=16 \
    AUDIO_BYTE_ORDER=LE \
    AUDIO_CHANNELS=2 \
    AUDIO_POSITION=FL,FR \
    CACHE_FOLDER=/cache \
    MUSIC_FOLDER=/music \
    SNAPSERVER_DATADIR=/cache/snapserver/ \
    SNAPSERVER_CODEC=flac \
    SNAPSERVER_CHUNK_MS=26 \
    SNAPSERVER_BUFFER=1000 \
    SEARCH_BACKEND_LIMIT=50 \
    SEARCH_CACHE_SIZE=2000 \
    SPATIAL_AUDIO_HRTF=atmos.wav \
    NODE_ENV=production

# Create required directories
RUN mkdir -p \
    /app/api \
    /etc/pipewire/pipewire.conf.d/ \
    /etc/pipewire/pipewire-pulse.conf.d/ \
    /usr/share/wireplumber/scripts/ \
    /etc/wireplumber/wireplumber.conf.d/ \
    /etc/librespot/ \
    /run/user/1000 \
    /data /config/hrtf \
    /app/snapserver \
    /app/librespot \
    /app/pipewire \
    /app/hrtf \
    /app/dsp \
    /app/client/public \
    /app/mpd \
    /app/alsa \
    /run/user/1000/pulse \
    /music \
    /data/mpd/playlists \
    /data/mpd

RUN mkdir -p /run/user/1000 && chown 0:0 /run/user/1000 && chmod 700 /run/user/1000

###############################################
# Copy built output + node_modules
###############################################
WORKDIR /app/api

COPY --from=builder /build/dist/ ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./package.json

###############################################
# MPD setup
###############################################
RUN mkdir -p /var/lib/mpd /var/run/mpd /var/log/mpd \
    && chown -R root:root /var/lib/mpd /var/run/mpd /var/log/mpd

RUN chmod 700 /run/user/1000 /run/user/1000/pulse

###############################################
# Copy configs
###############################################
COPY ./docker-items/config/hrtf/* /app/hrtf/
COPY ./docker-items/config/server-config.json /app/
COPY ./docker-items/config.yml /app/librespot/config.yml
COPY ./docker-items/config/asound.conf /app/alsa/asound.conf
COPY ./docker-items/config/pipewire/ /etc/pipewire/
COPY ./docker-items/config/dsp/* /app/dsp/
RUN mv /etc/pipewire/pipewire.conf.d/* /app/pipewire/

COPY ./docker-items/config/snapserver.conf /app/snapserver/snapserver.conf

###############################################
# ALSA compatibility
###############################################
RUN mkdir -p /etc/alsa/conf.d && \
    echo 'pcm.!default { type pulse }' > /etc/alsa/conf.d/99-pulse.conf && \
    echo 'ctl.!default { type pulse }' >> /etc/alsa/conf.d/99-pulse.conf

###############################################
# Scripts
###############################################
COPY ./docker-items/scripts/status.sh /usr/local/bin/status.sh
COPY ./docker-items/scripts/youtube-auth.sh /usr/local/bin/youtube-auth.sh
COPY ./docker-items/scripts/on_event.sh /usr/local/bin/on_event.sh
COPY ./docker-items/scripts/entrypoint.sh /app/entrypoint.sh
COPY ./docker-items/scripts/profile.sh /etc/profile.d/profile.sh

RUN chmod +x /etc/profile.d/profile.sh \
    && chmod +x /app/*.sh \
    && chmod +x /usr/local/bin/*.sh

EXPOSE 8080 1705 1704

WORKDIR /home/librespot

# Ensure bash is specified correctly since Alpine's default is ash
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["/app/entrypoint.sh"]
