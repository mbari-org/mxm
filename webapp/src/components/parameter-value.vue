<template>
  <div>
    {{ paramValueModel || (paramRequired ? '??' : '') }}

    <q-menu
      v-if="paramType && (editable || $mxmVal.isGeojsonType(paramType))"
      ref="q-popup-edit"
      @keyup.enter.stop="setValue"
      @cancel="cancel"
      @hide="cancel"
      @escape-key="cancel"
      :cover="false" self="top left"
    >
      <div class="q-ma-md">
        <parameter-value-input
          :label="label"
          :param-name="paramName"
          :param-required="paramRequired"
          v-model="paramValueModel"
          :param-type="paramType"
          :editable="editable"
        />
        <div v-if="editable" class="q-mt-sm">
          <q-separator/>
          <div class="row q-mt-xs justify-center q-gutter-x-lg">
            <q-btn
              :disable="paramValue === paramValueModel"
              no-caps dense color="positive"
              label="Set"
              @click.stop="setValue"
            />
            <q-btn
              v-if="originalValue"
              :disable="paramValueModel === originalValue"
              label="Reset" no-caps dense color="warning"
              @click.stop="resetValue"
            />
            <q-btn
              no-caps dense color="light" text-color="black"
              label="Cancel"
              @click.stop="cancel"
            />
          </div>
        </div>
      </div>
    </q-menu>
  </div>
</template>

<script>
  import ParameterValueInput from 'components/parameter-value-input'

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
        required: false
      },

      valueCanReference: {
        type: String,
        required: false
      },

      paramValue: {
        type: String,
        default: ''
      },

      paramRequired: {
        type: Boolean,
        default: false
      },

      originalValue: {
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
      dummy: '',
      paramValueModel: null,
    }),

    mounted() {
      this.paramValueModel = this.paramValue
    },

    methods: {
      errorMessage() {
        return this.$mxmVal &&
          this.$mxmVal.checkValue(
            this.paramValue, this.paramType, this.paramRequired,
            this.valueCanReference
          )
      },

      setValue() {
        this.$emit('save', this.paramValueModel)
        this.$refs['q-popup-edit'].hide()
      },

      resetValue() {
        this.paramValueModel = this.originalValue
        this.$emit('save', this.paramValueModel)
        this.$refs['q-popup-edit'].hide()
      },

      cancel() {
        this.paramValueModel = this.paramValue
        this.$emit('save', this.paramValueModel)
        this.$refs['q-popup-edit'].hide()
      },
    },

    watch: {
      paramValue(val) {
        this.paramValueModel = val
      },
    },
  }
</script>
