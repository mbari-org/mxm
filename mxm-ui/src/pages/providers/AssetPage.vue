<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import { ASSET } from './queries'
import { computed } from 'vue'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'

const debug = window.location.search.match(/.*debug=.*\basset\b.*/)

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)
const assetId = computed(() => params.value.assetId)

const {
  result,
  loading,
  refetch: refetchAsset,
} = useQuery(ASSET, {
  providerId,
  assetId,
})

const asset = computed(() => result.value?.asset ?? {})

const provider = computed(() => asset.value?.provider ?? {})

useUtlStore().setRefreshFunction(refetchAsset, 'Refresh asset')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="asset.assetId">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div>Asset ID:</div>
            <div class="text-bold">{{ asset.assetId }}</div>
            <div>
              (class:
              <router-link
                style="text-decoration: none"
                :to="utl.routeLoc([params.providerId, 'ac', asset.className])"
                >{{ asset.className }}
              </router-link>
              )
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <MxmMarkdown
            :text="asset.description"
            :start-markdown="provider.descriptionFormat === 'markdown'"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="!loading">Asset: {{ params.assetId }}</div>

    <div v-if="debug">
      <pre>{{ asset }}</pre>
    </div>
  </q-page>
</template>
