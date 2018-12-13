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
          <l-feature-group
            ref="featureGroup"
          >
            <l-circle-marker
              v-if="paramType === 'point' && point.length"
              :lat-lng="point"
            />

            <l-circle-marker
              v-if="paramType === 'multipoint' && points.length"
              v-for="(p, index) in points" :key="`${p[0]},${p[1]},${index}`"
              :lat-lng="p"
            />

            <l-polygon
              v-if="paramType === 'polygon' && polygon.length"
              :lat-lngs="polygon"
            />

          </l-feature-group>

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
        {{ `'${paramType}'` }}
        <q-scroll-area
          style="width:200px; height: 400px;"
          :thumb-style="{ background: 'blue', borderRadius: '5px' }"
        >
          <position-table
            v-if="paramType === 'point' && point.length"
            :lat-lons="[point]"
          />

          <position-table
            v-if="paramType === 'multipoint' && points.length"
            :lat-lons="points"
          />

          <position-table
            v-if="paramType === 'polygon' && polygon.length"
            :lat-lons="polygon"
          />

          <div style="font-size:x-small">
            <pre v-if="point.length">point={{point}}</pre>
            <pre v-if="points.length">points={{points}}</pre>
            <pre v-if="polygon.length">polygon={{polygon}}</pre>
          </div>
        </q-scroll-area>
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
  require('leaflet-draw/dist/leaflet.draw')
  import _ from 'lodash'

  import PositionTable from 'components/position-table'

  const {
    LMap,
    LMarker,
    LFeatureGroup,
    LLayerGroup,
    LPolyline,
    LPolygon,
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
      LFeatureGroup,
      LLayerGroup,
      LPolyline,
      LPolygon,
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

        point: [],
        points: [],
        polygon: [],
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
      this.setFeatureData()

      this.$nextTick(() => {
        const map = this.$refs.gjMap.mapObject
        if (debug) console.debug(`geojson-input mounted: paramName='${this.paramName}'`, 'map=', map)

        const featureGroup = this.$refs.featureGroup.mapObject
        console.debug('mounted: featureGroup=', featureGroup)
        initMap(this.paramType, map, featureGroup, this)
      })
    },

    methods: {
      setFeatureData() {
        this.point.splice(0)
        this.points.splice(0)
        this.polygon.splice(0)

        let json
        if (this.value.trim()) {
          try {
            json = JSON.parse(this.value)
          }
          catch (error) { // TODO
            console.warn(error)
            return
          }
        }
        else return

        switch (this.paramType) {
          case 'point': {
            this.point = json
            if (debug) console.debug(`setFeatureData: paramType=${this.paramType} point=`, this.point)
            break
          }

          case 'multipoint': {
            this.points = json
            if (debug) console.debug(`setFeatureData: paramType=${this.paramType} points=`, this.points)
            break
          }

          case 'polygon': {
            this.polygon = json
            if (debug) console.debug(`setFeatureData: paramType=${this.paramType } polygon=`, this.polygon)
            break
          }

          // TODO the other paramType's
        }
      },

      layerCreated(layer) {
        console.debug('layerCreated:', 'layer=', layer)

        switch (this.paramType) {
          case 'point': {
            if (layer._latlng) {
              this.point = [layer._latlng.lat, layer._latlng.lng]
              console.debug('layerCreated: point=', this.point)
            }
            break
          }

          case 'multipoint': {
            if (layer._latlng) {
              this.points.push([layer._latlng.lat, layer._latlng.lng])
              console.debug('layerCreated: points=', this.points)
            }
            break
          }

          case 'polygon': {
            if (layer._latlngs && layer._latlngs.length) {
              this.polygon = _.map(layer._latlngs[0], ({lat, lng}) => [lat, lng])
              console.debug('layerCreated: polygon=', this.polygon)
            }
            break
          }

          // TODO the other paramType's
        }
      },

      layersEdited() {
        const featureGroup = this.$refs.featureGroup.mapObject
        switch (this.paramType) {
          case 'point': {
            this.point.splice(0)
            const layer = _.head(featureGroup.getLayers())
            if (layer && layer._latlng) {
              this.point = [layer._latlng.lat, layer._latlng.lng]
            }
            break
          }

          case 'multipoint': {
            this.points.splice(0)
            featureGroup.eachLayer(layer => {
              if (layer && layer._latlng) {
                this.points.push([layer._latlng.lat, layer._latlng.lng])
              }
            })
            console.debug('layersEdited: points=', this.points)
            break
          }

          case 'polygon': {
            this.polygon.splice(0)
            const layer = _.head(featureGroup.getLayers())
            console.debug('---layersEdited: polygon: layer=', layer)
            if (layer && layer._latlngs && layer._latlngs.length) {
              _.each(layer._latlngs[0], ({lat, lng}) => {
                this.polygon.push([lat, lng])
              })
            }
            console.debug('layersEdited: polygon=', this.polygon)
            break
          }

          // TODO the other paramType's
        }
      },

      layersDeleted() {
        const featureGroup = this.$refs.featureGroup.mapObject

        switch (this.paramType) {
          case 'point':
            this.point.splice(0)
            console.debug('layersDeleted: point=', this.point)
            break

          case 'multipoint':
            // just grab all remaining points in featureGroup:
            this.points.splice(0)
            featureGroup.eachLayer(layer => {
              console.debug('::: featureGroup layer._latlng=', layer._latlng)
              if (layer._latlng) {
                this.points.push([layer._latlng.lat, layer._latlng.lng])
              }
            })
            console.debug('layersDeleted: points=', this.points)
            break

          case 'polygon':
            this.polygon.splice(0)
            console.debug('layersDeleted: polygon=', this.polygon)
            break

          // TODO the other paramType's
        }
      },

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

  function initMap(paramType, map, featureGroup, listener) {
    console.debug('initMap: paramType=', paramType)
    L.DomUtil.addClass(map._container,'my-default-cursor')

    mousePosition.addToMap(map)

    initBaseLayers(map)

    L.control.measure({
      primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters'
    }).addTo(map)

    initEditor(paramType, map, featureGroup, listener)
  }

  function initBaseLayers(map) {
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
  }

  function initEditor(paramType, map, featureGroup, listener) {
    let circle = false
    let circlemarker = false  // {icon: new MyCustomMarker()}
    let marker = false  // {icon: new MyCustomMarker()}
    let rectangle = false
    let polyline = false
    let polygon = false

    let repeatMode = false

    const enableMarker = () => {
      marker = {
        repeatMode,
      }
    }

    const enableCircleMarker = () => {
      circlemarker = {
        shapeOptions: {
          weight: 4
        },
        repeatMode,
      }
    }

    const enablePolyline = () => {
      polyline = {
        shapeOptions: {
          color: '#f357a1',
          weight: 4
        }
      }
    }

    const enableRectangle = () => {
      rectangle = {
        shapeOptions: {
          color: '#f357a1',
          weight: 4
        }
      }
    }

    const enablePolygon = () => {
      polygon = {
        allowIntersection: false, // Restricts shapes to simple polygons
        drawError: {
          color: '#e1e100', // Color the shape will turn when intersects
        },
        shapeOptions: {
          color: '#bada55'
        }
      }
    }

    switch (paramType) {
      case 'point':
        enableMarker()
        enableCircleMarker()
        break

      case 'multipoint':
        repeatMode = true
        enableMarker()
        enableCircleMarker()
        break

      case 'linestring':
        enablePolyline()
        break

      case 'multilinestring':
        enablePolyline()
        break

      case 'polygon':
        enableRectangle()
        enablePolygon()
        break

      case 'multipolygon':
        repeatMode = true
        enableRectangle()
        enablePolygon()
        break

      case 'geometrycollection':
        repeatMode = true
        enableMarker()
        enableCircleMarker()
        enablePolyline()
        enableRectangle()
        enablePolygon()
        break

      case 'geometry':
        break

      case 'feature':
      case 'featurecollection':
        break

      case 'geojson':
        break
    }

    const options = {
      position: 'topright',
      draw: {
        circle,
        circlemarker,
        marker,
        rectangle,
        polyline,
        polygon,
      },
      edit: {
        featureGroup,
        edit: {
          selectedPathOptions: {
            maintainColor: true,
            opacity: 0.5
          }
        },
        remove: true,
      }
    }

    const drawControl = new L.Control.Draw(options)
    map.addControl(drawControl)

    map.on(L.Draw.Event.CREATED, e => {
      listener.layerCreated(e.layer)
    })

    map.on(L.Draw.Event.EDITED, e => {
      listener.layersEdited()
    })

    map.on(L.Draw.Event.DELETED, e => {
      listener.layersDeleted()
    })
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
<style src="leaflet-draw/dist/leaflet.draw.css" />

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
    margin-left: 25px;
    margin-top: 55px;
  }
</style>
