<template>
  <div
    v-if="text || !hideEmpty"
    class="relative-position"
    @click="() => editClick && $emit('edit')"
  >
    <div :class="{'rounded-borders bg-light-blue-1': !simple}">
      <vue-markdown
        :source="text || emptyMessage"
        table-class="markdownTable"
        :class="'markdownText ' + (simple ? '' : 'q-pa-sm')"
        :style="text ? '' : 'color:gray;font-style:italic;font-size:smaller'"
      />
    </div>

    <q-btn
      v-if="editButton"
      class="absolute-right text-grey shadow-3"
      style="margin-right:4px;margin-top:-4px"
      size="xs" round dense icon="edit" color="yellow"
      @click="$emit('edit')"
    />

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
