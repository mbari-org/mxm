<template>
  <div :style="sizeInfo.containerStyle">
    <div class="text-h5">{{paramName}}</div>
    <qgeomap
      ref="qgeomap"
      :google-api-key="$mxmConfig.googleApiKey"
      :editable="editable"
      v-on:startEditing="_startEditing"
      v-on:editsApplied="_editsApplied"
      v-on:warning="_showWarning"
      include-table
      :style="sizeInfo.qgeomapStyle"
    />
    <span style="word-break:break-all;font-size:0.7em">{{valueString}}</span>
  </div>
</template>

<script>
  import map from 'lodash/map'

  const debug = true

  export default {
    props: {
      paramName: {
        type: String,
        required: true
      },

      paramType: {
        type: String,
        default: 'Point'
      },

      value: {
        type: String,
        required: false
      },

      defaultValue: {
        type: String,
        required: false
      },

      editable: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      entry_id() {
        return this.paramName
      },

      sizeInfo() {
        return this.editable ? {
          containerStyle: 'max-width:500px',
          qgeomapStyle: 'height:500px;width:500px',
        } : {
          containerStyle: 'max-width:400px',
          qgeomapStyle: 'height:350px;width:350px',
        }
      },
    },

    data () {
      return {
        valueString: ''
      }
    },

    mounted() {
      if (debug) console.log(`MOUNTED geojson-input
      paramName=${this.paramName}
      paramType=${this.paramType}
      value=${this.value}
      defaultValue=${this.defaultValue}
      editable=${this.editable}
      `)

      this._setFeatureData(this.value)
    },

    methods: {
      _setFeatureData(value) {
        const qgeomap = this.$refs.qgeomap

        this.valueString = value && value.trim() || ''
        const entry_id = this.entry_id
        const geometry = simple2geojson(this.paramType, this.valueString)

        const entry = {
          entry_id,
          geometry,
          color: 'cyan',
          tooltip: entry_id,
        }

        qgeomap.addEntry(entry)
        this.$nextTick(() => {
          if (this.editable) {
            qgeomap.selectEntry(entry_id)
            qgeomap.editEntry(entry_id)
          }
          else {
            qgeomap.zoomToAll()
          }
        })
      },

      _startEditing(selectedEntry) {
        console.log(`_startEditing: selectedEntry=`, selectedEntry)
        if (!selectedEntry) {
          // TODO any further action here?
        }
        // Else: qgeomap already taking care of the edit.
      },

      _editsApplied(entryEdited) {
        console.log(`_editsApplied: entryEdited=`, entryEdited)
        this._updateValueString(entryEdited.geometry)
      },

      _updateValueString(geometry) {
        this.valueString = geojson2simple(geometry)
        console.debug(`_updateValueString emiting '${this.valueString}'`)
        this.$emit('input', this.valueString)
      },

      _showWarning(message) {
        console.warn('WARN:', message)
        this.$q.notify({
          message,
          position: 'top',
          color: 'warning',
          textColor: 'black',
          timeout: 1500,
        })
      },
    },
  }

  // TODO all of this preliminary
  function simple2geojson(paramType, simple) {
    const json = simple && JSON.parse(simple)
    if (json) {
      switch (paramType) {
        case 'Point': {
          const [lat, lon] = json
          const coordinates = [lon, lat]
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates,
            }
          }
        }

        case 'Polygon': {
          const coordinates = [ map(json, ([lat, lon]) => [lon, lat]) ]
          return {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates,
            }
          }
        }
      }
    }
    else {
      return {
        type: 'FeatureCollection',
        features: [],
      }
    }
  }

  function geojson2simple(geometry) {
    console.log('geojson2simple: geometry=', geometry)

    if (!geometry || Array.isArray(geometry) && !geometry.length) {
      return ''   // avoid returning `[]`
    }

    switch (geometry.type) {
      case 'Feature': {
        // TODO this is very simplistic for now (ignoring feature properties...)
        return geojson2simple(geometry.geometry)
      }

      case 'Point': {
        const coordinates = geometry.coordinates
        const [lon, lat] = coordinates
        const simple = [lat, lon]
        return JSON.stringify(simple)
      }

      case 'Polygon': {
        const [coordinates] = geometry.coordinates
        const simple = map(coordinates, ([lat, lon]) => [lon, lat])
        return JSON.stringify(simple)
      }

      // TODO revisit the 'toFixed" simplification
      default:
        return JSON.stringify(geometry, (k, v) =>
          typeof v === 'number' && v.toFixed ? +v.toFixed(6) : v
        )
    }
  }

</script>
