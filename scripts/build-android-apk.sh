#! /bin/bash -e
echo ""
echo "Build Android release apk file"

echo ""
echo "Current directory:"
pwd

echo ""
echo "Create Android JS Bundle"
yarn react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

echo ""
echo "Remove android/app/build folder"
rm -rf android/app/build

cd android
echo "Current directory:"
pwd
echo ""
echo "Clean and Build"
echo ""
./gradlew clean
./gradlew bundleReleaseJsAndAssets
./gradlew assembleRelease -x bundleReleaseJsAndAssets
cd ..
echo ""
echo "Current directory:"
pwd
echo ""
echo "Done!"
echo "apk file can be found at:"
echo "$(pwd)/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Please go to: https://appcenter.ms/orgs/asurion-uap/applications"
echo "and upload the apk file"

exit 0
