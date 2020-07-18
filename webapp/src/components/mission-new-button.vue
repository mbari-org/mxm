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
      :title="`New mission (for '${providerId}')`"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      submit-label="OK"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <p style="font-size:small" class="text-grey-9">
        The mission will initially be registered with 'DRAFT' status.
        You can then edit any parameters and submit it for execution.
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
  import providerGql from '../graphql/provider.gql'
  import missionInsertGql from '../graphql/missionInsert.gql'

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
      providerId: {
        type: String,
        required: true,
      }
    },

    data: () => ({
      dialogOpened: false,
      provider: null,
      missionTplId: '',
      assetId: '',
      missionId: '',
      description: null,
      schedType: 'ASAP',
      arguments: [],
      startDate: null,
      endDate: null
    }),

    computed: {
      missionTpls() {
        const all = this.provider && this.provider.missionTplsByProviderIdList || []
        return all.filter(mt => !mt.missionTplId.endsWith('/'))
      },

      assetClasses() {
        const list = []
        const missionTpl = find(this.missionTpls, {missionTplId: this.missionTplId})
        if (debug) console.debug('missionTpl=', missionTpl)
        if (missionTpl && missionTpl.missionTplAssetClassesByProviderIdAndMissionTplIdList) {
          each(missionTpl.missionTplAssetClassesByProviderIdAndMissionTplIdList, c => {
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
      provider: {
        query: providerGql,
        variables() {
          return {
            providerId: this.providerId,
          }
        },
        update(data) {
          if (debug) console.log('mission-new-button update: data=', data)
          if (data.allProvidersList && data.allProvidersList.length) {
            return data.allProvidersList[0]
          }
          else return null
        },
      },
    },

    methods: {
      openDialog() {
        this.provider = null
        this.missionTplId = ''
        this.assetId = ''
        this.missionId = ''
        this.description = null
        this.arguments = []
        this.schedType = 'ASAP'
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
        this.$apollo.queries.provider.refetch()
      },

      submit() {
        const mission = {
          providerId: this.providerId,
          missionTplId: this.missionTplId,
          missionId: this.missionId,
          missionStatus: 'DRAFT',
          schedType: this.schedType,
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

        const mutation = missionInsertGql
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Mission created',
              timeout: 1000,
              color: 'info',
            })
            this.$utl.push([this.providerId, 'mt', this.missionTplId, 'm', this.missionId])
            // this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      }
    },

    watch: {
      providerId(val) {
        if (debug) console.debug('watch providerId=', val)
        this.$apollo.queries.provider.refetch()
      },

      assetClasses(val) {
        if (debug) console.debug('watch assetClasses=', val)
      },
    }
  }
</script>
