<template>
  <div>
    <div
      v-if="text || !hideEmpty"
      :class="simple ? '' : 'round-borders bg-light-blue-1'"
    >
      <vue-markdown
        v-if="text"
        :source="text" table-class="markdownTable"
        :class="'white-space-normal ' + (simple ? '' : 'q-pa-sm')"
      />
      <div v-else style="color:gray;font-style:italic">
        {{emptyMessage}}
      </div>
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
        required: false,
        default: false
      },
      simple: {
        type: Boolean,
        required: false,
        default: false
      },
      emptyMessage: {
        type: String,
        required: false,
        default: '(no description)'
      },
    },
    components: {
      VueMarkdown,
    },
  }
</script>
