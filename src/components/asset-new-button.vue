<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:500px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new asset
            {{ assetClassName ? ` of class '${assetClassName}'` : '' }}
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
            v-if="!assetClassName"
            label="Asset Class:"
            :error="!className.length"
            :label-width="4"
          >
            <!-- also using v-if trick here. TODO use some lazy-based machanism.. -->
            <asset-class-field
              v-if="dialogOpened"
              v-model="className"
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
        Register a new asset
        {{ assetClassName ? ` of class '${assetClassName}'` : '' }}
      </q-tooltip>
    </q-btn>

  </div>
</template>

<script>
import mutation from '../graphql/assetsInsert.gql'
import AssetClassField from 'components/asset-class-field'
import AssetClassNewButton from 'components/asset-class-new-button'

import { Notify } from 'quasar'

export default {
  components: {
    AssetClassField,
    AssetClassNewButton,
  },

  props: {
    assetClassName: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      dialogOpened: false,
      assetId: '',
      className: '',
      description: ''
    }
  },

  computed: {
    okToSubmit () {
      return this.assetId && this.className
    }
  },

  methods: {
    openDialog () {
      this.assetId = ''
      this.className = this.assetClassName || ''
      this.description = ''
      this.dialogOpened = true
    },

    submit () {
      const variables = {
        assetId: this.assetId,
        className: this.className,
        description: this.description || null
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
    },
  }
}
</script>
