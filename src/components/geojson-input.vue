<template>
  <div class="gjMap">
    <l-map
      ref="gjMap"
      style="height: 100%; width: 100%"
      :zoom="zoom"
      :center="center"
    >
      <l-layer-group v-if="points">
        <l-polyline :lat-lngs="points"
        >
        </l-polyline>

      </l-layer-group>

    </l-map>
  </div>
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
        if (this.value.trim()) {
          try {
            const points = JSON.parse(this.value)
            points.push(points[0]) // to close loop
            console.debug('geojson-input: points=', points)
            return points
          }
          catch (error) {
            // TODO
            console.warn(error)
          }
        }
      }
    },

    mounted() {
      if (debug) console.debug(`geojson-input mounted: paramName='${this.paramName}'`)
      initMap(this.$refs.gjMap.mapObject)
    },

    methods: {
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
