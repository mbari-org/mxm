<script setup lang="ts">
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'
import TestConnectionToProviderButton from './TestConnectionToProviderButton.vue'
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { useUtlStore } from 'stores/utl'
import { useRoute } from 'vue-router'
import { PROVIDER_SUMMARY } from './queries'

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)

const {
  result,
  loading,
  refetch: refetchProvider,
} = useQuery(PROVIDER_SUMMARY, {
  providerId,
})

const provider = computed(() => result.value?.provider ?? {})

const numActualMissionTemplates = computed(
  () => provider.value?.numActualMissionTemplates ?? 0
)

const numAssetClasses = computed(() => provider.value?.numAssetClasses ?? 0)

const numMissions = computed(() => provider.value?.numMissions ?? 0)

const utlStore = useUtlStore()

refetchProvider()
utlStore.setRefreshFunction(refetchProvider, 'Refresh this provider')
</script>

<template>
  <q-page class="q-pa-sm">
    <div v-if="loading">
      <q-spinner />
    </div>
    <div v-else-if="provider && provider.providerId">
      <q-card class="q-mb-md q-mt-lg">
        <q-card-section class="row q-gutter-md items-center">
          <div>Provider:</div>
          <div class="text-h6">{{ provider.providerId }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>
            <MxmMarkdownView
              expandable
              init-expanded
              expandable-title="Description:"
              :text="provider.description"
              :start-markdown="provider.descriptionFormat === 'markdown'"
            />
          </div>
          <q-separator />

          <div class="row q-my-md q-gutter-x-lg">
            <q-btn
              label="Mission Templates"
              no-wrap
              no-caps
              dense
              class="mxmBtn q-px-md"
              :to="utl.routeLoc(['p', providerId, 'mt'])"
            >
              <q-badge color="orange" floating>
                {{ numActualMissionTemplates }}
              </q-badge>
            </q-btn>

            <q-btn
              label="Asset Classes"
              no-wrap
              no-caps
              dense
              class="mxmBtn q-px-md"
              :to="utl.routeLoc(['p', providerId, 'ac'])"
            >
              <q-badge color="orange" floating>
                {{ numAssetClasses }}
              </q-badge>
            </q-btn>

            <q-btn
              label="Missions"
              no-wrap
              no-caps
              dense
              class="mxmBtn q-px-md"
              :to="utl.routeLoc(['p', providerId, 'm'])"
            >
              <q-badge color="orange" floating>
                {{ numMissions }}
              </q-badge>
            </q-btn>
          </div>

          <q-separator />
          <table class="q-mt-sm">
            <tbody>
              <tr>
                <td>Endpoint:</td>
                <td class="row q-gutter-x-md items-center">
                  <div class="text-bold">
                    {{ provider.httpEndpoint }}
                  </div>
                  <TestConnectionToProviderButton
                    :providerId="provider.providerId"
                    :httpEndpoint="provider.httpEndpoint"
                    :apiType="provider.apiType"
                  />
                </td>
              </tr>
              <tr>
                <td>API Type:</td>
                <td>
                  <span class="text-bold">
                    {{ provider.apiType }}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Uses units of measure:</td>
                <td class="text-bold">
                  {{ provider.usesUnits ? 'Yes' : 'No ' }}
                </td>
              </tr>
              <tr>
                <td>Scheduling:</td>
                <td class="text-bold">
                  {{ provider.usesSched ? 'Yes' : 'No ' }}
                </td>
              </tr>
              <tr>
                <td>Can validate mission:</td>
                <td class="text-bold">
                  {{ provider.canValidate ? 'Yes' : 'No ' }}
                </td>
              </tr>
              <tr>
                <td>Can report mission status:</td>
                <td class="text-bold">
                  {{ provider.canReportMissionStatus ? 'Yes' : 'No ' }}
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

      <!--      <pre>provider={{ provider }}</pre>-->
    </div>
    <div v-else>Provider not found: {{ providerId }}</div>
  </q-page>
</template>
