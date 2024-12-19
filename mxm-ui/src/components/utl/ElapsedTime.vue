<script setup lang="ts">
import { computed, inject } from 'vue'
const utl = inject('utl')

interface Props {
  date?: string | Date
  baseDate?: Date
  prefix?: string
  suffix?: string
  tooltip?: string
  noDateText?: string
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  suffix: ' ago',
  tooltip: '',
  noDateText: '??',
})

const theDate = computed(() =>
  props.date === undefined
    ? null
    : typeof props.date === 'string'
    ? new Date(props.date)
    : props.date
)

const elapsedString = computed(() =>
  theDate.value
    ? utl.getAgo(theDate.value, props.baseDate || utl.ticker.value)
    : props.noDateText
)
</script>

<template>
  <div>
    <div>
      {{ prefix + elapsedString + suffix }}
      <q-tooltip v-if="tooltip !== null" class="text-no-wrap">
        {{ theDate }}
        <div v-if="tooltip">
          <q-separator />
          {{ tooltip }}
        </div>
      </q-tooltip>
    </div>
    <slot></slot>
  </div>
</template>
