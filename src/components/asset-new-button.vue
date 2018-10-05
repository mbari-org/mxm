<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:60vw;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new asset
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
            label="Asset Class:"
            :error="!assetClass.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="assetClass"
              type="text"
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
import insert_asset from '../graphql/assets_insert.gql'
import { Notify } from 'quasar'

export default {
  props: {
    executorId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      dialogOpened: false,
      assetId: '',
      assetClass: '',
      description: ''
    }
  },

  computed: {
    okToSubmit () {
      return this.assetId && this.assetClass
    }
  },

  methods: {
    openDialog () {
      this.assetId = ''
      this.assetClass = ''
      this.description = ''
      this.dialogOpened = true
    },

    submit () {
      const mutation = insert_asset
      const variables = {
        assetId: this.assetId,
        assetClass: this.assetClass,
        description: this.description
      }

      this.$apollo.mutate({mutation, variables})
        .then((data) => {
          console.log('mutation data=', data)
          this.dialogOpened = false
          Notify.create({
            message: 'Asset registered',
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
