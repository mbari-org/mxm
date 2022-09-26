<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  label?: string
  paramValue?: string
  paramType?: string
  paramRequired?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  paramValue: '',
  paramRequired: false,
  editable: false,
})

const paramValueModel = ref(props.paramValue)

const emit = defineEmits<{
  (e: 'valueInput', v: string): void
  (e: 'valueError', v: string): void
}>()

function validate(str: string): true | string {
  if (props.paramRequired && !str?.trim()) {
    return 'Missing value'
  }

  // check possible 'NaN' value for numeric type, which we accept for now:
  // (TODO capture possibility of accepting NaN in the type system)
  switch (props.paramType) {
    case 'number':
    case 'float':
    case 'integer':
    case 'int':
      if (str.toLowerCase() === 'nan') {
        return true
      }
  }

  try {
    switch (props.paramType) {
      case 'number':
      case 'float': {
        const n = Number(str)
        if (isNaN(n)) {
          return 'Not a number'
        }
        return true
      }
      case 'integer':
      case 'int': {
        const n = Number(str)
        if (isNaN(n) || !Number.isInteger(n)) {
          return 'Not an integer'
        }
        return true
      }

      case 'string': {
        return true
      }

      default: {
        const err = `unexpected type: ${props.paramType}`
        console.warn(err)
        return err
      }
    }
  } catch (e) {
    return e.message
  }
}

const errorMsg = computed((): string | null => {
  const validation = validate(paramValueModel.value)
  return typeof validation === 'string' ? validation : null
})

function valueInput(val: string) {
  const validation = validate(val)
  if (typeof validation === 'string') {
    emit('valueError', validation)
    return
  }
  emit('valueInput', val)
}

const inputProps = computed(() => {
  let style = ''
  let rows = 1

  switch (props.paramType) {
    case 'float':
    case 'int':
    case 'integer':
    case 'number':
    case 'boolean':
      break

    case 'string':
      style += ';width:30em'
      break

    default:
      style += ';width:40em'
      rows = 5
  }

  return { rows, style }
})
</script>

<template>
  <div class="column">
    <div v-if="label">{{ label }}</div>
    <q-input
      :type="inputProps.rows > 1 ? 'textarea' : 'text'"
      :rows="inputProps.rows"
      :readonly="!editable"
      autofocus
      dense
      v-model="paramValueModel"
      @update:model-value="valueInput"
      :error="!!errorMsg"
      :error-message="errorMsg"
      :style="inputProps.style"
      no-error-icon
      class="inputClass q-px-xs rounded-borders fieldBg"
    />
  </div>
</template>

<style scoped>
.inputClass {
  font-family: monospace;
}
</style>
