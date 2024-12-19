<script setup lang="ts">
import { computed, ref } from 'vue'

const debug = window.location.search.match(/.*debug=.*\bmissiontpls\b.*/)

interface Props {
  loading: boolean
  missionTpls: object[]
  selectedMissionTemplate?: object
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'selectedMissionTemplate', v: any): void
}>()

const theOptions = ref([])

const missionTplId = computed(
  () => props.selectedMissionTemplate?.missionTplId ?? ''
)

const options = computed(() => {
  if (debug) console.debug('missionTpls=', props.missionTpls)
  return props.missionTpls.map(e => ({
    label: e.missionTplId,
    value: e,
  }))
})

function filterFn(val, update) {
  update(() => {
    if (val) {
      const lc = val.toLowerCase()
      theOptions.value = options.value.filter(
        o => o.label.toLowerCase().indexOf(lc) > -1
      )
    } else {
      theOptions.value = options.value
    }
  })
}
</script>

<template>
  <q-select
    :loading="loading"
    filled
    dense
    class="fieldBg col-auto"
    :model-value="missionTplId"
    :options="theOptions"
    use-input
    input-debounce="0"
    @filter="filterFn"
    @update:modelValue="val => val && emit('selectedMissionTemplate', val)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
