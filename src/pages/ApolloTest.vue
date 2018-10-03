<template>
  <q-page class="q-pa-md">
    <h5> Apollo Test
    </h5>

    <pre>USER = {{USER}}</pre>

    <pre>DEPLOYMENT = {{DEPLOYMENT}}</pre>


  </q-page>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data () {
    return {
      USER: {},
      DEPLOYMENT: {},
    }
  },

  apollo: {
    USER: gql`
        {
          USER {
            EMAIL
            FIRSTNAME
            LASTNAME
          }
        }`,

    DEPLOYMENT: gql`
        {
          DEPLOYMENT {
            ENDEVENT_EVENTID_OID
            LAUNCHEVENT_EVENTID_OID
            NAME
            PATH
            RECOVEREVENT_EVENTID_OID
            STARTEVENT_EVENTID_OID
            VEHICLENAME
            VERSION
          }
        }
    `
  }

}
</script>
