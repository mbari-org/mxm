<template>
  <div>
    {{ _showValue }}

<!--    TODO simplify dispatch if not editing -->
<!--      v-if="editable || $mxmVal.isGeojsonType(paramType)"-->
    <q-popup-edit
      v-model="paramValueModel"
      @save="val => { $emit('save', val) }"
      @cancel="$emit('cancel')"
      :cover="false" self="top left"
    >
      <template v-slot="{ initialValue, value, emitValue, set, cancel }">
        <parameter-value-input
          v-if="insert"
          :param-name="paramName"
          :param-required="required"
          v-model="paramValueModel"
          :param-type="paramType"
          :default-value="defaultValue"
          :editable="editable"
        />
        <div class="row q-mt-sm justify-center">
          <q-btn
            no-caps flat dense color="light"
            label="Cancel"
            @click.stop="cancel"
          />
          <q-btn
            no-caps dense color="positive" class="q-ml-lg"
            label="Set"
            @click.stop="set"
          />
          <q-btn
            :disable="paramValueModel === defaultValue"
            label="Reset" no-caps dense color="warning" class="q-ml-lg"
            @click.stop="reset"
          />
        </div>
      </template>
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
      insert: true,
    }),

    mounted() {
      this.paramValueModel = this.paramValue
      this.insert = true
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
      reset() {
        if (this.$mxmVal.isGeojsonType(this.paramType)) {
          // trick to refresh the graphical edit: re-insert it:
          this.insert = false
          this.$nextTick(() => {
            this.paramValueModel = this.defaultValue
            this.insert = true
          })
        }
        else {
          this.paramValueModel = this.defaultValue
        }
      },

      errorMessage() {
        return this.$mxmVal && this.$mxmVal.checkValue(this.paramValue, this.paramType, this.required)
      },
    },
  }

</script>

