<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:60vw;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new task definition
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Task Definition ID:"
            :error="!taskDefId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="taskDefId"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Asset Classes:"
            :error="!assetClassesString.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="assetClassesString"
              type="text"
              placeholder="Comma-separated list of class names"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Description:"
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
    executorId: {
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
      taskDefId: '',
      assetClassesString: '',
      description: ''
    }
  },

  computed: {
    okToSubmit () {
      return this.taskDefId
    }
  },

  methods: {
    openDialog () {
      this.taskDefId = ''
      this.assetClassesString = ''
      this.description = ''
      this.dialogOpened = true
    },

    submit () {
      const data = {
        taskDefId: this.taskDefId
      }
      if (this.assetClassesString) {
        data.assetClasses = this.assetClassesString.split(/\s*,\s*/)
      }
      if (this.description) {
        data.description = this.description
      }

      const url = `/executors/${this.executorId}/taskdefs`
      this.$axios({
        method: 'POST',
        url,
        data
      })
        .then(response => {
          console.log(`POST ${url}: response=`, response)
          this.dialogOpened = false
          Notify.create({
            message: 'task definition registered',
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
