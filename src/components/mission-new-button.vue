<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

    <utl-dialog
      :dialog-opened="dialogOpened"
      :title="`Register new mission (for '${executorId}')`"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <p style="color:gray;font-size:small;width:24em">
        The mission will be registered with 'DRAFT' status.
        You can then edit any arguments and submit it for execution.
      </p>

      <div
        class="column q-gutter-sm"
      >
        <div :class="{'text-red': !missionTplId.length}">
          Mission Template:
          <mission-tpl-select
            :mission-tpls="missionTpls"
            v-model="missionTplId"
          />
        </div>

        <div :class="{'text-red': !assetId.length}">
          Asset:
          <asset-select
            :asset-classes="assetClasses"
            v-model="assetId"
          />
        </div>

        <div :class="{'text-red': !missionId.length}">
          Mission ID:
          <q-input
            dense hide-bottom-space
            class="bg-light-blue-1"
            v-model.trim="missionId"
            type="text"
            style="width:24em"
          />
        </div>

        <div>
          Mission Description:
          <mxm-markdown
            expandable
            class="bg-light-blue-1"
            style="min-height:6em;min-width:24em"
            :text="description"
            editable edit-click
            @saveDescription="d => { description = d }"
          />
        </div>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import executor from '../graphql/executor.gql'
  import missionInsert from '../graphql/missionInsert.gql'
  import MissionTplSelect from 'components/mission-tpl-select'
  import AssetSelect from 'components/asset-select'
  import find from 'lodash/find'
  import each from 'lodash/each'

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

    data: () => ({
      dialogOpened: false,
      executor: null,
      missionTplId: '',
      assetId: '',
      missionId: '',
      description: null,
      arguments: [],
      startDate: null,
      endDate: null
    }),

    computed: {
      missionTpls() {
        return this.executor && this.executor.missionTplsByExecutorIdList || []
      },

      assetClasses() {
        const list = []
        const missionTpl = find(this.missionTpls, {missionTplId: this.missionTplId})
        if (debug) console.debug('missionTpl=', missionTpl)
        if (missionTpl && missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList) {
          each(missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList, c => {
            list.push(c)
          })
        }
        return list
      },

      okToSubmit() {
        return this.missionTplId
          && this.assetId
          && this.missionId
      },

      okToDismiss() {
        return true // TODO
      },
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
        this.description = null
        this.arguments = []
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
        this.$apollo.queries.executor.refetch()
      },

      submit() {
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
              color: 'info',
            })
            this.$utl.push([this.executorId, 'mt', this.missionTplId, 'm', this.missionId])
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
