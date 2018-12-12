<template>
  <table>
    <tbody>
    <tr>
      <td class="gjMap">
        <div
          class="absolute-top-left map-buttons column items-start"
        >
          <div
            v-if="!$q.platform.is.mobile"
            class="column q-mb-md"
          >
            <q-btn
              dense glossy color="indigo-11"
              icon="add"
              class="shadow-8"
              @click="doZoom(false)"
            >
              <q-tooltip anchor="center left" self="center right" :delay="1000">
                Zoom in
              </q-tooltip>
            </q-btn>
            <q-btn
              v-if="!$q.platform.is.mobile"
              dense glossy color="indigo-11"
              icon="remove"
              class="shadow-8"
              @click="doZoom(true)"
            >
              <q-tooltip anchor="center left" self="center right" :delay="1000">
                Zoom out
              </q-tooltip>
            </q-btn>
          </div>

          <q-btn
            dense glossy color="indigo-11"
            icon="center_focus_weak"
            class="shadow-8"
            @click="zoomToAll()"
          >
            <q-tooltip anchor="center left" self="center right" :delay="1000">
              Zoom to all apositions
            </q-tooltip>
          </q-btn>
        </div>

        <l-map
          ref="gjMap"
          style="height: 100%; width: 100%"
          :zoom="zoom"
          :center="center"
          :options="{zoomControl:false}"
        >
          <l-layer-group v-if="points">
            <l-polyline :lat-lngs="points"
            >
            </l-polyline>

          </l-layer-group>

          <div v-if="mousePos">
            <l-circle-marker
              :lat-lng="mousePos.latLon"
              color="yellow"
              :radius="mousePos.radius"
              dash-array="5 4"
            />
            <l-circle-marker
              :lat-lng="mousePos.latLon"
              :color="mousePos.color"
              :radius="mousePos.radius * 3"
              dash-array="14 6"
            />
          </div>
        </l-map>
      </td>

      <td style="vertical-align:top">
        <position-table
          :lat-lons="value"
        />
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
  import Vue from 'vue'
  import L from 'leaflet'
  import Vue2Leaflet from 'vue2-leaflet'
  require('leaflet-mouse-position/src/L.Control.MousePosition')
  require('leaflet-measure/dist/leaflet-measure')
  import * as esri from 'esri-leaflet/dist/esri-leaflet'
  require('leaflet.gridlayer.googlemutant/Leaflet.GoogleMutant')
  import _ from 'lodash'

  import PositionTable from 'components/position-table'

  const {
    LMap,
    LMarker,
    LLayerGroup,
    LPolyline,
    LPopup,
    LTooltip,
    LCircle,
    LCircleMarker,
  } = Vue2Leaflet

  const debug = true

  export default {
    components: {
      LMap,
      LMarker,
      LLayerGroup,
      LPolyline,
      LPopup,
      LTooltip,
      LCircle,
      LCircleMarker,
      PositionTable
    },

    props: {
      paramName: {
        type: String,
        required: true
      },
      paramType: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: false
      },
      defaultValue: {
        type: String,
        required: false
      },
      readonly: {
        type: Boolean,
        required: false,
        default: false
      },
    },

    data () {
      return {
        center: L.latLng(36.83, -121.9),
        zoom: 10,
        mousePos: null,
      }
    },

    computed: {
      points() {
        let points = null
        if (this.value.trim()) {
          try {
            points = JSON.parse(this.value)
            if (points.length) {
              points.push(points[0]) // to close loop
            }
          }
          catch (error) {
            // TODO
            console.warn(error)
          }
        }
        if (debug) console.debug('geojson-input: points=', points)
        return points
      }
    },

    created () {
      this.$root.$on('evt-map-center-at', this.centerMapAt)
      this.$root.$on('evt-map-on-mouse-pos', this.onMousePos)
    },

    destroyed () {
      this.$root.$off('evt-map-center-at', this.centerMapAt)
      this.$root.$off('evt-map-on-mouse-pos', this.onMousePos)
    },

    mounted() {
      if (debug) console.debug(`geojson-input mounted: paramName='${this.paramName}'`)
      initMap(this.$refs.gjMap.mapObject)
    },

    methods: {
      centerMapAt (lat, lon) {
        this.center = L.latLng(lat, lon)
      },

      onMousePos (lat, lon, vehicleName) {
        if (lat !== undefined) {
          this.mousePos = {
            vehicleName,
            latLon: [lat, lon],
            color: '#ff0000',
            radius: 5,
          }
        }
        else {
          this.mousePos = null
        }
      },

      doZoom (out) {
        const map = this.$refs.gjMap.mapObject
        out ? map.zoomOut() : map.zoomIn()
      },

      zoomToAll () {
        if (!this.points || !this.points.length) {
          return
        }
        const min = _.reduce(this.points, (min, [lat, lon]) => ({
          lat: min.lat ? Math.min(min.lat, lat) : lat,
          lon: min.lon ? Math.min(min.lon, lon) : lon,
        }))
        const max = _.reduce(this.points, (max, [lat, lon]) => ({
          lat: max.lat ? Math.max(max.lat, lat) : lat,
          lon: max.lon ? Math.max(max.lon, lon) : lon,
        }))

        if (debug) console.debug('zoomToAll: min=', min, 'max=', max)

        const bounds = [[max.lat, max.lon], [min.lat, min.lon]]

        const map = this.$refs.gjMap.mapObject
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 })
      },
    },
  }

  function initMap(map) {

    L.DomUtil.addClass(map._container,'my-default-cursor')

    mousePosition.addToMap(map)

    // base layers
    ;(() => {
      const esriOceansLayer = esri.basemapLayer('Oceans')
      const esriOceansLabelsLayer = esri.basemapLayer('OceansLabels')
      const esriOceansWithLabelsLayer = L.featureGroup([esriOceansLayer, esriOceansLabelsLayer])
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      const gHybridLayer = L.gridLayer.googleMutant({type: 'hybrid'})
      const gSatelliteLayer = L.gridLayer.googleMutant({type: 'satellite'})

      // TODO leaflet or esri bug? radio button 'ESRI Oceans' seems to be always pre-selected
      // if 'ESRI Oceans' is added, even though we are adding oceans-with-labels 1st and to the map.
      // Also, a 2nd click on oceans-with-labels brings the one with only the labels!
      const baseLayers = {
        'ESRI Oceans/Labels': esriOceansWithLabelsLayer,
        // 'ESRI Oceans': esriOceansLayer,
        'OpenStreetMap': osmLayer,
        'Google hybrid': gHybridLayer,
        'Google satellite': gSatelliteLayer,
      }
      const controlLayers = L.control.layers(baseLayers).addTo(map)

      let baseLayerName = 'ESRI Oceans/Labels'
      baseLayers[baseLayerName].addTo(map)
    })()

    L.control.measure({
      primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters'
    }).addTo(map)
  }

  // helper related with L.control.mousePosition
  const mousePosition = (() => {
    let prefix = ''  // with depth if available

    const separator = ', '
    const latFormatter = v => prefix + v.toFixed(5)
    const lngFormatter = v => v.toFixed(5)
    const mpos = L.control.mousePosition({
      position: 'topright',
      emptyString: '&nbsp;',
      separator,
      latFormatter,
      lngFormatter,
    })

    return {
      addToMap: map => {
        mpos.addTo(map)
      },
    }
  })()

</script>

<style src="leaflet/dist/leaflet.css" />
<style src="leaflet-measure/dist/leaflet-measure.css" />

<style>
  .gjMap {
    width: 500px;
    height: 400px;
    /*border: 1px solid red;*/
  }

  .leaflet-container.my-default-cursor {
    cursor: default;
  }

  .leaflet-control-mouseposition {
    font-family: monospace, serif !important;
    font-size: smaller !important;
    background-color: rgba(255, 255, 255, 0.75) !important;
    padding: 0 4px 0 4px !important;
    border: 1px solid lightgray;
    border-radius: 4px;
    box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12);
  }

  .leaflet-control-measure h3, .leaflet-measure-resultpopup h3 {
    font-size:1em !important;
    font-weight: bold;
  }
</style>

<style scoped>
  .map-buttons {
    z-index: 9999 !important;
    margin-left: 30px;
    margin-top: 55px;
  }
</style>
