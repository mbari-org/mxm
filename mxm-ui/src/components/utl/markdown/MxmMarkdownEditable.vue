<script setup lang="ts">
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'
import UtlDialog from 'components/utl/UtlDialog.vue'
import { computed, ref } from 'vue'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  title: '',
  startMarkdown: false,
  hideEmpty: false,
  editClick: false,
  editButton: false,
  simple: false,
  emptyMessage: '(No description)',
  editable: false,
  editTitle: 'Description',
})

const editOpened = ref(false)
const contents = ref(props.text)

function setContents() {
  contents.value = props.text || ''
}

const anyMods = computed(() => contents.value !== (props.text || ''))

function openEdit() {
  setContents()
  editOpened.value = true
}

const emit = defineEmits<{
  (e: 'saveDescription', v?: string): void
}>()

function saveEdit() {
  editOpened.value = false
  emit('saveDescription', contents.value)
}

function cancelEdit() {
  setContents()
  editOpened.value = false
}
</script>

<template>
  <div>
    <MxmMarkdownView
      :text="contents"
      :start-markdown="startMarkdown"
      :simple="simple"
      :hide-empty="hideEmpty"
      :empty-message="emptyMessage"
      :edit-click="editClick"
      :edit-button="editButton || (!editClick && editable)"
      @edit="openEdit"
    />

    <UtlDialog
      v-if="editable"
      size-style="width: 900px; max-width: 80vw"
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
        class="fieldBg"
        style="font-family: monospace"
        type="textarea"
        rows="10"
        cols="80"
        :max-height="500"
        hide-bottom-space
        autofocus
        @keyup.enter.stop
      />
    </UtlDialog>
  </div>
</template>
