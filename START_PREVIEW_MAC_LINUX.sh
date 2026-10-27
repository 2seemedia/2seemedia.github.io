#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf 'Open http://localhost:8765/dashboard.html in your browser\n'
python3 -m http.server 8765
