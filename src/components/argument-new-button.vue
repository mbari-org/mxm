<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="width:400;min-height:250px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Add argument
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Parameter Name:"
            :error="!paramName.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="paramName"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Parameter Value:"
            :error="!paramValue.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="paramValue"
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
    taskId: {
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
      paramName: '',
      paramValue: ''
    }
  },

  computed: {
    okToSubmit () {
      return this.paramName && this.paramValue
    }
  },

  methods: {
    openDialog () {
      this.paramName = ''
      this.paramValue = ''
      this.dialogOpened = true
    },

    submit () {
      const data = {
        paramName: this.paramName,
        paramValue: this.paramValue
      }

      const url = `/plans/${encodeURIComponent(this.planId)}/tasks/${encodeURIComponent(this.taskId)}/arguments`
      this.$axios({
        method: 'POST',
        url,
        data
      })
        .then(response => {
          console.log(`POST ${url}: response=`, response)
          this.dialogOpened = false
          Notify.create({
            message: 'Argument created',
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
