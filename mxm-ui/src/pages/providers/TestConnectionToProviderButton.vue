<script setup lang="ts">
import { PING_PROVIDER } from './queries'

import { ref } from 'vue'
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

const $q = useQuasar()

const { mutate: pingProvider } = useMutation(PING_PROVIDER)

const emit = defineEmits<{
  (e: 'pingResult', v: true | 'expired' | string): void
}>()

const pinging = ref(false)
const pingOk = ref(false)
const pingFailed = ref(false)

async function testConnectionToProvider() {
  if (debug) console.debug('testConnectionToProvider: ', props.httpEndpoint)
  pinging.value = true
  pingOk.value = false
  pingFailed.value = false

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
        pingOk.value = false
        emit('pingResult', 'expired')
      }, 5000)
      emit('pingResult', true)
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
      emit('pingResult', message)
    }
  } catch (error) {
    pingFailed.value = true
    console.warn(error.message)
    const message = error.message
    $q.notify({
      color: 'negative',
      message: error.message,
      textColor: 'white',
      timeout: 3000,
      closeBtn: 'Close',
    })
    emit('pingResult', message)
  } finally {
    pinging.value = false
  }
}
</script>

<template>
  <div>
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
      :label="label"
      :color="pingFailed ? 'red' : 'secondary'"
      :loading="pinging"
      dense
      no-caps
      size="sm"
      @click="testConnectionToProvider"
    />
  </div>
</template>
