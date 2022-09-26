<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  assetClasses: object[]
  selectedAsset?: object
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'selectedAsset', v: any): void
}>()

const theOptions = ref([])

const options = computed(() => {
  const list = []
  props.assetClasses.forEach(e => {
    const instances = e.assets || []
    console.debug(':: instances=', instances)
    instances.forEach(i => {
      list.push({
        label: `${i.assetId} (${e.className})`,
        value: i,
      })
    })
  })
  return list
})

const assetId = computed(() => {
  if (props.selectedAsset) {
    return options.value.find(
      o => o.value.assetId === props.selectedAsset.assetId
    )
  } else {
    return ''
  }
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
    filled
    dense
    class="fieldBg col-auto"
    :model-value="assetId"
    :options="theOptions"
    use-input
    input-debounce="0"
    @filter="filterFn"
    @update:modelValue="val => val && emit('selectedAsset', val)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
