<template>
  <div>
    <geojson-input
      v-if="$mxmVal.isGeojsonType(paramType)"
      :label="label"
      :param-name="paramName"
      :param-type="paramType"
      :editable="editable"
      :value="paramValue"
      @input="val => { paramValue = val; $emit('input', val) }"
    />

    <div v-else-if="paramType === 'boolean'">
      <div v-if="label" class="q-mb-md text-bold">{{ label }}</div>
      <div class="q-ml-sm q-gutter-lg">
        <q-radio
          :disable="!editable"
          label="true"
          dense size="xs"
          :value="value" val="true"
          @input="val => { paramValue = val; $emit('input', val) }"
        />
        <q-radio
          :disable="!editable"
          label="false"
          dense size="xs"
          :value="value" val="false"
          @input="val => { paramValue = val; $emit('input', val) }"
        />
        <q-radio
          v-if="!paramRequired"
          :disable="!editable"
          label="Unspecified"
          dense size="xs"
          :value="value" val=""
          @input="val => { paramValue = val; $emit('input', val) }"
        />
      </div>
    </div>

    <div v-else>
      <div v-if="label" class="q-mb-sm text-bold">{{ label }}</div>
      <q-input
        class="q-ml-sm rounded-borders q-pa-xs bg-green-1"
        autofocus dense
        :readonly="!editable"
        :clearable="editable"
        :type="inputProps.type"
        :style="inputProps.style"
        :rows="inputProps.rows"
        :value="value"
        @change="val => { $emit('change', val) }"
        @input="val => { $emit('input', val && val.trim() || '') }"
      />

    </div>
  </div>
</template>

<script>
  import geojsonInput from 'components/geojson-input'

  const debug = true

  export default {
    props: {
      label: {
        type: String,
        required: false
      },

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

      editable: {
        type: Boolean,
        default: false
      },
    },

    components: {
      geojsonInput,
    },

    data: () => ({
      paramValue: '',
    }),

    mounted() {
      if (debug) console.log(`MOUNTED parameter-value-input
      paramName=${this.paramName}
      paramType=${this.paramType}
      value=${this.value}
      editable=${this.editable}
      `)

      this.paramValue = this.value
    },

    computed: {
      inputProps() {
        let type = "text"
        let style = "font-family:monospace"
        let rows = "1"

        switch (this.paramType) {
          case 'float':
          case 'int':
          case 'integer':
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
