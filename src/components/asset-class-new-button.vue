<template>
  <div>
    <q-dialog v-model="dialogOpened"
             no-backdrop-dismiss
    >
      <q-layout style="min-width:350px;min-height:300px">
        <q-header>
          <q-toolbar-title>
            Register new asset class (for '{{executorId}}')
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-header>

        <div class="q-pa-lg">
          <q-input
            label="Class name:"
            :error="!className.length"
            :label-width="4"
            class="bg-light-blue-1"
            v-model.trim="className"
            type="text"
            autofocus
            style="width:24em"
          />

          <q-input
            label="Description:"
            :label-width="4"
            class="bg-light-blue-1"
            v-model.trim="description"
            type="text"
            style="width:24em"
          />

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
      </q-layout>
    </q-dialog>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    >
      <q-tooltip>Register a new asset class</q-tooltip>
    </q-btn>

  </div>
</template>

<script>
  import assetClassInsert from '../graphql/assetClassInsert.gql'

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },
    },

    data() {
      return {
        dialogOpened: false,
        className: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.className
      }
    },

    methods: {
      openDialog() {
        this.className = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          className: this.className,
          description: this.description || null
        }

        const mutation = assetClassInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Asset class registered',
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
