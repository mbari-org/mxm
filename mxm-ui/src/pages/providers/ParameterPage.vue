<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import { PARAMETER } from './queries'
import { computed, inject } from 'vue'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'
import ParameterValue from 'components/paramInput/ParameterValue.vue'

const mxmVal = inject('mxmVal')

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)
const missionTplId = computed(() => params.value.missionTplId)
const paramName = computed(() => params.value.paramName)

const {
  result,
  loading,
  refetch: refetchParameter,
} = useQuery(PARAMETER, {
  providerId,
  missionTplId,
  paramName,
})

const parameter = computed(() => result.value?.parameter ?? {})

useUtlStore().setRefreshFunction(refetchParameter, 'Refresh this parameter')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="parameter.paramName">
      <div class="q-mb-sm">
        Mission Template:
        <span class="text-bold">{{ params.missionTplId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-section class="row q-gutter-x-md items-center">
          <span>Parameter:</span>
          <div
            class="q-ml-sm text-bold"
            style="font-family: monospace; font-size: larger"
          >
            {{ parameter.paramName }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="column q-gutter-sm">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <div class="col-2">Required?:</div>
              <div class="fieldBg q-px-xs">
                {{ parameter.required ? 'Yes' : 'No' }}
              </div>
            </div>

            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col-2">Type:</div>
              <div class="fieldBg q-px-xs">
                {{ parameter.type }}
              </div>
              <div
                v-if="
                  mxmVal.isNumericType(parameter.type) && parameter.defaultUnits
                "
                class="text-grey"
              >
                (along with units of measure)
              </div>
            </div>

            <div class="row items-start no-wrap q-gutter-x-sm">
              <div class="col-2">Default Value:</div>
              <div>
                <div class="col-10 fieldBg" style="min-width: 4em">
                  <ParameterValue
                    style="
                      font-family: monospace;
                      min-width: 24em;
                      word-break: break-all;
                    "
                    :label="`${params.paramName} default value:`"
                    :param-name="params.paramName"
                    :param-type="parameter.type"
                    :param-value="parameter.defaultValue"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="
                mxmVal.isNumericType(parameter.type) && parameter.defaultUnits
              "
              class="row items-center no-wrap q-gutter-sm"
            >
              <div class="col-2">Default Units:</div>
              <div class="fieldBg">
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
              <MxmMarkdown
                style="min-height: 4em; min-width: 24em"
                :text="parameter.description"
                :start-markdown="
                  parameter?.provider?.descriptionFormat === 'markdown'
                "
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="!loading">
      Parameter not found: <code class="text-bold">{{ params.paramName }}</code>
      <div class="q-ml-md">
        Mission Template ID: {{ params.missionTplId }} <br />
        Provider: {{ params.providerId }}
      </div>
    </div>

    <!--
    <pre>loading={{ loading }}</pre>
    <pre>parameter={{ parameter }}</pre>
    -->
  </q-page>
</template>
