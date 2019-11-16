<template>
  <div>
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
