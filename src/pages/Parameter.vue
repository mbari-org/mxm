<template>
  <q-page class="q-pa-md">
    <div v-if="parameter">
      <div class="q-mb-sm">
        Mission Template: <span class="text-bold">{{ params.missionTplId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-section class="row q-gutter-x-md items-center">
          <span>Parameter:</span>
          <div class="q-ml-sm text-bold" style="font-family:monospace;font-size:larger">
            {{ parameter.paramName }}
          </div>

        </q-card-section>

        <q-separator/>

        <q-card-section>

          <div class="column q-gutter-sm">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <div class="col-2">Required?:</div>
              <div class="bg-blue-1">
                {{ parameter.required ? 'Yes' : 'No' }}
              </div>
            </div>

            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col-2">Type:</div>
              <div class="bg-blue-1">
                {{ parameter.type }}
              </div>
              <div
                v-if="$mxmVal.isNumericType(parameter.type) && parameter.withUnits"
                class="text-grey"
              >
                (along with units of measure)
              </div>
            </div>

            <div class="row items-start no-wrap q-gutter-x-sm">
              <div class="col-2">Default Value:</div>
              <div>
                <div
                  class="col-10 q-pa-xs"
                  style="min-width:4em"
                >
                  <q-field
                    :error="!!defaultValueError()"
                    :error-message="defaultValueError()"
                    class="bg-blue-1"
                    hide-bottom-space
                  >
                    <parameter-value
                      ref="parameter-value"
                      class="q-pa-xs"
                      style="font-family:monospace;min-width:24em;word-break:break-all"
                      :label="`${params.paramName} default value:`"
                      :param-name="params.paramName"
                      :param-type="parameter.type"
                      :param-value="parameter.defaultValue"
                    />
                  </q-field>
                </div>
              </div>
            </div>

            <div
              v-if="$mxmVal.isNumericType(parameter.type) && parameter.withUnits"
              class="row items-center no-wrap q-gutter-sm"
            >
              <div class="col-2">Default Units:</div>
              <div class="bg-blue-1">
                {{ parameter.defaultUnits }}
              </div>
            </div>

            <div
              v-if="parameter.valueCanReference"
              class="row items-center no-wrap q-gutter-x-sm"
            >
              <div>Value can reference:</div>
              <div class="text-bold">
                {{ parameter.valueCanReference }}
              </div>
            </div>

            <div class="row items-start no-wrap q-gutter-x-sm">
              <div class="col-2">Description:</div>
              <div>
                <div
                  class="col-10 q-pa-xs"
                  style="min-width:4em"
                >
                  <mxm-markdown
                    style="min-height:4em;min-width:24em"
                    :text="parameter.description"
                    :start-markdown="parameter.missionTplByProviderIdAndMissionTplId.providerByProviderId.descriptionFormat === 'markdown'"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Parameter not found.
      <div class="q-ml-md">
        Provider: {{params.providerId}} <br/>
        Mission Template ID: {{params.missionTplId}}
      </div>
    </div>
  </q-page>
</template>

<script>
  import parameterGql from '../graphql/parameter.gql'

  import ParameterValue from 'components/parameter-value'

  const debug = true

  export default {
    components: {
      ParameterValue,
    },

    data: () => ({
      loading: false,
      parameter: null,
    }),

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      parameter: {
        query: parameterGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.params.missionTplId,
            paramName: this.params.paramName,
          }
        },
        update(data) {
          let parameter = null
          if (data.parameterByProviderIdAndMissionTplIdAndParamName) {
            parameter = data.parameterByProviderIdAndMissionTplIdAndParamName
          }
          if (debug) console.log('update: parameter=', parameter)
          parameter.withUnits = !!parameter.defaultUnits
          return parameter
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['MissionTemplates', [this.params.providerId, 'mt']],
            [this.params.missionTplId, [this.params.providerId, 'mt', this.params.missionTplId]],
            ['Params', [this.params.providerId, 'mt', this.params.missionTplId]],
            [this.params.paramName],
          ],
          refresh: this.refreshParameter
        })
      },

      refreshParameter() {
        if (this.$apollo.queries.parameter) {
          this.$apollo.queries.parameter.refetch()
        }
      },

      defaultValueError() {
        const parval = this.$refs['parameter-value']
        return parval && parval.errorMessage()
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshParameter()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>

<style>
  .mission-table td {
    padding: 4px 4px;
    vertical-align: top;
  }
</style>
