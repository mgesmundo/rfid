#!/bin/sh

# Generate jsduck documentation
# See [https://github.com/senchalabs/jsduck]

jsduck  lib/rfid.js \
        --output="doc" \
        --title="RFID documentation" \
		--footer="Copyright (c) 2013 Yoovant by Marcello Gesmundo" \
        --warnings=-link,-dup_member,-no_doc
