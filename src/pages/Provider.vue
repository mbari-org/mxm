<template>
  <q-page class="q-pa-md">
    <!--<pre v-if="debug">provider={{provider}}</pre>-->

    <div v-if="provider">

      <q-card class="q-mb-md q-mt-lg">
        <q-card-section class="row q-gutter-md items-center">
          <span>Provider:</span>
          <span class="text-bold">{{provider.providerId}}</span>

          <div class="q-ml-xl">
            <q-btn
              :disable="noChanges()"
              :color="noChanges() ? 'grey' : 'red'"
              size="sm"
              :class="{'shadow-5': !noChanges()}"
              dense round icon="save"
              @click="updateProvider"
            />
            <q-btn
              v-if="!noChanges()"
              class="q-ml-md"
              color="grey"
              size="sm"
              dense round icon="undo"
              @click="refreshProvider"
            />
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <div>
            <mxm-markdown
              expandable init-expanded expandable-title="Description:"
              :text="provider.description"
              :start-markdown="provider.descriptionFormat === 'markdown'"
              editable
              @saveDescription="d => { provider.description = d }"
            />
          </div>
          <q-separator/>

          <div class="column q-mb-md q-gutter-md">
            <div class="row q-gutter-md">
              <q-btn
                :label="`Mission Templates (${numMissionTemplates()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'mt'])"
              />

              <q-btn
                :label="`Asset Classes (${numAssetClasses()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'ac'])"
              />

              <q-btn
                :label="`Assets (${numAssets()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'a'])"
              />

              <q-btn
                v-if="provider.usesUnits"
                :label="`Units (${numUnits()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'u'])"
              />
            </div>

            <div class="row q-gutter-md">
              <q-btn
                :label="`Missions (${numMissions()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'm'])"
              />
            </div>
          </div>

          <q-separator/>
          <table class="q-mt-sm">
            <tbody>
            <tr>
              <td>Endpoint:</td>
              <td>
                <span class="text-bold">
                  {{provider.httpEndpoint}}
                </span>
                <q-popup-edit
                  v-model="provider.httpEndpoint"
                  title="Endpoint"
                  buttons
                >
                  <q-input
                    v-model.trim="provider.httpEndpoint"
                    clearable autofocus
                    class="bg-green-1"
                  />
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>API Type:</td>
              <td>
                <span class="text-bold">
                  {{provider.apiType}}
                </span>
                <q-popup-edit
                  v-model="provider.apiType"
                  title="API Type"
                  buttons
                >
                  <api-type-select
                    :value="provider.apiType"
                    @input="val => { provider.apiType = val.value }"
                  />
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>Can validate:</td>
              <td class="text-bold">
                {{ provider.canValidate ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr>
              <td>Units of measure:</td>
              <td class="text-bold">
                {{ provider.usesUnits ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr>
              <td>Scheduling:</td>
              <td class="text-bold">
                {{ provider.usesSched ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr v-if="provider.descriptionFormat">
              <td>Description format:</td>
              <td class="text-bold">
                {{ provider.descriptionFormat }}
              </td>
            </tr>
            </tbody>
          </table>

        </q-card-section>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Provider not found: {{params.providerId}}
    </div>

<!--    <pre>{{provider}}</pre>-->

  </q-page>
</template>

<script>
  import providerGql from '../graphql/provider.gql'
  import providerUpdateGql from '../graphql/providerUpdate.gql'

  import apiTypeSelect from '../components/api-type-select'
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'
  import reduce from 'lodash/reduce'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
    },

    data() {
      return {
        debug,
        loading: false,
        original: null,
      }
    },

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      provider: {
        query: providerGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          let provider = null
          if (data.allProvidersList && data.allProvidersList.length) {
            provider = data.allProvidersList[0]
          }
          this.original = cloneDeep(provider)
          return provider
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          [this.params.providerId],
        ],
        refresh: this.refreshProvider
      })

      this.refreshProvider()
    },

    methods: {
      noChanges() {
        return this.provider === null || isEqual(this.provider, this.original)
      },

      refreshProvider() {
        this.$apollo.queries.provider.refetch()
      },

      updateProvider() {
        if (debug) console.debug('updateProvider provider=', this.provider)
        const mutation = providerUpdateGql
        const providerPatch = {}

        if (!isEqual(this.provider.description, this.original.description)) {
          providerPatch.description = this.provider.description
        }
        if (!isEqual(this.provider.httpEndpoint, this.original.httpEndpoint)) {
          providerPatch.httpEndpoint = this.provider.httpEndpoint
        }
        if (!isEqual(this.provider.apiType, this.original.apiType)) {
          providerPatch.apiType = this.provider.apiType
        }

        const variables = {
          input: {
            id: this.provider.id,
            providerPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateProvider: mutation data=', data)
            this.refreshProvider()
            this.$q.notify({
              message: `Provider updated`,
              timeout: 1000,
              color: 'info',
            })
          })
          .catch((error) => {
            console.error('updateProvider: mutation error=', error)
          })
      },

      numMissionTemplates() {
        if (this.provider) {
          return this.provider.missionTplsByProviderIdList.length
        }
        else return 0
      },

      numMissions() {
        if (this.provider) {
          return reduce(this.provider.missionTplsByProviderIdList,
              (result, missionTemplate) => result + missionTemplate.missionsByProviderIdAndMissionTplIdList.length,
              0
          )
        }
        else return 0
      },

      numAssetClasses() {
        if (this.provider) {
          return this.provider.assetClassesByProviderIdList.length
        }
        else return 0
      },

      numAssets() {
        if (this.provider) {
          return reduce(this.provider.assetClassesByProviderIdList,
              (result, assetClass) => result + assetClass.assetsByProviderIdAndClassNameList.length,
              0
          )
        }
        else return 0
      },

      numUnits() {
        if (this.provider) {
          return this.provider.unitsByProviderIdList.length
        }
        else return 0
      },
    },

    watch: {
      '$route'() {
        this.refreshProvider()
      },

      provider(val) {
        if (debug) console.log('watch provider=', val)
      }
    }
  }
</script>
