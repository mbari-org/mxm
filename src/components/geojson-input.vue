<template>
  <div :style="sizeInfo.containerStyle">
    <div class="text-h5">{{paramName}}</div>
    <qgeomap
      v-if="config"
      ref="qgeomap"
      :google-api-key="config.googleApiKey"
      :editable="editable"
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
        return `${this.paramName}:${this.paramType}`
      },

      sizeInfo() {
        return this.editable ? {
          containerStyle: 'max-width:600px',
          qgeomapStyle: 'height:600px;width:600px',
        } : {
          containerStyle: 'max-width:400px',
          qgeomapStyle: 'height:400px;width:400px',
        }
      },
    },

    data () {
      return {
        config: null,
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

      this.$store.dispatch('config/loadConfig')
          .then(config => {
            this.config = config
            this.$nextTick(() => {
              this.setFeatureData(this.value)
            })
          })
    },

    methods: {
      setFeatureData(value) {
        const qgeomap = this.$refs.qgeomap

        this.valueString = value && value.trim() || ''

        const entry_id = this.entry_id

        let entry = null
        if (this.valueString) {
          try {
            const json = JSON.parse(this.valueString)
            if (debug) console.debug(`setFeatureData: paramType=${this.paramType } json=`, json)

            const geometry = simple2geojson(this.paramType, this.valueString)

            if (geometry) {
              entry = {
                entry_id,
                geometry,
                color: 'cyan',
                tooltip: entry_id,
              }
            }
          }
          catch (error) { // TODO
            console.warn(error)
          }
        }
        if (entry) {
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
        }
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

  function simple2geojson(paramType, simple) {
    const json = JSON.parse(simple)
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
