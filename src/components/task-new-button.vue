<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:60vw;min-height:500px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new task
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Executor ID:"
            :error="!executorId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="executorId"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Definition ID:"
            :error="!taskDefId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="taskDefId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Asset ID:"
            :error="!assetId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="assetId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Name:"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="name"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Description:"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="description"
              type="text"
              style="width:24em"
            />
          </q-field>

        </div>

        <q-toolbar slot="footer" color="flat">
          <q-toolbar-title/>
          <q-btn dense
                 :color="okToSubmit ? 'primary' : 'light'"
                 @click="submit"
                 label="Submit"
                 :disable="!okToSubmit"
          />
        </q-toolbar>
      </q-modal-layout>
    </q-modal>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

  </div>
</template>

<script>
import { Notify } from 'quasar'

export default {
  props: {
    planId: {
      type: String,
      required: true
    },
    created: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      dialogOpened: false,
      executorId: '',
      taskDefId: '',
      assetId: '',
      name: '',
      description: '',
      arguments: [],
      startDate: null,
      endDate: null
    }
  },

  computed: {
    okToSubmit () {
      return this.taskDefId && this.assetId
    }
  },

  methods: {
    openDialog () {
      this.taskDefId = ''
      this.assetId = ''
      this.name = ''
      this.description = ''
      this.arguments = []
      this.startDate = new Date()
      this.endDate = new Date()
      this.dialogOpened = true
    },

    submit () {
      const data = {
        executorId: this.executorId,
        taskDefId: this.taskDefId,
        assetId: this.assetId
      }
      if (this.name) {
        data.name = this.name
      }
      if (this.description) {
        data.description = this.description
      }
      // TODO arguments
      // if (this.arguments) {
      //   data.arguments = ...
      // }
      if (this.startDate) {
        data.start = this.startDate.toISOString()
      }
      if (this.endDate) {
        data.end = this.endDate.toISOString()
      }
      // TODO geometry
      // if (this.geometry) {
      //   data.geometry = ...
      // }

      const url = `/plans/${this.planId}/tasks`
      this.$axios({
        method: 'POST',
        url,
        data
      })
        .then(response => {
          console.log(`POST ${url}: response=`, response)
          this.dialogOpened = false
          Notify.create({
            message: 'Plan task registered',
            timeout: 1000,
            type: 'info'
          })
          this.created(response.data)
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
