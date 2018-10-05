<template>
  <q-page class="q-pa-md">
    <h5> Apollo Test
    </h5>

    <pre>executor = {{executor}}</pre>

  </q-page>
</template>

<script>
import gql from 'graphql-tag'

import executors from '../graphql/executors.gql'

export default {
  data () {
    return {
      executor: {},
    }
  },

  apollo: {
    executor: executors
  }

}
</script>
