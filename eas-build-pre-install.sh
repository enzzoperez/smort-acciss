#!/bin/bash

set -e

echo "Creating Google Services files from secrets..."

# Android
mkdir -p android/app
printf '%s' "$GOOGLE_SERVICES_JSON" > android/app/google-services.json

# iOS
mkdir -p ios/tutismartaccess
printf '%s' "$GOOGLE_SERVICE_INFO_PLIST" > ios/tutismartaccess/GoogleService-Info.plist
