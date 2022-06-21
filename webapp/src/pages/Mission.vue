<template>
  <q-page class="q-pa-md">
    <div v-if="!loading && mission">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row no-wrap q-gutter-x-lg">
            <div class="column q-gutter-y-sm">
              <div class="row no-wrap items-center q-gutter-x-sm">
                <div>Mission:</div>
                <div class="text-bold">{{ mission.missionId }}</div>
                <div class="row no-wrap items-center text-grey q-gutter-x-sm">
                  <div>Status:</div>
                  <div class="text-bold">{{ mission.missionStatus }}</div>
                </div>
              </div>
              <div class="row no-wrap items-center q-gutter-x-sm" style="font-size:smaller">
                <div class="text-gray">
                  Template:
                </div>
                <div>
                  <router-link
                    :to="$utl.routeLoc([mission.providerId, 'mt', mission.missionTplId])"
                  >
                    {{ mission.missionTplId }}
                  </router-link>
                </div>

                <div class="text-gray">
                  Asset:
                </div>
                <div>
                  <router-link
                    :to="$utl.routeLoc([params.providerId, 'a', mission.assetId])"
                  >
                    {{ mission.assetId }}
                    <q-tooltip>
                      {{ mission.assetByProviderIdAndAssetId.className }}
                    </q-tooltip>
                  </router-link>
                </div>
              </div>
            </div>
            <mxm-markdown
              expandable expandable-title="Description:"
              :text="mission.description"
              :start-markdown="mission.missionTplByProviderIdAndMissionTplId.providerByProviderId.descriptionFormat === 'markdown'"
              :editable="editable()"
              @saveDescription="updateDescription"
            />
          </div>

          <table class="mission-table" style="font-size:smaller">
            <tbody>
            <tr v-if="mission.start">
              <td>Start:</td>
              <td>{{ mission.start }}</td>
            </tr>
            <tr v-if="mission.end">
              <td>End:</td>
              <td>{{ mission.end }}</td>
            </tr>
            </tbody>
          </table>
        </q-card-section>

        <q-separator/>
      </q-card>

      <div
        v-if="provider && provider.usesSched"
        class="row q-mb-sm q-gutter-x-lg"
      >
        <mission-scheduling
          :sched-info="{schedType: mission.schedType, schedDate: mission.schedDate}"
          :editable="mission.missionStatus === 'DRAFT'"
          @schedInfo="updateMissionSched"
        />
      </div>

      <div class="row q-mb-sm q-gutter-x-lg">
        <q-btn
          v-if="mission.missionTplByProviderIdAndMissionTplId.providerByProviderId.canValidate"
          label="Validate"
          icon="check"
          push color="secondary"
          size="sm"
          :disable="mission.missionStatus !== 'DRAFT' || parametersWithErrorCount > 0"
          @click="validateMission"
        >
          <q-tooltip>Validate mission against external provider</q-tooltip>
        </q-btn>
        <q-btn
          label="Submit"
          icon="settings"
          push color="secondary"
          size="sm"
          :disable="disableRun"
          @click="submitMission"
        >
          <q-tooltip>Request execution of this mission</q-tooltip>
        </q-btn>
        <q-btn
          v-if="mission.missionStatus === 'RUNNING' || mission.missionStatus === 'QUEUED'"
          label="Cancel"
          icon="cancel"
          push color="secondary"
          size="sm"
          @click="cancelMission"
        >
          <q-tooltip>Request cancelation of submitted mission</q-tooltip>
        </q-btn>
        <q-btn
          label="Delete"
          icon="delete"
          push color="secondary"
          size="sm"
          :disable="mission.missionStatus !== 'DRAFT' && mission.missionStatus !== 'TERMINATED'"
          @click="deleteMission"
        >
          <q-tooltip>
            Delete this mission<br/>
            <span>
              (only if in DRAFT or<br/>
              TERMINATED status)
            </span>
          </q-tooltip>
        </q-btn>
      </div>

      <q-table
        :dense="$q.screen.lt.md"
        :data="orderedArguments"
        :columns="argColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
        :no-data-label="`No parameters defined in the mission template '${mission.missionTplId}'`"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col">
            <div class="row q-gutter-lg">
              <div
                class="vertical-middle text-weight-light text-grey"
              >
                <span :class="{'text-green': parametersChanged().length}">
                  Overridden parameters: {{parametersChanged().length}}
                </span>
                <q-btn
                  v-if="parametersChanged().length"
                  class="q-ml-md"
                  icon="arrow_upward"
                  dense round color="green-4" size="xs"
                  :outline="!overriddenFirst"
                  @click="overriddenFirst = !overriddenFirst"
                >
                  <q-tooltip>Show overridden parameters first</q-tooltip>
                </q-btn>
              </div>
              <div
                v-if="parametersWithErrorCount"
                class="vertical-middle text-red"
              >
                Arguments missing or with error: {{parametersWithErrorCount}}
              </div>
            </div>

            <div class="row">
              <div class="col-auto text-h5">
                Arguments
              </div>

              <div class="q-ml-md row">
                <q-input
                  v-if="myArguments"
                  class="col"
                  color="secondary"
                  v-model="filter"
                  placeholder="Filter"
                  clearable
                />
              </div>
            </div>
          </div>
        </div>

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td
            key="paramName" :props="props"
            style="width:5px;font-family:monospace;vertical-align:top"
            class="cursor-pointer"
            @click="$router.push($utl.routeLoc([mission.providerId, 'mt', mission.missionTplId, 'p', props.row.paramName]))"
          >
            <div
              style="font-size:1.1em"
              :class="`text-black ${props.row.required ? 'text-bold' : ''}`"
            >
              {{ props.row.paramName }}
            </div>

            <div
              class="text-grey-7 q-mt-sm" style="font-size:0.8em"
            >
              {{ props.row.type }}
              <span v-if="props.row.valueCanReference">
                | {{ props.row.valueCanReference }}
              </span>
            </div>

          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:12em;font-family:monospace;vertical-align:top"
                class="paramValueCell"
          >
            <q-field
              :error="!!valueError(props.row)"
              :error-message="valueError(props.row)"
              :class="paramValueClass(props.row)"
              :style="valueError(props.row) ? '' : 'max-height:2.4em'"
              no-error-icon
              borderless
              hide-bottom-space
            >
              <parameter-value
                :ref="`parameter-value_${props.row.paramName}`"
                class="q-pa-xs"
                style="font-family:monospace;width:12em;word-break:break-all;font-size:0.9em; overflow-x: auto;"
                :param-required="props.row.required"
                :label="`${props.row.paramName}:`"
                :param-name="props.row.paramName"
                :param-type="props.row.type"
                :value-can-reference="props.row.valueCanReference"
                :param-value="props.row.paramValue"
                :original-value="props.row.defaultValue"
                :editable="editable()"
                @save="val => { props.row.paramValue = val; saveArguments(props.row) }"
              />
            </q-field>
          </q-td>

          <q-td
            v-if="provider && provider.usesUnits"
            key="paramUnits" :props="props"
            style="vertical-align:top"
            class="paramValueCell"
          >
            <div
              :class="paramUnitsClass(props.row)"
            >
              <unit-select
                :units="units"
                :units-by-name="unitsByName"
                :value="props.row.paramUnits || ''"
                :reset-value="props.row.defaultUnits"
                :editable="editable()"
                v-on:input="val => { props.row.paramUnits = val; saveArguments(props.row) }"
              />
              <q-tooltip
                v-if="debug && props.row.paramUnits"
                anchor="bottom left" self="bottom right"
              >
                <pre>{{ unitsByName[props.row.paramUnits] }}</pre>
              </q-tooltip>
            </div>
          </q-td>

          <q-td key="description" :props="props"
                style="vertical-align:top"
          >
            <mxm-markdown
              simple hide-empty :text="props.row.description"
              :start-markdown="mission.missionTplByProviderIdAndMissionTplId.providerByProviderId.descriptionFormat === 'markdown'"
            />
          </q-td>
        </q-tr>
      </q-table>
    </div>

    <i v-else-if="loading">
      Loading...
    </i>
    <div v-else>
      <div class="text-negative">Not found:</div>
      <table class="q-ml-md">
        <tbody>
        <tr><td>Mission:<td/><td>{{params.missionId}}</td></tr>
        <tr><td>Mission Template:<td/><td>{{params.missionTplId}}</td></tr>
        <tr><td>Provider:<td/><td>{{params.providerId}}</td></tr>
        </tbody>
      </table>
    </div>
  </q-page>
