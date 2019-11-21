<template>
  <div>
    <geojson-input
      v-if="$mxmVal.isGeojsonType(paramType)"
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
          :disable="!editable"
          label="true"
          dense size="xs"
          :value="value" val="true"
          @input="val => { $emit('input', val) }"
        />
        <q-radio
          :disable="!editable"
          label="false"
          dense size="xs"
          :value="value" val="false"
          @input="val => { $emit('input', val) }"
        />
        <q-radio
          v-if="!paramRequired"
          :disable="!editable"
          label="Unspecified"
          dense size="xs"
          :value="value" val=""
          @input="val => { $emit('input', val) }"
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
