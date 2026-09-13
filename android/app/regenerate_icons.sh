#!/bin/bash
rm -rf src/main/res/mipmap-*dpi/ic_launcher*.png
mkdir -p tmp_icons

convert ../../assets/icon.png -resize 48x48 tmp_icons/ic_launcher_mdpi.png
convert ../../assets/icon.png -resize 72x72 tmp_icons/ic_launcher_hdpi.png
convert ../../assets/icon.png -resize 96x96 tmp_icons/ic_launcher_xhdpi.png
convert ../../assets/icon.png -resize 144x144 tmp_icons/ic_launcher_xxhdpi.png
convert ../../assets/icon.png -resize 192x192 tmp_icons/ic_launcher_xxxhdpi.png

for d in mdpi hdpi xhdpi xxhdpi xxxhdpi
do
  mkdir -p src/main/res/mipmap-$d
  cp tmp_icons/ic_launcher_$d.png src/main/res/mipmap-$d/ic_launcher.png
done

rm -rf tmp_icons
echo "✅ Launcher icons regenerated successfully!"
