<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import ParameterValueInput from './ParameterValueInput.vue'

const debug = window.location.search.match(/.*debug=.*paramval.*/)

const mxmVal = inject('mxmVal')

interface Props {
  label?: string
  paramName: string
  paramType?: string
  valueCanReference?: string
  paramValue?: string
  defaultValue?: string
  paramRequired?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  valueCanReference: '',
  paramValue: '',
  paramRequired: false,
  editable: false,
})

const emit = defineEmits<{
  (e: 'valueInput', v: string): void
  (e: 'valueError', v: string): void
}>()

const paramValueModel = ref(props.paramValue)
const paramValueError = ref(null as string | null)

watch(
  () => props.paramValue,
  value => {
    paramValueModel.value = value
  }
)

function valueInput(val: string) {
  paramValueModel.value = val
  paramValueError.value = null
}

// TODO error handling

function valueError(error: string | null) {
  paramValueError.value = error
  if (error) {
    emit('valueError', error)
  }
}

const menuOpen = ref(false)

function setValue() {
  if (debug) console.debug('setValue', paramValueModel.value)
  emit('valueInput', paramValueModel.value)
  menuOpen.value = false
}

function resetValue() {
  paramValueModel.value = props.defaultValue
  emit('valueInput', paramValueModel.value)
  menuOpen.value = false
}

function cancel() {
  if (debug) console.debug('cancel: paramValueModel=', paramValueModel.value)
  // paramValueModel.value = props.defaultValue
  menuOpen.value = false
}
</script>

<template>
  <div>
    <div
      :class="
        'q-pa-xs rounded-borders ' +
        (defaultValue && defaultValue !== paramValueModel
          ? `text-white text-bold ${
              !paramValue && paramRequired ? 'bg-red' : 'bg-green-8'
            }`
          : 'fieldBg')
      "
    >
      <div
        :class="{ 'bg-amber-1 text-accent': menuOpen }"
        style="min-height: 1.3em"
      >
        {{ paramValue || (paramRequired ? '(?)' : '') }}
      </div>
    </div>
    <!--
     note: menu persistent and with @keyup.esc.stop to directly handle Esc,
     while avoiding any action in some nested dialog from closing this menu.
     -->
    <q-menu
      v-if="paramType && (editable || mxmVal.isGeojsonType(paramType))"
      v-model="menuOpen"
      @before-show="paramValueModel = paramValue"
      @keyup.enter.stop="setValue"
      @keyup.stop="() => {}"
      @cancel="cancel"
      persistent
      separate-close-popup
      @keyup.esc.stop="cancel"
    >
      <div class="q-ma-md">
        <ParameterValueInput
          :label="label"
          :paramName="paramName"
          :paramRequired="paramRequired"
          :paramValue="paramValueModel"
          :paramType="paramType"
          :editable="editable"
          @valueInput="valueInput"
          @valueError="valueError"
        />

        <div v-if="editable" class="q-mt-sm">
          <q-separator />
          <div class="row q-mt-xs justify-center q-gutter-x-lg">
            <q-btn
              :disable="!!paramValueError || paramValue === paramValueModel"
              label="Set"
              no-caps
              dense
              color="positive"
              @click.stop="setValue"
            />
            <q-btn
              :disable="!defaultValue || defaultValue === paramValueModel"
              label="Reset"
              no-caps
              dense
              color="warning"
              @click.stop="resetValue"
            >
              <q-tooltip>Reset to original value</q-tooltip>
            </q-btn>
            <q-btn no-caps dense label="Cancel" dark @click.stop="cancel" />
          </div>
        </div>
      </div>
    </q-menu>
  </div>
</template>
