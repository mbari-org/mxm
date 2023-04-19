<script setup lang="ts">
import { DarkMode, useOptsStore } from 'stores/opts'
import { useQuasar } from 'quasar'
import { onMounted, ref, watch } from 'vue'

const optsStore = useOptsStore()

interface Props {
  iconNameActive?: string
  iconNameInactive?: string
  size?: string
  debug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconNameActive: 'wb_sunny',
  iconNameInactive: 'nights_stay',
  size: '18px',
  debug: false,
})

const $q = useQuasar()

onMounted(() => {
  $q.dark.set(optsStore.darkMode)
})

watch(
  () => $q.dark.isActive,
  () => {
    optsStore.setDarkModeIsActive($q.dark.isActive)
  }
)

function switchDarkMode() {
  const edm: boolean =
    optsStore.darkMode === 'auto' ? !$q.dark.isActive : !optsStore.darkMode
  optsStore.setDarkMode(edm)
  $q.dark.set(edm)
}

const menuOpen = ref(false)

function setDarkMode(darkMode: DarkMode) {
  optsStore.setDarkMode(darkMode)
  $q.dark.set(darkMode)
}
</script>

<template>
  <div>
    <q-icon
      @mouseover="menuOpen = true"
      @click.exact.stop.prevent="switchDarkMode()"
      :name="
        props.effectiveMode === 'on'
          ? props.iconNameActive
          : props.iconNameInactive
      "
      :size="size"
      class="cursor-pointer"
    />
    <q-menu
      @mouseleave="menuOpen = false"
      :model-value="menuOpen"
      @hide="menuOpen = false"
    >
      <div class="q-ma-sm column items-center">
        <div class="text-bold">Dark mode:</div>
        <div class="row items-center q-gutter-x-sm">
          <q-radio
            val="true"
            label="On"
            :modelValue="optsStore.darkMode.toString()"
            @update:modelValue="setDarkMode(true)"
          />
          <q-radio
            val="false"
            label="Off"
            :modelValue="optsStore.darkMode.toString()"
            @update:modelValue="setDarkMode(false)"
          />
          <q-radio
            val="auto"
            label="Auto"
            :modelValue="optsStore.darkMode.toString()"
            @update:modelValue="setDarkMode('auto')"
          />
        </div>
      </div>
    </q-menu>
  </div>
</template>
