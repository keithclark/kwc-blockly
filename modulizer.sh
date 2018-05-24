modulizer --out . \
--npm-name @kano/kwc-blockly \
--npm-version 3.0.0-beta.5 \
--dependency-mapping kwc-style,@kano/kwc-style,^3.0.0-beta.1 \
--dependency-mapping kwc-color-picker,@kano/kwc-color-picker,^3.0.0-beta.3
echo "window.goog = goog;window.Blockly=Blockly;" >> blockly_built/blockly_compressed.js
sed -i "s|import '../../@kano/kwc-color-picker/palettes/material.js'|import { Material } from '../../@kano/kwc-color-picker/palettes/material.js'|g" import.js
sed -i "s|KwcColorPickerPalette.Material'|Material'|g" import.js
