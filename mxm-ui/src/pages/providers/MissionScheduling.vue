<script setup lang="ts">
import { computed, ref } from 'vue'
import { date } from 'quasar'

const debug = window.location.search.match(/.*debug=(-|.*\bmission\b).*/)

interface Props {
  schedInfo: object
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
})

const emit = defineEmits(['schedInfo'])

const DATE_MASK = 'YYYY-MM-DD HH:mm'

const givenDate = computed(() =>
  props.schedInfo.schedType === 'DATE' && props.schedInfo.schedDate
    ? new Date(props.schedInfo.schedDate)
    : null
)

const formattedGivenDate = computed(() =>
  givenDate.value ? getMaskedDate(givenDate.value) : null
)

// model for the popup-edit
const dateStr = ref(formattedGivenDate.value)

function getMaskedDate(schedDate?: string): string {
  return schedDate ? date.formatDate(new Date(schedDate), DATE_MASK) : ''
}

// to initialize date if not given
function nextRoundHour() {
  const d = new Date()
  const t = d.getTime()
  d.setTime(Math.floor((t + 300000) / 3600000 + 1) * 3600000)
  return d
}

function emitSchedInfo(patch) {
  const schedInfo = { ...props.schedInfo }
  if (patch.schedDate) {
    schedInfo.schedDate = patch.schedDate
  }
  if (patch.schedType) {
    schedInfo.schedType = patch.schedType
  }
  if (schedInfo.schedType === 'DATE') {
    if (!schedInfo.schedDate) {
      const theDate = new Date()
      schedInfo.schedDate = theDate.toISOString()
      dateStr.value = date.formatDate(theDate, DATE_MASK)
    }
  } else {
    schedInfo.schedDate = null
  }
  if (debug) console.debug('emitSchedInfo: schedInfo=', schedInfo)
  emit('schedInfo', schedInfo)
}

function emitSchedDate(val) {
  // console.debug('emitSchedDate: val=', val)
  const schedType = 'DATE'
  const schedDate = val
    ? new Date(date.extractDate(val, DATE_MASK)).toISOString()
    : null
  emitSchedInfo({ schedType, schedDate })
}

function dateSelected(schedType: string) {
  console.assert(schedType === 'DATE')
  let schedDate = null
  let initDate =
    !givenDate.value || givenDate.value.getTime() <= new Date().getTime()
  if (initDate) {
    const nextHour = nextRoundHour()
    schedDate = nextHour.toISOString()
  } else {
    schedDate = givenDate.value.toISOString()
  }
  emitSchedInfo({ schedType, schedDate })
}
</script>

<template>
  <div class="q-px-sm shadow-3 rounded-borders">
    <div class="row items-center q-gutter-x-lg">
      <div class="text-bold">Schedule:</div>

      <q-radio
        label="ASAP"
        val="ASAP"
        dense
        color="secondary"
        :disable="!editable"
        :modelValue="schedInfo.schedType"
        @update:modelValue="schedType => emitSchedInfo({ schedType })"
      />

      <q-radio
        label="Queue"
        val="QUEUE"
        dense
        color="secondary"
        :disable="!editable"
        :modelValue="schedInfo.schedType"
        @update:modelValue="schedType => emitSchedInfo({ schedType })"
      />

      <div class="row items-center">
        <q-radio
          label="At:"
          val="DATE"
          dense
          color="secondary"
          :disable="!editable"
          :modelValue="schedInfo.schedType"
          @update:modelValue="dateSelected"
        />
        <q-chip square class="q-ml-sm fieldBg">
          {{ formattedGivenDate }}
          <q-popup-edit
            v-if="editable && schedInfo.schedType === 'DATE'"
            v-model="dateStr"
            buttons
            anchor="bottom middle"
            self="top middle"
            v-slot="scope"
            @save="emitSchedDate"
          >
            <div class="column">
              <div class="row justify-center">
                <q-input
                  class="q-pl-lg q-pr-lg fieldBg"
                  style="width: 13em"
                  dense
                  autofocus
                  borderless
                  v-model="scope.value"
                  @keyup.enter="() => emitSchedDate(scope.value)"
                />
              </div>
            </div>
            <div class="row q-gutter-x-xs">
              <q-date v-model="scope.value" :mask="DATE_MASK" flat today-btn />
              <q-time
                v-model="scope.value"
                :mask="DATE_MASK"
                format24h
                flat
                now-btn
              />
            </div>
          </q-popup-edit>
        </q-chip>
        <div v-if="debug">{{ schedInfo }} dateStr={{ dateStr }}</div>
      </div>
    </div>
  </div>
</template>
