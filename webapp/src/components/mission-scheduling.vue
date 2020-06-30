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
        :disable="!editable"
        :value="schedInfo.schedType"
        @input="schedType => emit({schedType})"
      />

      <q-radio
        label="Queue"
        val="QUEUE"
        dense
        :disable="!editable"
        :value="schedInfo.schedType"
        @input="schedType => emit({schedType})"
      />

      <div class="row">
        <q-radio
          label="At:"
          val="DATE"
          dense
          :disable="!editable"
          :value="schedInfo.schedType"
          @input="schedType => emit({schedType})"
        />
        <q-chip
          square
          class="q-ml-sm bg-blue-1"
        >
          {{ masked }}
        </q-chip>
        <q-popup-edit
          v-if="editable && schedInfo.schedType === 'DATE'"
          v-model="dateStr"
          buttons
          anchor="bottom middle" self="top middle"
          @before-show="dateStr = getDateStr()"
          @save="emitSchedDate"
        >
          <div class="column">
            <div class="row justify-center">
              <q-input
                class="q-pl-lg q-pr-lg bg-blue-1"
                style="width:13em"
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

      editable: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      mask() {
        return 'YYYY-MM-DD HH:mm'
      },

      masked() {
        return this.getDateStr()
      },
    },

    data: () => ({
      dateStr: '',
    }),

    methods: {
      getDateStr() {
        let dateStr = ''
        const {schedType, schedDate} = this.schedInfo
        if (schedType === 'DATE') {
          const theDate = schedDate ? new Date(schedDate) : new Date()
          dateStr = date.formatDate(theDate, this.mask)
        }
        return dateStr
      },

      emitSchedDate(val) {
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
            schedInfo.schedDate = new Date().toISOString()
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
