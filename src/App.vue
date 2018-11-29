<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

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
