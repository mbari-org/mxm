# PXS UI

**WIP**

## Development

### Reqs

[Quasar Framework](http://quasar-framework.org/)

    npm install -g vue-cli
    npm install -g quasar-cli

### Development

    npm i
    quasar dev

which opens: http://localhost:8080/index.html


## odss-test setup

As `odssadm`:

        sudo mkdir /var/www/html/pxs-ui
        sudo carueda:carueda /var/www/html/pxs-ui

## Build and install

NOTE: adjust `src/plugins/axios.js` to set `baseURL: '/pxs/api'`

```
quasar build && \
(cd dist/spa-mat && tar zcf ../pxs-ui.tgz *) && \
scp dist/pxs-ui.tgz odss-test.shore.mbari.org:/var/www/html/pxs-ui/ && \
ssh odss-test.shore.mbari.org <<'EOF'
  cd /var/www/html/pxs-ui/
  tar xf pxs-ui.tgz
EOF
```

Open http://odss-test.shore.mbari.org/pxs-ui
