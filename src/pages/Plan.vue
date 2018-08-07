<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Plans" to="/plans" />
      <q-breadcrumbs-el label="Plan" :to="`/plans/${params.planId}`" />
    </q-breadcrumbs>

    <div v-if="plan">
      <h5> Plan: {{plan.name}}
        <q-btn
          dense flat icon="refresh" @click="refresh"
        />
      </h5>
      <small>{{params.planId}}</small>

      <div>
        Description: {{ plan.description}}
      </div>

      <div>
        Tasks:
        <ul>
          <li v-for="taskId in plan.taskIds" :key="taskId">
            <router-link
              :to="`/plans/${plan.planId}/tasks/${taskId}`"
            >
              {{taskId}}
            </router-link>
          </li>
        </ul>
      </div>

    </div>

    <div v-else-if="!loading">
      Plan not found: {{params.planId}}
    </div>
  </q-page>
</template>

<script>
import lodash from 'lodash'
const _ = lodash

export default {
  data () {
    return {
      loading: false,
      plan: null,
      join: _.join
    }
  },

  computed: {
    params () {
      return this.$route.params
    }
  },

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
      this.loading = true
      this.plan = null
      const url = `/plans/${this.params.planId}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          this.loading = false
          console.log(`GET ${url}: response=`, response)
          this.plan = response.data || {}
        })
        .catch(e => {
          this.loading = false
          console.error(e)
        })
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    }
  }
}
</script>
