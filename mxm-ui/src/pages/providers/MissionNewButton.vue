<script setup lang="ts">
import UtlDialog from 'components/utl/UtlDialog.vue'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'

import { PROVIDER_MISSION_TEMPLATES, MISSION_INSERT } from './queries'

import { computed, inject, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMutation, useQuery } from '@vue/apollo-composable'
import MissionTemplateSelect from './MissionTemplateSelect.vue'
import AssetSelect from './AssetSelect.vue'

interface Props {
  providerId: string
}

const props = defineProps<Props>()

const providerId = computed(() => props.providerId)

const utl = inject('utl')

const { result, loading } = useQuery(PROVIDER_MISSION_TEMPLATES, {
  providerId,
})
const provider = computed(() => result.value?.provider ?? {})

const missionTpls = computed(() => provider.value?.missionTemplates ?? [])

const actualMissionTpls = computed(() =>
  missionTpls.value.filter(({ missionTplId }) => !missionTplId.endsWith('/'))
)

const { mutate: createMission } = useMutation(MISSION_INSERT)

const $q = useQuasar()

const dialogOpened = ref(false)
const selectedMissionTemplate = ref(null)
const selectedAsset = ref(null)
const missionId = ref('')
const description = ref(null)
const schedType = ref('ASAP')
const startDate = ref(null)
const endDate = ref(null)

const openDialog = () => {
  selectedMissionTemplate.value = null
  selectedAsset.value = null
  missionId.value = ''
  description.value = null
  schedType.value = 'ASAP'
  startDate.value = null
  endDate.value = null
  dialogOpened.value = true
  console.debug('openDialog: dialogOpened=', dialogOpened)
}

const okToSubmit = computed(
  () => selectedMissionTemplate.value && selectedAsset.value && missionId.value
)

const okToDismiss = computed(
  () => true // TODO
)

const submit = async () => {
  console.debug('submit')
  const missionTplId = selectedMissionTemplate.value.missionTplId
  const pl = {
    providerId: props.providerId,
    missionTplId,
    missionId: missionId.value,
    missionStatus: 'DRAFT',
    schedType: schedType.value,
    assetId: selectedAsset.value.assetId,
    description: description.value,
  }
  if (startDate.value) {
    pl.startDate = startDate.value.toISOString()
  }
  if (endDate.value) {
    pl.endDate = endDate.value.toISOString()
  }

  const variables = { pl }
  console.debug('variables=', variables)

  try {
    const data = await createMission(variables)
    console.debug('createMission: mutation data=', data)
    dialogOpened.value = false
    $q.notify({
      message: 'Mission created',
      timeout: 1000,
      color: 'info',
    })
    utl.push(['p', props.providerId, 'mt', missionTplId, 'm', missionId.value])
  } catch (error) {
    console.error('submit: mutation error=', error)
  }
}

function missionTemplateSelected(mt) {
  console.debug('missionTemplateSelected: mt=', mt)
  selectedMissionTemplate.value = mt.value
}

function assetSelected(a) {
  console.debug('assetSelected: a=', a)
  selectedAsset.value = a.value
}
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
        :title="`New mission (for '${providerId}')`"
        submitLabel="Create mission draft"
        :ok-to-submit="!!okToSubmit"
        :ok-to-dismiss="!!okToDismiss"
        @submit="submit"
        @dialogClosing="dialogOpened = false"
      >
        <p style="font-size: small">
          The mission will initially be registered with the 'DRAFT' status. You
          can then edit it as needed and then submit it for execution.
        </p>

        <div class="column q-gutter-sm">
          <div :class="{ 'text-red': !selectedMissionTemplate }">
            Mission Template:
            <MissionTemplateSelect
              :loading="loading"
              :missionTpls="actualMissionTpls"
              :selectedMissionTemplate="selectedMissionTemplate"
              @selectedMissionTemplate="missionTemplateSelected"
            />
          </div>

          <div :class="{ 'text-red': !selectedAsset }">
            Asset:
            <AssetSelect
              v-if="selectedMissionTemplate"
              :assetClasses="selectedMissionTemplate.assetClasses"
              :selectedAsset="selectedAsset"
              @selectedAsset="assetSelected"
            />
          </div>

          <div :class="{ 'text-red': !missionId.length }">
            Mission ID:
            <q-input
              dense
              hide-bottom-space
              class="fieldBg"
              v-model.trim="missionId"
              type="text"
              style="width: 24em"
            />
          </div>

          <div>
            Mission Description:
            <MxmMarkdown
              expandable
              class="fieldBg"
              style="min-height: 6em; min-width: 24em"
              :text="description"
              editable
              edit-click
              @saveDescription="
                d => {
                  description = d
                }
              "
            />
          </div>
        </div>
      </UtlDialog>
    </q-btn>
  </div>
</template>
