###############################################
# 1. Builder Stage
###############################################
FROM guidcruncher/vioxbase:latest AS builder

WORKDIR /build

# Copy dependency manifests first for caching
COPY package.json package-lock.json* pnpm-lock.yaml ./

# Install full dependency tree deterministically
# Note: In Alpine, some pnpm packages with C++ addons may need:
# RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm approve-builds --all

# Copy the rest of the project
COPY . .

# Build the TypeScript project
RUN pnpm run build


###############################################
# 2. Runtime Stage
###############################################
FROM guidcruncher/vioxbase:latest AS runtime

# Environment variables
ENV RADIO_PROVIDER=radiobrowser \
    CACHE_FOLDER=/data/cache \
    MUSIC_FOLDER=/music \
    SEARCH_BACKEND_LIMIT=50 \
    SEARCH_CACHE_SIZE=2000 \
    DOWNLOAD_PODCASTS=true \
    NODE_ENV=production

    # Create required directories
RUN mkdir -p \
    /app/api \
    /app/ir-files /data/golibrespot /data/snapserver /run/dbus /config /music \
    /etc/pipewire/pipewire.conf.d/ \
    /etc/pipewire/pipewire-pulse.conf.d/ \
    /usr/share/wireplumber/scripts/ \
    /etc/wireplumber/wireplumber.conf.d/ \
    /etc/librespot/ \
    /run/user/1000 \
    /data \
    /app/snapserver \
    /app/librespot \
    /app/pipewire \
    /app/dsp \
    /app/client/public \
    /app/alsa \
    /run/user/1000/pulse \
    /music

RUN mkdir -p /run/user/1000 && chown 0:0 /run/user/1000 && chmod 700 /run/user/1000

###############################################
# Copy built output + node_modules
###############################################
WORKDIR /app/api

COPY --from=builder /build/dist/ ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./package.json

RUN chmod 700 /run/user/1000 /run/user/1000/pulse

###############################################
# Copy configs
###############################################
COPY ./docker-items/config/server-config.json /app/
COPY ./docker-items/config/asound.conf /etc/asound.conf
COPY ./docker-items/config/config.yml /app/golibrespot-config.template
COPY ./docker-items/config/pipewire/ /etc/pipewire/
COPY ./docker-items/config/wireplumber/ /etc/wireplumber/
COPY ./docker-items/ir-files/* /app/ir-files/

COPY ./docker-items/config/snapserver.conf /etc/snapserver.conf

###############################################
# ALSA compatibility
###############################################
RUN mkdir -p /etc/alsa/conf.d && \
    echo 'pcm.!default { type pulse }' > /etc/alsa/conf.d/99-pulse.conf && \
    echo 'ctl.!default { type pulse }' >> /etc/alsa/conf.d/99-pulse.conf

###############################################
# Scripts
###############################################
COPY ./docker-items/scripts/entrypoint.sh /app/entrypoint.sh
COPY ./docker-items/scripts/mpv.sh /usr/local/bin/mpv.sh

RUN chmod +x /app/*.sh \
    && chmod +x /usr/local/bin/*.sh

EXPOSE 8080 1705 1704

WORKDIR /home/librespot

# Ensure bash is specified correctly since Alpine's default is ash
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/entrypoint.sh"]
