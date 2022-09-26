<script setup lang="ts">
import Markdown from 'vue3-markdown-it'

import { computed, ref } from 'vue'

interface Props {
  text?: string
  startMarkdown?: boolean
  hideEmpty?: boolean
  editClick?: boolean
  editButton?: boolean
  simple?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  startMarkdown: false,
  hideEmpty: false,
  editClick: false,
  editButton: false,
  simple: false,
  emptyMessage: '(No description)',
})

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const useMarkdown = ref(props.startMarkdown)

const stylePlain = computed(() => {
  const s = 'min-width:12em;min-height:4em;white-space:normal;'
  return (
    s + (props.text ? '' : 'color:gray;font-style:italic;font-size:smaller;')
  )
})

const styleMarkdown = computed(() => {
  const s = 'min-width:12em;'
  return (
    s + (props.text ? '' : 'color:gray;font-style:italic;font-size:smaller;')
  )
})
</script>

<template>
  <div v-if="text || !hideEmpty" @click="() => editClick && emit('edit')">
    <div style="width: 100%" class="row no-wrap items-start">
      <div style="vertical-align: top">
        <div :class="{ 'rounded-borders markdownBg': !simple }">
          <markdown
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
        v-if="editButton || (!simple && text)"
        style="width: 5px; vertical-align: top"
        class="q-ml-xs"
      >
        <div class="column">
          <q-btn
            v-if="editButton"
            class="text-grey"
            size="xs"
            dense
            icon="edit"
            @click="emit('edit')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!simple && text"
            class="text-grey q-mt-xs"
            size="xs"
            dense
            icon="fab fa-markdown"
            :color="
              useMarkdown ? ($q.dark.isActive ? 'brown-9' : 'brown-2') : ''
            "
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

<style>
@import url(https://fonts.googleapis.com/css?family=Merriweather:400,300);
</style>

<style>
.markdownText {
  white-space: normal !important;
  line-height: 1.5;
  font-family: 'Merriweather', 'Open Sans', 'Verdanda', Sans-Serif, serif;
  font-weight: 300;
}
</style>

<!-- https://divtable.com/table-styler/ -->
<style>
table.markdownTable {
  border: 1px solid #1c6ea4;
  /*width: 100%;*/
  text-align: left;
  border-collapse: collapse;
}
table.markdownTable td,
table.markdownTable th {
  border: 1px solid #aaaaaa;
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
  border-left: 2px solid #d0e4f5;
}
table.markdownTable thead th:first-child {
  border-left: none;
}
</style>
