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
          <p style="color:gray;font-size:small">
            The mission will initially be registered with 'DRAFT' status.
            <br/>
            You can then edit any arguments and submit it for execution.
          </p>

          <q-field
            label="Mission Template:"
            :error="!missionTplId.length"
            :label-width="4"
          >
            <mission-tpl-select
              :mission-tpls="missionTpls"
              v-model="missionTplId"
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
                 @click="registerMission"
                 label="Register"
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
  import missionInsert from '../graphql/missionInsert.gql'
  import MissionTplSelect from 'components/mission-tpl-select'
  import AssetSelect from 'components/asset-select'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      MissionTplSelect,
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
        missionTplId: '',
        assetId: '',
        missionId: '',
        description: '',
        arguments: [],
        startDate: null,
        endDate: null
      }
    },

    computed: {
      missionTpls() {
        return this.executor && this.executor.missionTplsByExecutorIdList || []
      },

      assetClasses() {
        const list = []
        const missionTpl = _.find(this.missionTpls, {missionTplId: this.missionTplId})
        if (debug) console.debug('missionTpl=', missionTpl)
        if (missionTpl && missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList) {
          _.each(missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList, c => {
            list.push(c)
          })
        }
        return list
      },

      okToSubmit() {
        return this.missionTplId
          && this.assetId
          && this.missionId
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
        this.missionTplId = ''
        this.assetId = ''
        this.missionId = ''
        this.description = ''
        this.arguments = []
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
        this.$apollo.queries.executor.refetch()
      },

      registerMission() {
        const mission = {
          executorId: this.executorId,
          missionTplId: this.missionTplId,
          missionId: this.missionId,
          missionStatus: 'DRAFT',
          assetId: this.assetId,
          description: this.description
        }
        if (this.startDate) {
          mission.startDate = this.startDate.toISOString()
        }
        if (this.endDate) {
          mission.endDate = this.endDate.toISOString()
        }
        // TODO geometry
        if (this.geometry) {
          mission.geometry = this.geometry
        }

        const variables = {input: {mission}}
        if (debug) console.debug('variables=', variables)

        const mutation = missionInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Mission created',
              timeout: 1000,
              type: 'info'
            })
            this.$router.push(`/executors/${encodeURIComponent(this.executorId)}/missiontpls/${encodeURIComponent(this.missionTplId)}/missions/${encodeURIComponent(this.missionId)}`)
            // this.$emit('created', variables)
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
