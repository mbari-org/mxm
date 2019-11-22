<template>
  <div>
    {{ _showValue }}

    <q-popup-edit
      v-if="editable || $mxmVal.isGeojsonType(paramType)"
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
          :editable="editable"
        />
        <div v-if="editable" class="q-mt-sm">
          <q-separator/>
          <div class="row q-mt-xs justify-center q-gutter-x-lg">
            <q-btn
              :disable="paramValueModel === defaultValue"
              no-caps dense color="positive"
              label="Set"
              @click.stop="set"
            />
            <q-btn
              :disable="paramValueModel === defaultValue"
              label="Reset" no-caps dense color="warning"
              @click.stop="reset"
            />
            <q-btn
              no-caps dense color="light" text-color="black"
              label="Cancel"
              @click.stop="cancel"
            />
          </div>
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
      paramValueModel: null,
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

