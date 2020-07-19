# Some development notes
 
# Along with `qgeomap`

The qgeomap extension dependency was added via the usual mechanism `quasar ext add @mbari/qgeomap`.
(The actual dependency is `@mbari/quasar-app-extension-qgeomap`).

If also doing adjustments in the extension, do the following to "link"
with the local source code of the extension, instead of the published package:

    yarn unlink @mbari/quasar-app-extension-qgeomap
    yarn add --dev link:../../qgeomap
 
which of course assumes the indicated path for qgeomap's root directory.
