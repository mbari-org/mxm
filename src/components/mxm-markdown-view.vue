<template>
  <div v-if="text || !hideEmpty">
    <div v-if="text" :class="{'rounded-borders bg-light-blue-1': !simple}">
      <vue-markdown
        :source="text" table-class="markdownTable"
        :class="'markdownText ' + (simple ? '' : 'q-pa-sm')"
      />
    </div>
    <div v-else style="color:gray;font-style:italic;font-size:smaller">
      {{emptyMessage}}
    </div>
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
      simple: {
        type: Boolean,
        required: false,
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
