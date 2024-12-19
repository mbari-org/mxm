<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  dialogOpened: boolean
  title: string
  position?: string
  sizeStyle?: string
  headerClass?: string
  footerClass?: string
  submitLabel?: string
  okToSubmit: boolean
  okToDismiss: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  sizeStyle: '',
  headerClass: 'bg-secondary text-white',
  footerClass: 'bg-secondary text-white',
  submitLabel: 'Submit',
  okToDismiss: false,
})

const style = computed(() => props.sizeStyle)

const emit = defineEmits<{
  (e: 'dialogClosing'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div>
    <q-dialog
      :modelValue="dialogOpened"
      :position="position"
      @update:modelValue="
        val => {
          if (!val) emit('dialogClosing')
        }
      "
      :no-backdrop-dismiss="!okToDismiss"
      :no-esc-dismiss="!okToDismiss"
    >
      <q-card :style="style">
        <q-toolbar :class="headerClass">
          <q-toolbar-title style="font-size: 1.2em">
            {{ title }}
          </q-toolbar-title>
          <q-btn
            round
            dense
            size="sm"
            @click="emit('dialogClosing')"
            icon="close"
          />
        </q-toolbar>

        <q-card-section>
          <slot></slot>
        </q-card-section>

        <q-toolbar :class="footerClass">
          <q-toolbar-title />
          <q-btn
            dense
            no-caps
            :color="okToSubmit ? 'secondary' : 'grey'"
            :label="submitLabel"
            :disable="!okToSubmit"
            @click="emit('submit')"
          />
        </q-toolbar>
      </q-card>
    </q-dialog>
  </div>
</template>
