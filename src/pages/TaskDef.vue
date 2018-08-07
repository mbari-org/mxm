<template>
  <q-page padding>
    <h5> TaskDef: {{taskDefId}}</h5>
  </q-page>
</template>

<script>
// import lodash from 'lodash'
// const _ = lodash

export default {
  data () {
    return {
    }
  },

  computed: {
    taskDefId () {
      return this.$route.params.taskDefId
    }
  },

  mounted () {
    this.getTaskDef()
  },

  methods: {
    getTaskDef () {
      const url = `/executors/${this.executorId}/taskDefs/${this.taskDefId}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
