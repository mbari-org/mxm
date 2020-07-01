<template>
  <utl-expansion
    :expandable="expandable && text && text.length > expandableLimit"
    :init-expanded="initExpanded"
    :title="expandableTitle"
    :suffix="text ? `${text.substring(0, expandableSubtitleLimit)} ...` : ''"
  >
    <mxm-markdown-editable
      :text="text"
      :start-markdown="startMarkdown"
      :hide-empty="hideEmpty"
      :edit-click="editClick"
      :edit-button="editButton"
      :simple="simple"
      :empty-message="emptyMessage"
      :editable="editable"
      :edit-title="editTitle"
      @saveDescription="val => { $emit('saveDescription', val) }"
    />
  </utl-expansion>
</template>

<script>
  import MxmMarkdownEditable from 'components/markdown/mxm-markdown-editable'

  export default {
    props: {
      expandable: {
        type: Boolean,
        default: false
      },

      initExpanded: {
        type: Boolean,
        default: false
      },

      expandableTitle: {
        type: String,
        default: ''
      },

      expandableLimit: {
        type: Number,
        default: 300
      },

      expandableSubtitleLimit: {
        type: Number,
        default: 120
      },

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
      MxmMarkdownEditable,
    },
  }
</script>
