<script setup lang="ts">
import { PROVIDER_API_TYPES } from './queries'
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'

interface Props {
  selectedApiType?: string
}

defineProps<Props>()

const { result } = useQuery(PROVIDER_API_TYPES)

const enumValues = computed(() => result.value?.__type?.enumValues ?? [])

const options = computed(() =>
  enumValues.value.map(o => ({
    label: o.name,
    value: o.name,
  }))
)

const emit = defineEmits<{
  (e: 'selectedApiType', v: any): void
}>()
</script>

<template>
  <q-btn-toggle
    dense
    class="fieldBg"
    style="width: 16em"
    spread
    :options="options"
    placeholder="Select"
    :modelValue="selectedApiType"
    @update:modelValue="
      val => {
        emit('selectedApiType', val)
      }
    "
  />
</template>
