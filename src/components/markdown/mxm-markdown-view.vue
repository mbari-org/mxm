<template>
  <div
    v-if="text || !hideEmpty"
    @click="() => editClick && $emit('edit')"
  >
    <div style="width:100%" class="row no-wrap items-start">
      <div style="vertical-align:top">
        <div :class="{'rounded-borders bg-light-blue-1': !simple}">
          <vue-markdown
            v-if="useMarkdown"
            :source="text || emptyMessage"
            :breaks="false"
            table-class="markdownTable"
            :class="'markdownText ' + (simple ? '' : 'q-pa-sm')"
            :style="styleMarkdown"
          />
          <div
            v-else
            v-text="text || emptyMessage"
            :class="'markdownText ' + (simple ? '' : 'q-pa-sm')"
            :style="stylePlain"
          />
        </div>
      </div>

      <div
        v-if="editButton || !simple && text"
        style="width:5px;vertical-align:top"
        class="q-ml-xs"
      >
        <div class="column">
          <q-btn
            v-if="editButton"
            class="text-grey"
            size="xs" dense icon="edit"
            color="white"
            @click="$emit('edit')"
          />

          <q-btn
            v-if="!simple && text"
            class="text-grey q-mt-xs"
            size="xs" dense icon="fab fa-markdown"
            :color="useMarkdown ? 'yellow-2' : 'white'"
            @click.stop="useMarkdown = !useMarkdown"
          >
            <q-tooltip>Toggle markdown</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script>
  import VueMarkdown from 'vue-markdown'

  export default {
    props: {
      text: {
        type: String,
        required: false
      },

      startMarkdown: {
        type: Boolean,
        default: false
      },

      hideEmpty: {
        type: Boolean,
        default: false
      },

      editClick: {
        type: Boolean,
        default: false
      },

      editButton: {
        type: Boolean,
        default: false
      },

      simple: {
        type: Boolean,
        default: false
      },

      emptyMessage: {
        type: String,
        default: '(No description)'
      },
    },

    components: {
      VueMarkdown,
    },

    data: () => ({
      useMarkdown: false,
    }),

    mounted() {
      this.useMarkdown = this.startMarkdown
    },

    computed: {
      stylePlain() {
        const s = 'min-width:12em;min-height:4em;white-space:normal;'
        return s + (this.text ? '' : 'color:gray;font-style:italic;font-size:smaller;')
      },

      styleMarkdown() {
        const s = 'min-width:12em;'
        return s + (this.text ? '' : 'color:gray;font-style:italic;font-size:smaller;')
      },
    },
  }
</script>

<style>
  @import url(https://fonts.googleapis.com/css?family=Merriweather:400,300)
</style>

<style>
  .markdownText {
    white-space: normal !important;
    line-height: 1.5;
    font-family: "Merriweather","Open Sans","Verdanda",Sans-Serif;
    font-weight: 300;
  }
</style>

<!-- https://divtable.com/table-styler/ -->
<style>
  table.markdownTable {
    border: 1px solid #1C6EA4;
    /*width: 100%;*/
    text-align: left;
    border-collapse: collapse;
  }
  table.markdownTable td, table.markdownTable th {
    border: 1px solid #AAAAAA;
    padding: 3px 8px;
  }
  table.markdownTable tbody td {
    font-size: 13px;
  }
  table.markdownTable thead {
    /*background: #cfe2ff;*/
  }
  table.markdownTable thead th {
    font-size: 14px;
    border-left: 2px solid #D0E4F5;
  }
  table.markdownTable thead th:first-child {
    border-left: none;
  }
</style>
