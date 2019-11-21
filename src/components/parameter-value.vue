<template>
  <div>
    {{ _showValue }}

<!--    TODO simplify dispatch if not editing -->
<!--      v-if="editable || $mxmVal.isGeojsonType(paramType)"-->
    <q-popup-edit
      :buttons="editable"
      v-model="paramValueModel"
      @save="val => { $emit('save', val) }"
      @cancel="$emit('cancel')"
    >
      <parameter-value-input
        :param-name="paramName"
        :param-required="required"
        v-model="paramValueModel"
        :param-type="paramType"
        :default-value="defaultValue"
        :editable="editable"
        @input="val => { $emit('save', val) }"
      />
    </q-popup-edit>
  </div>
</template>

<script>
  import ParameterValueInput from 'components/parameter-value-input'

  const debug = true

  export default {
    props: {
      paramName: {
        type: String,
        required: true
      },

      paramType: {
        type: String,
        required: false
      },

      paramValue: {
        type: String,
        default: ''
      },

      required: {
        type: Boolean,
        default: false
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
      ParameterValueInput,
    },

    data: () => ({
      paramValueModel: '',
    }),

    mounted() {
      this.paramValueModel = this.paramValue
    },

    computed: {
      _showValue() {
        if (this.paramValue) {
          return this.paramValue
        }
        else if (this.required) {
          return '??'
        }
        else {
          return ''
        }
      },
    },

    methods: {
      errorMessage() {
        return this.$mxmVal && this.$mxmVal.checkValue(this.paramValue, this.paramType, this.required)
      },
    },
  }

</script>