</template>

<script>
  import missionGql from '../graphql/mission.gql'
  import argumentInsertGql from '../graphql/argumentInsert.gql'
  import argumentUpdateGql from '../graphql/argumentUpdate.gql'
  import argumentDeleteGql from '../graphql/argumentDelete.gql'
  import missionUpdateGql from '../graphql/missionUpdate.gql'
  import missionDeleteGql from '../graphql/missionDelete.gql'

  import ParameterValue from 'components/parameter-value'
  import ParameterValueInput from 'components/parameter-value-input'
  import UnitSelect from 'components/unit-select'
  import MissionScheduling from 'components/mission-scheduling'

  import get from 'lodash/get'
  import map from 'lodash/map'
  import find from 'lodash/find'
  import filter from 'lodash/filter'
  import clone from 'lodash/clone'
  import assign from 'lodash/assign'
  import size from 'lodash/size'
  import orderBy from 'lodash/orderBy'

  const debug = window.location.search.match(/.*debug=.*mission.*/)

  export default {
    components: {
      ParameterValue,
      ParameterValueInput,
      UnitSelect,
      MissionScheduling,
    },

    data: () => ({
      debug,
      loading: false,
      mission: null,
      schedInfo: {},
      provider: null,
      savingArgs: false,

      myArguments: [],
      parametersWithError: {},

      overriddenFirst: false,

      rowsPerPage: [0],
      pagination: {
        rowsPerPage: 0
      },
      filter: '',
    }),

    computed: {
      argColumns() {
        const cols = [
          {
            field: 'paramName',
            name: 'paramName',
            label: 'Parameter',
            align: 'left',
          },
          {
            field: 'paramValue',
            name: 'paramValue',
            label: 'Value',
            align: 'left',
          },
        ]
        if (this.provider && this.provider.usesUnits) {
          cols.push({
            field: 'paramUnits',
            name: 'paramUnits',
            label: 'Units',
            align: 'left',
          })
        }
        cols.push({
          field: 'description',
          name: 'description',
          label: 'Description',
          align: 'left',
        })

        return cols
      },

      params() {
        return this.$route.params
      },

      parametersWithErrorCount() {
        return size(this.parametersWithError)
      },

      disableRun() {
        return this.mission.missionStatus !== 'DRAFT'
          || this.parametersWithErrorCount > 0
          || this.provider.usesSched && this.mission.schedType === 'DATE' && !this.mission.schedDate
      },

      units() {
        return this.$store.state.units.unitsByProvider[this.params.providerId] || []
      },

      unitsByName() {
        const unitsByName = {}
        this.units.forEach(u => {
          unitsByName[u.unitName] = {
            unitName: u.unitName,
            abbreviation: u.abbreviation,
            baseUnit: u.baseUnit,
          }
        })
        return unitsByName
      },

      orderedArguments() {
        if (this.overriddenFirst) {
          return orderBy(this.myArguments, a =>
            !(a.paramValue !== a.defaultValue ||
            a.paramUnits !== a.defaultUnits)
          )
        }
        else return this.myArguments
      },
    },

    apollo: {
      mission: {
        query: missionGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.params.missionTplId,
            missionId: this.params.missionId,
          }
        },
        update(data) {
          if (debug) console.debug('update: data=', data)
          let mission = null

          if (data.missionByProviderIdAndMissionTplIdAndMissionId) {
            mission = data.missionByProviderIdAndMissionTplIdAndMissionId

            if (debug) console.log(`schedType=${mission.schedType} schedDate=${mission.schedDate}`)

            this.provider = mission.missionTplByProviderIdAndMissionTplId.providerByProviderId
          }
          this.setMyArgumentsFromSaved(mission)
          this.loading = false
          return mission
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['Missions', [this.params.providerId, 'm']],
            [this.params.missionId],
          ],
          refresh: this.reloadMission
        })
      },

      refreshMission() {
        if (this.$apollo.queries.mission) {
          this.loading = true
          this.$apollo.queries.mission.refetch()
        }
      },

      async reloadMission() {
        // TODO get updated info from the mutation itself
        await this.updateMission({})
        this.refreshMission()
      },

      editable() {
        return this.mission.missionStatus === 'DRAFT'
      },

      setMyArgumentsFromSaved(mission) {
        if (debug) console.debug('setMyArgumentsFromSaved mission=', mission)
        const alreadySavedArgs = get(mission, 'argumentsByProviderIdAndMissionTplIdAndMissionIdList') || []
        const parameters = get(mission, 'missionTplByProviderIdAndMissionTplId.parametersByProviderIdAndMissionTplIdList') || []

        if (debug) console.debug('alreadySavedArgs=', alreadySavedArgs)

        this.myArguments = map(parameters, p => {
          const arg = find(alreadySavedArgs, {paramName: p.paramName})
          const paramValue = arg && arg.paramValue || p.defaultValue
          const paramUnits = arg && arg.paramUnits || p.defaultUnits
          // console.debug('FIND p.paramName=', p.paramName, 'arg=', arg, 'paramValue=', paramValue)
          return {
            paramName: p.paramName,
            type: p.type,
            valueCanReference: p.valueCanReference,
            paramValue,
            paramUnits,
            defaultValue: p.defaultValue,
            defaultUnits: p.defaultUnits,
            required: p.required,
            description: p.description,
          }
        })
      },

      paramValueClass(row) {
        if (this.valueError(row)) {
          return 'rounded-borders q-pa-xs bg-red-1 text-bold'
        }
        else if ((row.paramValue || '') !== (row.defaultValue || '')) {
          return 'rounded-borders q-pa-xs bg-green-11'
        }
        else {
          return 'q-pa-xs q-pt-lg'
        }
      },

      paramUnitsClass(row) {
        if (row.paramUnits !== row.defaultUnits) {
          return 'rounded-borders q-pa-xs bg-green-11'
        }
      },

      valueError(row) {
        const {paramName} = row
        const parval = this.$refs[`parameter-value_${paramName}`]
        const error = parval && parval.errorMessage()
        if (error) {
          this.$set(this.parametersWithError, paramName, error)
        }
        else {
          this.$delete(this.parametersWithError, paramName)
        }
        return error
      },

      parametersChanged() {
        return filter(this.myArguments, a =>
          a.paramValue !== a.defaultValue ||
          a.paramUnits !== a.defaultUnits
        )
      },

      saveArguments(row) {
        if (this.savingArgs) {
          return
        }

        this.savingArgs = true

        const alreadySavedArgs = get(this.mission, 'argumentsByProviderIdAndMissionTplIdAndMissionIdList') || []
        if (debug) console.debug('saveArguments: alreadySavedArgs=', alreadySavedArgs)

        let numInserted = 0
        let numUpdated = 0
        let numDeleted = 0

        const argList = clone(this.myArguments)
        const nextArg = () => {
          const arg = argList.pop()
          if (!arg) {
            if (debug) console.debug('saveArguments DONE: numInserted=', numInserted,
              'numUpdated=', numUpdated, 'numDeleted=', numDeleted)

            this.savingArgs = false
            if (numInserted || numUpdated || numDeleted) {
              this.refreshMission()
              this.$q.notify({
                message: `Arguments updated`,
                timeout: 700,
                position: 'top',
                color: 'info',
              })
            }
            return
          }

          if (debug) console.debug('saveArguments: checking', arg.paramName,
            `v='${arg.paramValue}' dv='${arg.defaultValue}'`)

          const alreadySavedArg = find(alreadySavedArgs, x => x.paramName === arg.paramName)
          if (debug) console.debug(arg.paramName, 'alreadySavedArg=', alreadySavedArg)

          if (arg.paramValue !== arg.defaultValue || arg.paramUnits !== arg.defaultUnits) {
            if (alreadySavedArg) {
              if (alreadySavedArg.paramValue !== arg.paramValue
                || alreadySavedArg.paramUnits !== arg.paramUnits
              ) {
                if (debug) console.debug(arg.paramName, 'UPDATING', arg.paramValue)
                this.updateArgument(alreadySavedArg.id, arg.paramValue, arg.paramUnits, ok => {
                  if (ok) {
                    numUpdated++
                  }
                  nextArg()
                })
              }
              else nextArg()
            }
            else {
              if (debug) console.debug(arg.paramName, 'INSERTING', arg.paramValue)
              this.insertArgument(arg.paramName, arg.paramValue, arg.paramUnits, ok => {
                if (ok) {
                  numInserted++
                }
                nextArg()
              })
            }
          }
          else {
            // arg has the default value.
            if (alreadySavedArg) {
              if (debug) console.debug(arg.paramName, 'DELETING', arg.paramName)
              this.deleteArgument(alreadySavedArg.id, ok => {
                if (ok) {
                  numDeleted++
                }
                nextArg()
              })
            }
            else nextArg()
          }
        }

        if (debug) console.debug('saveArguments START')
        nextArg()
      },

      insertArgument(paramName, paramValue, paramUnits, next) {
        const mutation = argumentInsertGql
        const variables = {
          missionId: this.params.missionId,
          providerId: this.mission.providerId,
          missionTplId: this.mission.missionTplId,
          paramName,
          paramValue,
          paramUnits,
        }
        if (debug) console.debug('insertArgument: variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('insertArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('insertArgument: mutation error=', error)
            next(false)
          })
      },

      updateArgument(id, paramValue, paramUnits, next) {
        const mutation = argumentUpdateGql
        const variables = {
          input: {
            id,
            argumentPatch: {
              paramValue,
              paramUnits,
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('updateArgument: mutation error=', error)
            next(false)
          })
      },

      deleteArgument(id, next) {
        const mutation = argumentDeleteGql
        const variables = {
          input: {
            id
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('deleteArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('deleteArgument: mutation error=', error)
            next(false)
          })
      },

      async updateDescription(description) {
        await this.updateMission({description})
        this.$q.notify({
          message: 'Mission description saved',
          timeout: 700,
          color: 'info',
          position: 'top',
        })
      },

      async updateMissionSched({schedType, schedDate}) {
        if (schedType !== 'DATE') {
          schedDate = null
        }
        this.mission.schedType = schedType
        this.mission.schedDate = schedDate

        //console.log(`updateMissionSched: schedType=${schedType} schedDate=${schedDate}`)
        await this.updateMission({schedType, schedDate})
        this.$q.notify({
          message: `Mission scheduling updated`,
          timeout: 1200,
          color: 'info',
          position: 'top',
        })
      },

      async updateMissionStatus(missionStatus) {
        return await this.updateMission({missionStatus})
      },

      async updateMission(missionPatch) {
        console.debug('updateMission missionPatch=', missionPatch)
        const mutation = missionUpdateGql
        const variables = {
          input: {
            id: this.mission.id,
            missionPatch
          }
        }
        const data = await this.$apollo.mutate({mutation, variables})
        /*if (debug)*/ console.debug('updateMission: mutation data=', data)
        // TODO review the following!
        if (this.mission) {
          assign(this.mission, get(data, 'data.updateMission.mission'))
        }
        return missionPatch
      },

      // TODO
      validateMission() {
        this.$q.notify({
          message: `TODO validateMission`,
          timeout: 100,
          position: 'center'
        })
      },

      // TODO
      cancelMission() {
        this.$q.notify({
          message: `TODO cancelMission`,
          timeout: 100,
          position: 'center'
        })
      },

      submitMission() {
        // console.log('submitMission: mission=', this.mission); return
        this.$q.dialog({
          title: 'Confirm',
          message: `Submit mission '${this.mission.missionId}' for execution?`,
          color: 'primary',
          cancel: true
        }).onOk(() => doIt())

        // Note:
        // - the submission effect is accomplished by requesting the status to become 'SUBMITTED'
        // - no arguments are passed at all;  backend only needs the mission ID and the status change
        const doIt = async () => {
          try {
            const status = 'SUBMITTED'
            await this.updateMissionStatus(status)
            this.$q.notify({
              message: `Mission submitted. Status: ${this.mission.missionStatus}`,
              timeout: 2000,
              color: 'info',
              position: 'top',
            })
            // TODO all should be reflected, but maybe refresh again?
            // this.refreshMission()
          }
          catch (error) {
            this.$q.notify({
              message: `Mission submission error: ${JSON.stringify(error)}`,
              timeout: 0,
              closeBtn: 'Close',
              color: 'warning',
            })
            console.error('submitMission: postMission: error=', error)
          }
        }
      },

      deleteMission() {
        this.$q.dialog({
          title: 'Confirm',
          message: `Are you sure you want to delete this mission '${this.mission.missionId}'`,
          color: 'negative',
          ok: `Yes, delete '${this.mission.missionId}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => {
          const mutation = missionDeleteGql
          const variables = {
            input: {
              id: this.mission.id,
            }
          }
          this.$apollo.mutate({mutation, variables})
            .then((data) => {
              if (debug) console.debug('deleteMission: mutation data=', data)
              this.$q.notify({
                message: `Mission deleted: '${this.mission.missionId}'`,
                timeout: 2000,
                position: 'top',
                color: 'info',
              })
              this.$utl.replace([this.mission.providerId])
            })
            .catch((error) => {
              console.error('deleteMission: mutation error=', error)
              this.$q.notify({
                message: `Mission deletion error: ${JSON.stringify(error)}`,
                timeout: 0,
                closeBtn: 'Close',
                color: 'warning',
              })
            })
        })
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn(`WATCH params=`, val)
          this.setBreadcrumbs()

          this.parametersWithError = {}
          this.refreshMission()
          this.$store.dispatch('units/getOrLoadUnitsForProvider', this.params.providerId)
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>

<style>
  .mission-table td {
    padding: 2px 4px;
    vertical-align: top;
  }
  .paramValueCell:hover {
    background-color: #eeeeee;
  }
</style>
