<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:600px;min-height:400px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new mission (for '{{executorId}}')
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">

          <q-field
            label="Mission Definition:"
            :error="!missionDefId.length"
            :label-width="4"
          >
            <mission-def-select
              :mission-defs="missionDefs"
              v-model="missionDefId"
            />
          </q-field>

          <q-field
            label="Asset:"
            :error="!assetId.length"
            :label-width="4"
          >
            <asset-select
              :asset-classes="assetClasses"
              v-model="assetId"
            />
          </q-field>

          <q-field
            label="Mission ID:"
            :error="!missionId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="missionId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Mission Name:"
            :error="!name.length"
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
            label="Mission Description:"
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
  import executor from '../graphql/executor.gql'
  import mutation from '../graphql/missionInsert.gql'
  import ExecutorSelect from 'components/executor-select'
  import MissionDefSelect from 'components/mission-def-select'
  import AssetSelect from 'components/asset-select'
  import _ from 'lodash'
  import {Notify} from 'quasar'

  const debug = false

  export default {
    components: {
      ExecutorSelect,
      MissionDefSelect,
      AssetSelect,
    },

    props: {
      executorId: {
        type: String,
        required: true,
      }
    },

    data() {
      return {
        dialogOpened: false,
        executor: null,
        missionDefId: '',
        assetId: '',
        missionId: '',
        name: '',
        description: '',
        arguments: [],
        startDate: null,
        endDate: null
      }
    },

    computed: {
      missionDefs() {
        return this.executor && this.executor.missionDefsByExecutorIdList || []
      },

      assetClasses() {
        const list = []
        const missionDef = _.find(this.missionDefs, {missionDefId: this.missionDefId})
        if (debug) console.debug('missionDef=', missionDef)
        if (missionDef && missionDef.missionDefAssetClassesByExecutorIdAndMissionDefIdList) {
          _.each(missionDef.missionDefAssetClassesByExecutorIdAndMissionDefIdList, c => {
            list.push(c)
          })
        }
        return list
      },

      okToSubmit() {
        return this.missionDefId
          && this.assetId
          && this.missionId
          && this.name
      }
    },

    apollo: {
      executor: {
        query: executor,
        variables() {
          return {
            executorId: this.executorId,
          }
        },
        update(data) {
          if (debug) console.log('mission-new-button update: data=', data)
          if (data.allExecutorsList && data.allExecutorsList.length) {
            return data.allExecutorsList[0]
          }
          else return null
        },
      },
    },

    methods: {
      openDialog() {
        this.executor = null
        this.missionDefId = ''
        this.assetId = ''
        this.missionId = ''
        this.name = ''
        this.description = ''
        this.arguments = []
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
        this.$apollo.queries.executor.refetch()
      },

      submit() {
        const variables = {
          missionId: this.missionId,
          executorId: this.executorId,
          missionDefId: this.missionDefId,
          assetId: this.assetId,
          name: this.name,
          description: this.description
        }
        if (this.startDate) {
          variables.start = this.startDate.toISOString()
        }
        if (this.endDate) {
          variables.end = this.endDate.toISOString()
        }
        // TODO geometry
        if (this.geometry) {
          variables.geometry = this.geometry
        }
        if (debug) console.debug('variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Mission created',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      }
    },

    watch: {
      executorId(val) {
        if (debug) console.debug('watch executorId=', val)
        this.$apollo.queries.executor.refetch()
      },

      assetClasses(val) {
        if (debug) console.debug('watch assetClasses=', val)
      },
    }
  }
</script>
