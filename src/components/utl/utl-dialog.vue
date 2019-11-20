<template>
  <q-dialog
    :value="dialogOpened"
    :position="position"
    @input="val => {if (!val) $emit('dialogClosing')}"
    :no-backdrop-dismiss="!okToDismiss"
    :no-esc-dismiss="!okToDismiss"
  >
    <q-card
      :style="style"
      class="bg-white"
    >
      <q-toolbar :class="headerClass">
        <q-toolbar-title style="font-size:1.2em">
          {{ title }}
        </q-toolbar-title>
        <q-btn
          round dense size="sm"
          @click="$emit('dialogClosing')"
          icon="close"
        />
      </q-toolbar>

      <q-card-section>
        <slot></slot>
      </q-card-section>

      <q-toolbar :class="footerClass">
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

      position: {
        type: String,
        default: undefined
      },

      sizeStyle: {
        type: String,
        required: false
      },

      headerClass: {
        type: String,
        default: 'bg-secondary text-white'
      },

      footerClass: {
        type: String,
        default: 'bg-secondary text-white'
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

    computed: {
      style() {
        if (this.sizeStyle) {
          return this.sizeStyle
        }
      }
    },
  }
</script>
