# PXS UI

**WIP**

## Development

### Reqs

[Quasar Framework](http://quasar-framework.org/)

    npm install -g vue-cli
    npm install -g quasar-cli

### Development

NOTE: Adjust `src/plugins/apollo.js` to set the `uri` of the
GraphQL endpoint as appropriate.

    npm install
    quasar dev

which opens: http://localhost:8080/index.html

## Build and install

### odss-test setup

TODO adjust setup for the recent GraphQL based mechanism.

As `odssadm`:

        sudo mkdir /var/www/html/pxs-ui
        sudo chown carueda:carueda /var/www/html/pxs-ui

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
