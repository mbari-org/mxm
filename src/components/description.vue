<template>
  <div class="round-borders q-pa-xs bg-green-1">
    <p v-for="(p, index) in text.split('\n')" :key="index"
       :class="index > 0 ? 'q-mt-md' : ''"
    >
      {{p}}
    </p>
  </div>
</template>

<script>
  export default {
    props: {
      text: {
        type: String,
        required: true
      }
    },
  }
</script>
