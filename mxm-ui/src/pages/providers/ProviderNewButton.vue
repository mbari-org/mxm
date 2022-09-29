<script setup lang="ts">
import { PING_PROVIDER, CREATE_PROVIDER } from './queries'
import UtlDialog from 'components/utl/UtlDialog.vue'
import ApiTypeSelect from './ApiTypeSelect.vue'

import { computed, ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'

import { useQuasar } from 'quasar'

const $q = useQuasar()

const { mutate: pingProvider } = useMutation(PING_PROVIDER)
const { mutate: createProvider } = useMutation(CREATE_PROVIDER)

const emit = defineEmits<{
  (e: 'providerCreated', v: object): void
}>()

const progress = ref(false)
const dialogOpened = ref(false)
const providerNameInvalid = ref(false)
const progressLabel = ref('')
const apiType = ref('')
const pingOk = ref(false)
const pingFailed = ref(false)
const providerId = ref('')
const httpEndpoint = ref('')

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

async function testConnectionToProvider() {
  console.debug('testConnectionToProvider')
  pingOk.value = false
  pingFailed.value = false

  const variables = {
    pl: {
      providerId: providerId.value,
      httpEndpoint: httpEndpoint.value,
      apiType: apiType.value,
    },
  }

  $q.loading.show({
    message: 'Pinging provider...',
  })
  try {
    const result = await pingProvider(variables)
    console.debug('pingProvider: result=', result)
    const datetime = result?.data?.pingProvider?.result?.datetime
    if (datetime) {
      pingOk.value = true
      setTimeout(() => {
        pingOk.value = false
      }, 5000)
    } else {
      pingFailed.value = true
      const message = 'Provider did not return expected ping response'
      console.warn(message)
      $q.notify({
        color: 'negative',
        message,
        textColor: 'white',
        timeout: 3000,
        closeBtn: 'Close',
      })
    }
  } catch (error) {
    pingFailed.value = true
    console.debug(typeof error.message)
    console.warn(error.message)
    $q.notify({
      color: 'negative',
      message: error.message,
      textColor: 'white',
      timeout: 3000,
      closeBtn: 'Close',
    })
  } finally {
    $q.loading.hide()
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
    apiType: 'REST0',
  },
  {
    providerId: 'provider-example_8777',
    httpEndpoint: 'http://localhost:8777/mxm-provider-api',
    apiType: 'REST0',
  },
  {
    providerId: 'TethysDash@okeanids',
    httpEndpoint: 'https://okeanids.mbari.org/TethysDash/api/mxm',
    apiType: 'REST0',
  },
  {
    providerId: 'TethysDash@tethystest:8080',
    httpEndpoint: 'http://tethystest.shore.mbari.org:8080/TethysDash/api/mxm',
    apiType: 'REST0',
  },
  {
    providerId: 'TethysDash@tethystest',
    httpEndpoint: 'http://tethystest.shore.mbari.org/TethysDash/api/mxm',
    apiType: 'REST0',
  },
  {
    providerId: 'TethysDash@localhost:18080',
    httpEndpoint: 'http://localhost:18080/TethysDash/api/mxm',
    apiType: 'REST0',
  },
  {
    providerId: 'TFT@tsauv',
    httpEndpoint: 'http://tsauv.shore.mbari.org/tft-mxm',
    apiType: 'REST0',
  },
  {
    providerId: 'TFT@localhost',
    httpEndpoint: 'http://localhost:8040',
    apiType: 'REST0',
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
        :dialog-opened="dialogOpened"
        title="Register a new provider"
        :ok-to-submit="!!okToSubmit && !progress"
        :ok-to-dismiss="!progress"
        @submit="submit"
        @dialogClosing="dialogOpened = false"
      >
        <div class="column q-gutter-sm">
          <q-btn-dropdown
            class="q-ml-lg"
            stack-label
            label="Select..."
            color="accent"
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

          <p>
            Indicate the provider you want to register,
            which must expose an MXM Provider API.
            <br /><br />
            Note: this dialog and the dropdown above are mainly for development purposes.
            A possible future mechanism is for the provider to register itself.
          </p>

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
              <q-btn
                v-if="pingOk"
                icon="check"
                dense
                round
                no-caps
                size="sm"
                class="text-green-5"
              />
              <q-btn
                v-else
                :disable="!httpEndpoint"
                label="Test connection"
                :color="pingFailed ? 'red' : 'secondary'"
                dense
                no-caps
                size="sm"
                @click="testConnectionToProvider"
              />
            </div>
          </div>

          <div>
            API Type:
            <ApiTypeSelect
              :selectedApiType="apiType"
              @selectedApiType="
                val => {
                  apiType = val.value
                }
              "
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
