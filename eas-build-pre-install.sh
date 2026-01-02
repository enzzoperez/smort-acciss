#!/bin/bash

set -e

echo "Creating Google Services files from secrets..."

# Android
mkdir -p android/app
echo "$GOOGLE_SERVICES_JSON" > android/app/google-services.json

# iOS
mkdir -p ios
echo "$GOOGLE_SERVICE_INFO_PLIST" > ios/GoogleService-Info.plist
