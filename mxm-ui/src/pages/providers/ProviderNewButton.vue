<script setup lang="ts">
import { CREATE_PROVIDER } from './queries'
import UtlDialog from 'components/utl/UtlDialog.vue'
import ApiTypeSelect from './ApiTypeSelect.vue'
import TestConnectionToProviderButton from './TestConnectionToProviderButton.vue'

import { computed, ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'

import { useQuasar } from 'quasar'

const $q = useQuasar()

const { mutate: createProvider } = useMutation(CREATE_PROVIDER)

const emit = defineEmits<{
  (e: 'providerCreated', v: object): void
}>()

const progress = ref(false)
const dialogOpened = ref(false)
const providerNameInvalid = ref(false)
const progressLabel = ref('')
const providerId = ref('')
const httpEndpoint = ref('')
const apiType = ref('')
const pingOk = ref(false)

const openDialog = () => {
  providerNameInvalid.value = false
  progress.value = false
  progressLabel.value = ''
  apiType.value = ''
  pingOk.value = false
  providerId.value = ''
  httpEndpoint.value = ''
  dialogOpened.value = true
  console.debug('openDialog: dialogOpened=', dialogOpened)
}

const providerSelected = pp => {
  console.debug('providerSelected', pp)
  providerId.value = pp.providerId
  httpEndpoint.value = pp.httpEndpoint
  apiType.value = pp.apiType
}

async function pingResult(v: true | string) {
  console.debug('pingResult: v=', v)
  if (v === true) {
    pingOk.value = true
  } else {
    pingOk.value = false
  }
}

const okToSubmit = computed(
  () => providerId.value && httpEndpoint.value && apiType.value && pingOk.value
)

function closeDialogAndNotify(provider) {
  progress.value = null
  progressLabel.value = null
  dialogOpened.value = false
  $q.notify({
    message: `Provider created: ${provider.providerId}`,
    timeout: 1000,
    position: 'top',
    color: 'info',
  })
  emit('providerCreated', provider)
}

const submit = async () => {
  console.debug('submit')

  const variables = {
    pl: {
      providerId: providerId.value,
      httpEndpoint: httpEndpoint.value,
      apiType: apiType.value,
    },
  }

  $q.loading.show({
    message: 'Registering provider...',
  })
  try {
    const result = await createProvider(variables)
    console.debug('createProvider: result=', result)
    const provider = result?.data?.createProvider ?? {}
    closeDialogAndNotify(provider)
  } catch (error) {
    const graphQLErrors = error.graphQLErrors || []
    const duplicateKey = graphQLErrors.find(
      e => e.message && e.message.match(/.*duplicate key.*/)
    )
    if (duplicateKey) {
      providerNameInvalid.value = 'Provider name already registered'
      // $refs.providerName.focus()
    } else {
      console.error('mutation error=', error)
      $q.notify({
        message: 'Unexpected error. See dev console.',
        timeout: 0,
        closeBtn: 'Close',
        color: 'warn',
      })
    }
  } finally {
    $q.loading.hide()
  }
}

const possibleProviders = [
  {
    providerId: 'provider-example@mxm',
    httpEndpoint: 'http://mxm.shore.mbari.org/mxm-provider-api',
    apiType: 'REST',
  },
  {
    providerId: 'provider-example_8777',
    httpEndpoint: 'http://localhost:8777/mxm-provider-api',
    apiType: 'REST',
  },
  {
    providerId: 'TethysDash@okeanids',
    httpEndpoint: 'https://okeanids.mbari.org/TethysDash/api/mxm',
    apiType: 'REST',
  },
  {
    providerId: 'TethysDash@tethystest:8080',
    httpEndpoint: 'http://tethystest.shore.mbari.org:8080/TethysDash/api/mxm',
    apiType: 'REST',
  },
  {
    providerId: 'TethysDash@tethystest',
    httpEndpoint: 'http://tethystest.shore.mbari.org/TethysDash/api/mxm',
    apiType: 'REST',
  },
  {
    providerId: 'TethysDash@localhost:18080',
    httpEndpoint: 'http://localhost:18080/TethysDash/api/mxm',
    apiType: 'REST',
  },
  {
    providerId: 'TFT@tsauv',
    httpEndpoint: 'http://tsauv.shore.mbari.org/tft-mxm',
    apiType: 'REST',
  },
  {
    providerId: 'TFT@localhost',
    httpEndpoint: 'http://localhost:8040',
    apiType: 'REST',
  },
]
</script>

<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense
      round
      no-caps
      size="sm"
      @click="openDialog"
    >
      <UtlDialog
        size-style="width: 34em"
        :dialog-opened="dialogOpened"
        title="Register a new provider"
        :ok-to-submit="!!okToSubmit && !progress"
        :ok-to-dismiss="!progress"
        @submit="submit"
        @dialogClosing="dialogOpened = false"
      >
        <div class="column q-gutter-sm">
          <div class="column q-pb-md">
            <div class="text-grey-7">
              Note: This dialog and dropdown are mainly for development
              purposes. A possible future mechanism is for the provider to
              register itself.
            </div>

            <q-btn-dropdown
              stack-label
              label="Select..."
              color="grey-7"
              dense
              no-caps
            >
              <q-list>
                <q-item
                  v-for="(pp, index) in possibleProviders"
                  :key="index"
                  clickable
                  v-close-popup
                  @click="providerSelected(pp)"
                >
                  <q-item-section>
                    <q-item-label>{{ pp.providerId }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-separator class="q-mt-md" />
          </div>

          <div>
            Indicate the provider you want to register, which must expose an MXM
            Provider API.
          </div>

          <div>
            Provider name:
            <q-input
              ref="providerName"
              dense
              hide-bottom-space
              no-error-icon
              :error="!providerId.length || !!providerNameInvalid"
              @input="providerNameInvalid = null"
              class="fieldBg"
              v-model.trim="providerId"
              type="text"
              autofocus
              style="width: 28em"
            />
          </div>

          <div>
            HTTP Endpoint:
            <div class="row items-center q-gutter-x-xs">
              <q-input
                dense
                hide-bottom-space
                no-error-icon
                :error="!httpEndpoint.length"
                class="fieldBg"
                v-model.trim="httpEndpoint"
                type="text"
                style="width: 28em"
              />
              <TestConnectionToProviderButton
                :providerId="providerId"
                :httpEndpoint="httpEndpoint"
                :apiType="apiType"
                @pingResult="pingResult"
              />
            </div>
          </div>

          <div>
            API Type:
            <ApiTypeSelect
              class="q-ml-md"
              :selectedApiType="apiType"
              @selectedApiType="val => (apiType = val)"
            />
          </div>

          <div>
            <q-linear-progress
              v-if="progress"
              size="25px"
              :value="progress"
              color="accent"
            >
              <div class="absolute-full flex flex-center">
                <q-badge
                  color="white"
                  text-color="accent"
                  :label="progressLabel"
                />
              </div>
            </q-linear-progress>
          </div>
        </div>
      </UtlDialog>
    </q-btn>
  </div>
</template>
