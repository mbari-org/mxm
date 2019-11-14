<template>
  <q-dialog
    :value="dialogOpened"
    @input="val => {if (!val) $emit('dialogClosing')}"
    :no-backdrop-dismiss="!okToDismiss"
    :no-esc-dismiss="!okToDismiss"
  >
    <q-card
      class="bg-white"
    >
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>
        <q-btn
          round dense
          color="primary"
          @click="$emit('dialogClosing')"
          icon="close"
        />
      </q-toolbar>

      <q-card-section>
        <slot></slot>
      </q-card-section>

      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title/>
        <q-btn
          dense no-caps
          :color="okToSubmit ? 'secondary' : 'grey'"
          :label="submitLabel"
          :disable="!okToSubmit"
          @click="$emit('submit')"
        />
      </q-toolbar>
    </q-card>
  </q-dialog>
</template>

<script>
  export default {
    name: 'utl-dialog',

    props: {
      dialogOpened: {
        type: Boolean,
        required: true
      },

      title: {
        type: String,
        required: true
      },

      submitLabel: {
        type: String,
        default: 'Submit'
      },

      okToSubmit: {
        type: Boolean,
        required: true
      },

      okToDismiss: {
        type: Boolean,
        default: false
      },
    },
  }
</script>
