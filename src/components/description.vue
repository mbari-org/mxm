<template>
  <div>
    <div v-if="text || !hideEmpty" class="round-borders q-pa-xs bg-green-1">
      <div v-if="text">
        <p v-for="(p, index) in text.split('\n')" :key="index"
           :class="index > 0 ? 'q-mt-md' : ''"
        >
          {{p}}
        </p>
      </div>
      <div v-else style="color:gray;font-style:italic">
        {{emptyMessage}}
      </div>
    </div>
  </div>
</template>

<script>
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
      emptyMessage: {
        type: String,
        required: false,
        default: '(no description)'
      },
    },
  }
</script>
