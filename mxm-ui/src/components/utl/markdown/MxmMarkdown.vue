<script setup lang="ts">
import MxmMarkdownEditable from 'components/utl/markdown/MxmMarkdownEditable.vue'
import UtlExpansion from 'components/utl/UtlExpansion.vue'

interface Props {
  expandable?: boolean
  initExpanded?: boolean
  expandableTitle?: string
  expandableLimit?: number
  expandableSubtitleLimit?: number
  text?: string
  startMarkdown?: boolean
  hideEmpty?: boolean
  editClick?: boolean
  editButton?: boolean
  simple?: boolean
  emptyMessage?: string
  editable?: boolean
  editTitle?: string
}

withDefaults(defineProps<Props>(), {
  expandable: false,
  initExpanded: false,
  expandableTitle: '',
  expandableLimit: 300,
  expandableSubtitleLimit: 300,
  text: '',
  startMarkdown: false,
  hideEmpty: false,
  editClick: false,
  editButton: false,
  simple: false,
  emptyMessage: '(No description)',
  editable: false,
  editTitle: 'Description',
})

const emit = defineEmits(['saveDescription'])
</script>

<template>
  <UtlExpansion
    :expandable="expandable && text && text.length > expandableLimit"
    :init-expanded="initExpanded"
    :title="expandableTitle"
    :suffix="text ? `${text.substring(0, expandableSubtitleLimit)} ...` : ''"
  >
    <MxmMarkdownEditable
      :text="text"
      :start-markdown="startMarkdown"
      :hide-empty="hideEmpty"
      :edit-click="editClick"
      :edit-button="editButton"
      :simple="simple"
      :empty-message="emptyMessage"
      :editable="editable"
      :edit-title="editTitle"
      @saveDescription="
        val => {
          emit('saveDescription', val)
        }
      "
    />
  </UtlExpansion>
</template>
