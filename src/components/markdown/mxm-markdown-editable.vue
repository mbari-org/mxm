<template>
  <div>
    <mxm-markdown-view
      :text="contents"
      :start-markdown="startMarkdown"
      :simple="simple"
      :hide-empty="hideEmpty"
      :empty-message="emptyMessage"
      :edit-click="editClick"
      :edit-button="editButton || !editClick && editable"
      @edit="openEdit"
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
      @submit="saveEdit"
      @dialogClosing="cancelEdit"
    >
      <q-input
        v-model="contents"
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
  import MxmMarkdownView from 'components/markdown/mxm-markdown-view'

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
        return this.contents !== (this.text || '')
      },
    },

    mounted() {
      this.setContents()
      this.editOpened = false
    },

    methods: {
      setContents() {
        this.contents = this.text || ''
      },

      openEdit() {
        this.setContents()
        this.editOpened = true
      },

      saveEdit() {
        this.editOpened = false
        this.$emit('saveDescription', this.contents)
      },

      cancelEdit() {
        this.setContents()
        this.editOpened = false
      },
    },

    watch: {
      // needed because mxm-markdown-view uses updatable `contents`
      text() {
        this.setContents()
      },
    },
  }
</script>
