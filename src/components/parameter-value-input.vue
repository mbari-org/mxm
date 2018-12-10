<template>
  <div>
    <q-input
      class="round-borders q-pa-xs bg-green-1"
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
  export default {
    props: {
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

        switch (this.paramType.toLowerCase()) {
          case 'float':
          case 'int':
            break

          case 'boolean':
            style += ";width:3em"
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
