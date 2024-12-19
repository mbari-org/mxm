<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  expandable?: boolean
  initExpanded?: boolean
  title?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  expandable: false,
  initExpanded: false,
  title: '',
  suffix: '',
})

const expanded = ref(props.initExpanded)
</script>

<template>
  <div>
    <q-expansion-item v-if="expandable" v-model="expanded" dense dense-toggle>
      <template v-slot:header>
        <q-item-section>
          <div class="row">
            <div class="text-bold">
              {{ title }}
            </div>
            <div v-if="!expanded" class="q-ml-md text-grey-7">
              {{ suffix }}
            </div>
          </div>
        </q-item-section>
      </template>
      <slot></slot>
    </q-expansion-item>

    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>
