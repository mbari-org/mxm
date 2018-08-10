<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:60vw;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new executor
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Executor name:"
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

          <q-field
            label="HTTP Endpoint:"
            :error="!httpEndpoint.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="httpEndpoint"
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
  data () {
    return {
      dialogOpened: false,
      executorId: '',
      httpEndpoint: '',
      description: ''
    }
  },

  computed: {
    okToSubmit () {
      return this.executorId
    }
  },

  methods: {
    openDialog () {
      this.executorId = ''
      this.httpEndpoint = ''
      this.description = ''
      this.dialogOpened = true
    },

    submit () {
      const data = {
        executorId: this.executorId,
        httpEndpoint: this.httpEndpoint
      }
      if (this.description) {
        data.description = this.description
      }

      const url = '/executors'
      this.$axios({
        method: 'POST',
        url,
        data
      })
        .then(response => {
          console.log(`POST ${url}: response=`, response)
          this.dialogOpened = false
          Notify.create({
            message: 'Executor created',
            timeout: 1000,
            type: 'info'
          })
          this.$emit('created', response.data)
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
