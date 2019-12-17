<template>
  <div>
    <div class="row items-center q-gutter-x-md">
      <div class="text-bold">
        Scheduling:
      </div>

      <q-radio
        label="ASAP"
        val="ASAP"
        dense
        :value="schedType"
        @input="val => { $emit('schedType', val) }"
      />

      <q-radio
        label="Queue"
        val="QUEUE"
        dense
        :value="schedType"
        @input="val => { $emit('schedType', val) }"
      />

      <div class="row">
        <q-radio
          label="At:"
          val="DATE"
          dense
          :value="schedType"
          @input="val => { $emit('schedType', val) }"
        />

        <q-input
          :disable="schedType !== 'DATE'"
          class="q-pl-sm q-pr-sm"
          style="width:13em"
          dense autofocus
          v-model="dateStr"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="20px">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="dateStr"
                  :mask="mask"
                  today-btn
                />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="access_time" class="cursor-pointer" size="20px">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time
                  v-model="dateStr"
                  :mask="mask"
                  format24h
                  now-btn
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
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
      schedType: {
        type: String,
        required: true
      },

      date: {
        type: Date,
        required: false
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

    mounted() {
      this.dateStr = this.date && date.formatDate(this.date, this.mask)
    },

    watch: {
      dateStr(val) {
        const schedDate = date.extractDate(val, this.mask)
        this.$emit('schedDate', schedDate)
      },
    },
 }
</script>
