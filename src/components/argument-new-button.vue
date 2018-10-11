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
            <parameter-select
              :parameters="parameters"
              v-model="paramName"
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
    >
      <q-tooltip>Add explicit argument</q-tooltip>
    </q-btn>

  </div>
</template>

<script>
  import mutation from '../graphql/argumentsInsert.gql'
  import ParameterSelect from 'components/parameter-select'
  import {Notify} from 'quasar'

  const debug = true

  export default {
    components: {
      ParameterSelect,
    },

    props: {
      planId: {
        type: String,
        required: true
      },
      taskId: {
        type: String,
        required: true
      },
      executorId: {
        type: String,
        required: true
      },
      taskDefId: {
        type: String,
        required: true
      },
      parameters: {
        type: Array,
        required: true
      },
    },

    data() {
      return {
        dialogOpened: false,
        paramName: '',
        paramValue: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.paramName && this.paramValue
      }
    },

    methods: {
      openDialog() {
        this.paramName = ''
        this.paramValue = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          planId: this.planId,
          taskId: this.taskId,
          executorId: this.executorId,
          taskDefId: this.taskDefId,
          paramName: this.paramName,
          paramValue: this.paramValue
        }
        if (debug) console.debug('variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Argument created',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      }
    }
  }
</script>
