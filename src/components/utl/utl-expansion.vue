<template>
  <div>
    <q-expansion-item
      v-if="expandable"
      v-model="expanded"
      dense
      dense-toggle
    >
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

<script>
  export default {
    name: 'utl-dialog',

    props: {
      expandable: {
        type: Boolean,
        default: false
      },

      initExpanded: {
        type: Boolean,
        default: false
      },

      title: {
        type: String,
        default: ''
      },

      suffix: {
        type: String,
        default: ''
      },
    },

    data: () => ({
      expanded: false,
    }),

    mounted() {
      this.expanded = this.initExpanded
    },
  }
</script>
