<template>
  <div>
    <geojson-input
      v-if="isGeojsonType"
      :param-name="paramName"
      :param-type="paramType"
      :default-value="defaultValue"
      :readonly="readonly"

      :value="paramValue"
      @input="val => { paramValue = val; $emit('input', val) }"
    />

    <q-input
      v-else
      class="round-borders q-pa-xs bg-green-1"
      :stack-label="paramName"
      :readonly="readonly"
      :clearable="!readonly"
      :clear-value="defaultValue"
      :type="inputProps.type"
      :style="inputProps.style"
      :rows="inputProps.rows"

      :value="value"
      @change="val => { $emit('change', val) }"
      @input="val => { $emit('input', val) }"
    />
  </div>
</template>

<script>
  import geojsonInput from 'components/geojson-input'

  export default {
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

    components: {
      geojsonInput,
    },

    data() {
      return {
        paramValue: this.value,
      }
    },

    computed: {
      isGeojsonType() {
        switch (this.paramType) {
          case 'Point':
          case 'MultiPoint':
          case 'LineString':
          case 'MultiLineString':
          case 'Polygon':
          case 'MultiPolygon':
          case 'GeometryCollection':
          // https://tools.ietf.org/html/rfc7946#section-3
          case 'GeoJSON':
            return true

          // https://tools.ietf.org/html/rfc7946#section-3.2
          // case 'feature':
          // case 'featurecollection': return ??

          default:
            return false
        }
      },

      inputProps() {
        let type = "text"
        let style = "font-family:monospace"
        let rows = "1"

        switch (this.paramType) {
          case 'float':
          case 'int':
          case 'boolean':
            break

          case 'string':
            style += ";width:30em"
            break

          default:
            type = "textarea"
            style += ";width:40em"
            rows = "5"
        }

        return {type, rows, style}
      },
    },
  }
</script>
