<template>
  <div style="max-width:400px">
    <pre>entry_id = {{entry_id}}</pre>
    <qgeomap
      ref="qgeomap"
      :editable="!readonly"
      v-on:warning="showWarning"
      include-table
      style="height:600px; width:400px"
    />
    <span style="word-break: break-all">valueString = {{valueString}}</span>
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

      readonly: {
        type: Boolean,
        required: false,
        default: false
      },
    },

    computed: {
      entry_id() {
        return `${this.paramName}:${this.paramType}`
      }
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
      readonly=${this.readonly}
      `)
      this.setFeatureData(this.value)
    },

    methods: {
      setFeatureData(value) {
        const qgeomap = this.$refs.qgeomap

        this.valueString = value || ''

        const entry_id = this.entry_id

        let json
        if (this.valueString.trim()) {
          try {
            json = JSON.parse(this.valueString)
            switch (this.paramType) {
              case 'Point': {
                if (debug) console.debug(`setFeatureData: paramType=${this.paramType} point=`, json)
                const coordinates = [json[1], json[0]]
                qgeomap.addEntry({
                  entry_id,
                  geometry: {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates,
                    },
                  },
                  color: 'cyan',
                  tooltip: entry_id,
                })
                break
              }

              case 'Polygon': {
                if (debug) console.debug(`setFeatureData: paramType=${this.paramType } polygon=`, json)

                const coordinates = [ map(json, ([lat, lon]) => [lon, lat]) ]

                qgeomap.addEntry({
                  entry_id,
                  geometry: {
                    type: "Feature",
                    geometry: {
                      type: "Polygon",
                      coordinates,
                    },
                  },
                  color: 'yellow',
                  tooltip: 'Polygon',
                })
                break
              }

              case 'MultiPoint': {
                if (debug) console.debug(`setFeatureData: paramType=${this.paramType} json=`, json)
                break
              }

              // TODO the other paramType's
            }
          }
          catch (error) { // TODO
            console.warn(error)
          }
        }
        return json
      },

      updateValueString(json) {
        this.valueString = json && stringify(json) || ''
        console.debug(`::: updateValueString emiting '${this.valueString}'`)
        this.$emit('input', this.valueString)
      },

      showWarning(message) {
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

  // basically just to reduce precision of coordinates entered or edited
  // prior to notifying parent component
  const stringify = json => {
    if (Array.isArray(json) && !json.length) {
      return ''   // avoid returning `[]`
    }
    else {
      return JSON.stringify(json, (k, v) => {
        return typeof v === 'number' && v.toFixed ? +v.toFixed(6) : v
      })
    }
  }

</script>
