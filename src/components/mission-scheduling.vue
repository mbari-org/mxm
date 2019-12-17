<template>
  <div>
    <div class="row items-center q-gutter-x-lg">
      <div class="text-bold">
        Scheduling:
      </div>

      <q-radio
        label="ASAP"
        val="ASAP"
        dense
        :value="schedInfo.schedType"
        @input="schedType => emit({schedType})"
      />

      <q-radio
        label="Queue"
        val="QUEUE"
        dense
        :value="schedInfo.schedType"
        @input="schedType => emit({schedType})"
      />

      <div class="row">
        <q-radio
          label="At:"
          val="DATE"
          dense
          :value="schedInfo.schedType"
          @input="schedType => emit({schedType})"
        />
        <q-chip
          square
          class="q-ml-sm bg-blue-1"
          style="min-width:12em"
        >
          {{ schedInfo.schedDate }}
        </q-chip>
        <q-popup-edit
          v-model="dateStr"
          title="Mission Template ID"
          buttons
          @before-show="setDateStr"
          @save="setSchedDate"
        >
          <div class="column">
            <div class="row justify-cetner">
              <q-input
                :disable="schedInfo.schedType !== 'DATE'"
                class="q-pl-lg q-pr-lg bg-blue-1"
                :style="schedInfo.schedType === 'DATE' ? 'width:13em' : 'width:3em'"
                dense autofocus borderless
                v-model="dateStr"
              />
            </div>
          </div>
          <div class="row q-gutter-x-xs">
            <q-date
              v-model="dateStr"
              :mask="mask"
              flat
              today-btn
            />
            <q-time
              v-model="dateStr"
              :mask="mask"
              format24h
              flat
              now-btn
            />
          </div>
        </q-popup-edit>

      </div>
    </div>
  </div>
</template>

<script>
  import { date } from 'quasar'

  const debug = false

  export default {
    name: 'mission-scheduling',

    props: {
      schedInfo: {
        type: Object,
        required: true
      },
    },

    computed: {
      mask() {
        return 'YYYY-MM-DD HH:mm'
      },
    },

    data: () => ({
      dateStr: '',
    }),

    methods: {
      setDateStr() {
        this.dateStr = ''
        const {schedType, schedDate} = this.schedInfo
        if (schedType === 'DATE') {
          const theDate = schedDate ? new Date(schedDate) : new Date()
          this.dateStr = date.formatDate(theDate, this.mask)
        }
      },

      setSchedDate(val) {
        const schedDate = val ? new Date(date.extractDate(val, this.mask)).toISOString() : null
        this.emit({schedDate})
      },

      emit(patch) {
        const schedInfo = {... this.schedInfo}
        if (patch.schedDate) {
          schedInfo.schedDate = patch.schedDate
        }
        if (patch.schedType) {
          schedInfo.schedType = patch.schedType
        }
        if (schedInfo.schedType === 'DATE') {
          if (!schedInfo.schedDate) {
            schedInfo.schedDate = date.formatDate(new Date(), this.mask)
          }
        }
        else {
          schedInfo.schedDate = null
        }
        this.$emit('schedInfo', schedInfo)
      },
    },
 }
</script>
