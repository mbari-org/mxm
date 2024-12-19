<script setup lang="ts">
import { PING_PROVIDER } from './queries'

import { inject, ref, watch } from 'vue'
import { useMutation } from '@vue/apollo-composable'

import { useQuasar } from 'quasar'

const debug = window.location.search.match(/.*debug=.*\bping\b.*/)

interface Props {
  providerId?: string
  httpEndpoint?: string
  apiType?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Test connection',
})

const utl = inject('utl')

const $q = useQuasar()

const { mutate: pingProvider } = useMutation(PING_PROVIDER)

const emit = defineEmits<{
  (e: 'pingResult', v: true | 'expired' | string): void
}>()

const pinging = ref(false)
const pingOk = ref(false)
const pingFailed = ref(false)

function reset() {
  pinging.value = false
  pingOk.value = false
  pingFailed.value = false
}

watch(
  () => props.httpEndpoint,
  () => reset()
)

async function testConnectionToProvider() {
  if (debug) console.debug('testConnectionToProvider: ', props.httpEndpoint)
  reset()
  pinging.value = true

  const variables = {
    pl: {
      providerId: props.providerId,
      httpEndpoint: props.httpEndpoint,
      apiType: props.apiType,
    },
  }

  try {
    const result = await pingProvider(variables)
    if (debug) console.debug('pingProvider: result=', result)
    const datetime = result?.data?.pingProvider?.result?.datetime
    if (datetime) {
      pingOk.value = true
      setTimeout(() => {
        reset()
        emit('pingResult', 'expired')
      }, 5000)
      emit('pingResult', true)
    } else {
      // note: some redundancy here as mxm-server also checks for datetime
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
      emit('pingResult', message)
    }
  } catch (error) {
    utl.exceptionHelper($q, error)
    pingFailed.value = true
    const message = error.message
    emit('pingResult', message)
  } finally {
    pinging.value = false
    setTimeout(reset, 5000)
  }
}
</script>

<template>
  <q-btn
    :icon="pingOk ? 'check' : 'settings_ethernet'"
    :disable="!httpEndpoint"
    :class="`myBtn ${pingOk ? 'text-green-5' : pingFailed ? 'text-red-5' : ''}`"
    :loading="pinging"
    @click="testConnectionToProvider"
    dense
    round
    no-caps
    size="sm"
  >
    <q-tooltip>{{ label }}</q-tooltip>
  </q-btn>
</template>

<style scoped>
body.body--dark .myBtn {
  background: #3d3d37;
}
</style>
