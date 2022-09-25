<script setup lang="ts">
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'
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
  refetch: refreshProvider,
} = useQuery(PROVIDER_SUMMARY, {
  providerId,
})

const provider = computed(() => result.value?.provider ?? {})

const numActualMissionTemplates = computed(
  () => provider.value?.numActualMissionTemplates ?? 0
)

const numAssetClasses = computed(() => provider.value?.numAssetClasses ?? 0)

const numAssets = computed(() => provider.value?.numAssets ?? 0)

const numUnits = computed(() => provider.value?.numUnits ?? 0)

const numMissions = computed(() => provider.value?.numMissions ?? 0)

const utlStore = useUtlStore()

utlStore.setRefreshFunction(refreshProvider, 'Refresh this provider')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="loading">
      <q-spinner />
    </div>
    <div v-else-if="provider && provider.providerId">
      <q-card class="q-mb-md q-mt-lg">
        <q-card-section class="row q-gutter-md items-center">
          <span>Provider:</span>
          <span class="text-bold">{{ provider.providerId }}</span>
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

          <div class="column q-mb-md q-gutter-md">
            <div class="row q-gutter-md">
              <q-btn
                :label="`Mission Templates (${numActualMissionTemplates})`"
                no-wrap
                no-caps
                dense
                :to="utl.routeLoc([providerId, 'mt'])"
              />

              <q-btn
                :label="`Asset Classes (${numAssetClasses})`"
                no-wrap
                no-caps
                dense
                :to="utl.routeLoc([providerId, 'ac'])"
              />

              <q-btn
                :label="`Assets (${numAssets})`"
                no-wrap
                no-caps
                dense
                :to="utl.routeLoc([providerId, 'a'])"
              />

              <q-btn
                v-if="provider.usesUnits"
                :label="`Units (${numUnits})`"
                no-wrap
                no-caps
                dense
                :to="utl.routeLoc([providerId, 'u'])"
              />
            </div>
            <div class="row q-gutter-md">
              <q-btn
                :label="`Missions (${numMissions})`"
                no-wrap
                no-caps
                dense
                :to="utl.routeLoc([providerId, 'm'])"
              />
            </div>
          </div>

          <q-separator />
          <table class="q-mt-sm">
            <tbody>
              <tr>
                <td>Endpoint:</td>
                <td>
                  <span class="text-bold">
                    {{ provider.httpEndpoint }}
                  </span>
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
                <td>Units of measure:</td>
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
