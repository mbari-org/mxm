<template>
  <div>
    <geojson-input
      v-if="isGeojsonType"
      :param-name="paramName"
      :param-type="paramType"
      :default-value="defaultValue"
      :editable="editable"

      :value="paramValue"
      @input="val => { paramValue = val; $emit('input', val) }"
    />

    <div v-else-if="paramType === 'boolean'" class="q-pa-md">
      <div class="q-gutter-lg">
        <q-radio
          dense :value="value" val="true"  @input="val => { $emit('input', val) }" label="true"
        />
        <q-radio
          dense :value="value" val="false" @input="val => { $emit('input', val) }" label="false"
        />
        <q-radio
          v-if="!paramRequired"
          dense :value="value" val="" @input="val => { $emit('input', val) }" label="No default value"
        />
      </div>
    </div>

    <q-input
      v-else
      class="rounded-borders q-pa-xs bg-green-1"
      stack-label :label="paramName"
      autofocus
      :readonly="!editable"
      :clearable="editable"
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

  const debug = true

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

      paramRequired: {
        type: Boolean,
        default: false
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

    components: {
      geojsonInput,
    },

    mounted() {
      if (debug) console.log(`MOUNTED parameter-value-input
      paramName=${this.paramName}
      paramType=${this.paramType}
      value=${this.value}
      defaultValue=${this.defaultValue}
      editable=${this.editable}
      `)
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
