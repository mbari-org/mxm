<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  units: object[]
  unitsByName: object
  value?: string
  resetValue?: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  resetValue: undefined,
  editable: false,
})

const emit = defineEmits<{
  (e: 'input', v?: string): void
}>()

const unitInfo = computed(() =>
  props.value ? props.unitsByName[props.value] : undefined
)

const displayUnits = computed(
  () => unitInfo.value?.abbreviation || props.value || 'unspecified'
)

const unitOptions = computed(() => {
  let options = props.units
  const baseUnit = unitInfo.value?.baseUnit //|| unitInfo.value?.unitName
  if (baseUnit) {
    options = options.filter(
      u =>
        u.baseUnit === baseUnit ||
        u.unitName === baseUnit ||
        u.unitName === props.value
    )
  }
  if (filter.value) {
    const lc = filter.value.toLowerCase()
    options = options.filter(
      u =>
        u.unitName.toLowerCase().indexOf(lc) >= 0 ||
        (u.abbreviation && u.abbreviation.toLowerCase().indexOf(lc) >= 0)
    )
  }
  if (baseUnit === 'second') {
    // a little "exception" to show the long abbreviations at the end:
    options = options.sort((u, w) => {
      const ul = u.abbreviation?.length ?? 0
      const wl = w.abbreviation?.length ?? 0
      return ul - wl
    })
  }
  return options
})

const filter = ref('')
</script>

<template>
  <div v-if="editable">
    <q-btn v-if="value === 'count'" dense no-caps flat :label="value" />

    <q-btn-dropdown
      v-else
      dense
      no-caps
      flat
      :class="
        'q-px-xs rounded-borders ' +
        (resetValue !== value ? 'bg-green-8 text-white text-bold' : 'fieldBg')
      "
    >
      <template v-slot:label>
        <div style="min-width: 2em" class="text-left">
          {{ displayUnits }}
        </div>
      </template>

      <div class="q-mt-xs column">
        <q-btn
          v-if="resetValue !== value"
          no-caps
          dense
          flat
          v-close-popup
          @click="emit('input', resetValue)"
        >
          <div class="row q-gutter-x-xs">
            <div>Reset to:</div>
            <div v-if="resetValue" class="text-bold">{{ resetValue }}</div>
            <i v-else>unspecified</i>
          </div>
        </q-btn>

        <q-separator />

        <q-input
          v-if="units.length > 1"
          class="q-ml-sm"
          color="secondary"
          v-model="filter"
          placeholder="Filter"
          autofocus
          clearable
        />

        <q-list dense>
          <q-item
            v-for="(u, index) in unitOptions"
            :key="index"
            clickable
            v-close-popup
            @click="emit('input', u.unitName)"
          >
            <q-item-section>
              <q-item-label>
                {{ u.abbreviation }}
                <i class="text-grey">- {{ u.unitName }}</i>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-btn-dropdown>
  </div>

  <div v-else>
    {{ displayUnits }}
    <q-tooltip>{{ value }}</q-tooltip>
  </div>
</template>
