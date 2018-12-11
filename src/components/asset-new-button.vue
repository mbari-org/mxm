<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:500px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new asset of class '{{assetClassName}}' (for '{{executorId}}')
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Asset ID:"
            :error="!assetId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="assetId"
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
      <q-tooltip>
        Register new asset of class '{{assetClassName}}' (for '{{executorId}}')
      </q-tooltip>
    </q-btn>

  </div>
</template>

<script>
  import assetInsert from '../graphql/assetInsert.gql'
  import AssetClassNewButton from 'components/asset-class-new-button'

  export default {
    components: {
      AssetClassNewButton,
    },

    props: {
      executorId: {
        type: String,
        required: true
      },
      assetClassName: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        dialogOpened: false,
        assetId: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.assetId
      }
    },

    methods: {
      openDialog() {
        this.assetId = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId:  this.executorId,
          className: this.assetClassName,
          assetId: this.assetId,
          description: this.description || null
        }

        const mutation = assetInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Asset registered',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },
    }
  }
</script>
