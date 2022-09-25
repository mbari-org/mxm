<script setup lang="ts">
interface Props {
  label?: string
  paramValue?: string
  paramRequired?: boolean
  editable?: boolean
}

withDefaults(defineProps<Props>(), {
  paramValue: '',
  paramRequired: false,
  editable: false,
})

const emit = defineEmits(['valueInput'])

function valueInput(val: string) {
  emit('valueInput', val)
}
</script>

<template>
  <div class="column">
    <div v-if="label">{{ label }}</div>
    <div class="row items-center q-gutter-x-md rounded-borders fieldBg">
      <q-radio
        :disable="!editable"
        label="true"
        dense
        size="xs"
        :model-value="paramValue"
        val="true"
        @update:model-value="valueInput"
      />
      <q-radio
        :disable="!editable"
        label="false"
        dense
        size="xs"
        :model-value="paramValue"
        val="false"
        @update:model-value="valueInput"
      />
      <q-radio
        v-if="!paramRequired"
        :disable="!editable"
        label="Unspecified"
        dense
        size="xs"
        :model-value="paramValue"
        val=""
        @update:model-value="valueInput"
      />
    </div>
  </div>
</template>
