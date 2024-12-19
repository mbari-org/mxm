<script setup lang="ts">
import BooleanInput from './BooleanInput.vue'
import GeoJsonInput from './GeoJsonInput.vue'
import SimpleInput from './SimpleInput.vue'
import { inject } from 'vue'

interface Props {
  label?: string
  paramName: string
  paramType?: string
  paramValue?: string
  paramRequired?: boolean
  editable?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  paramValue: '',
  paramRequired: false,
  editable: false,
})

const mxmVal = inject('mxmVal')
</script>

<template>
  <div>
    <GeoJsonInput
      v-if="mxmVal.isGeojsonType(paramType)"
      :label="label"
      :paramName="paramName"
      :paramValue="paramValue"
      :paramType="paramType"
      :paramRequired="paramRequired"
      :editable="editable"
      v-bind="$attrs"
    />

    <BooleanInput
      v-else-if="paramType === 'boolean'"
      :label="label"
      :paramValue="paramValue"
      :paramRequired="paramRequired"
      :editable="editable"
      v-bind="$attrs"
    />

    <SimpleInput
      v-else
      :label="label"
      :paramType="paramType"
      :paramValue="paramValue"
      :paramRequired="paramRequired"
      :editable="editable"
      v-bind="$attrs"
    />
  </div>
</template>
