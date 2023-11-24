#!/usr/bin/env bash

# brew install potrace inkscape

set -e

OUTPUT_ICON="$(pwd)/favicon.ico"
OUTPUT_LOGO_ICON="$(pwd)/logo.png"

echo "Starting convert: $1"

convert -background transparent "$1" -define icon:auto-resize=32 "$OUTPUT_ICON"
convert "$1" "png8:$OUTPUT_LOGO_ICON"

echo "Output to: $OUTPUT_ICON"
echo "Output to: $OUTPUT_LOGO_ICON"
