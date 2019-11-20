<template>
  <div>
    <mxm-markdown-view
      :text="contents"
      :simple="simple"
      :hide-empty="hideEmpty"
      :empty-message="emptyMessage"
      :edit-click="editClick"
      :edit-button="editButton || !editClick && editable"
      v-on:edit="openEdit"
    />

    <utl-dialog
      v-if="editable"
      size-style="width: 900px; max-width: 80vw"
      header-class="bg-white text-black"
      footer-class="bg-white text-black"
      :dialog-opened="editOpened"
      :title="editTitle + (anyMods ? ' *' : '')"
      submit-label="OK"
      :ok-to-submit="anyMods"
      :ok-to-dismiss="!anyMods"
      v-on:submit="saveEdit"
      v-on:dialogClosing="cancelEdit"
    >
      <q-input
        v-model.trim="contents"
        clearable
        class="bg-green-1"
        style="font-family:monospace"
        type="textarea"
        rows="10"
        cols="80"
        :max-height="500"
        hide-bottom-space
        autofocus @keyup.enter.stop
      />
    </utl-dialog>
  </div>
</template>

<script>
  import MxmMarkdownView from 'components/mxm-markdown-view'

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
        required: false,
        default: false
      },

      emptyMessage: {
        type: String,
        default: '(No description)'
      },

      editable: {
        type: Boolean,
        default: false
      },

      editTitle: {
        type: String,
        default: 'Description'
      },
    },

    components: {
      MxmMarkdownView,
    },

    data: () => ({
      contents: '',
      editOpened: false,
    }),

    computed: {
      anyMods() {
        return this.contents != this.text
      },
    },

    mounted() {
      this.contents = this.text
      this.editOpened = false
    },

    methods: {
      openEdit() {
        this.contents = this.text
        this.editOpened = true
      },

      saveEdit() {
        this.editOpened = false
        this.$emit('saveDescription', this.contents)
      },

      cancelEdit() {
        this.contents = this.text
        this.editOpened = false
      },
    },

    watch: {
      // needed because mxm-markdown-view uses updatable `contents`
      text(val) {
        this.contents = val
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
