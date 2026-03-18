#!/usr/bin/env bash

PRESET_FILE="$EQ_PRESETS"

if [ ! -f "$PRESET_FILE" ]; then
    echo "Preset file not found: $PRESET_FILE"
    exit 1
fi

EQ_NODE=$(pw-cli ls Node | grep '"node.name" = "eq"' -B1 | head -n1 | awk '{print $1}' | tr -d ':')

cmd="$1"

# List presets
if [ "$cmd" = "list" ]; then
    jq -r 'keys[]' "$PRESET_FILE"
    exit 0

# Show current EQ values as JSON
if [ "$cmd" = "current" ]; then
    pw-cli dump "$EQ_NODE" \
        | grep -E '"band[0-9]+"' \
        | sed -E 's/.*"([^"]+)".*gain = ([^ ]+).*/"\1": \2,/' \
        | sed '$ s/,$//' \
        | sed '1s/^/{\n/' \
        | sed '$s/$/\n}/'
    exit 0
fi

preset="$cmd"

if [ -z "$preset" ]; then
    echo "Usage:"
    echo "  eq-preset <preset>"
    echo "  eq-preset list"
    echo "  eq-preset current"
    exit 1
fi

# Validate preset
if ! jq -e --arg p "$preset" '.[$p]' "$PRESET_FILE" >/dev/null; then
    echo "Unknown preset: $preset"
    exit 1
fi

# Apply preset
for band in $(jq -r --arg p "$preset" '.[ $p ] | keys[]' "$PRESET_FILE"); do
    gain=$(jq -r --arg p "$preset" --arg b "$band" '.[$p][$b]' "$PRESET_FILE")
    pw-cli set-param "$EQ_NODE" Props "{\"$band\": { \"gain\": $gain }}"
done

echo "Preset applied: $preset"