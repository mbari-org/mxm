<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Plans" to="/plans" />
      <q-breadcrumbs-el label="Plan" :to="`/plans/${params.planId}`" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <div v-if="plan">
      <h5> Plan: {{plan.name}}
      </h5>
      <small>{{params.planId}}</small>

      <div>
        Description: {{ plan.description}}
      </div>

      <div>
        Tasks:
        <ul>
          <li v-for="task in plan.tasks" :key="task.taskId">
            <!-- Note: showing the associated taskDefId -->
            <router-link :to="`/plans/${plan.planId}/tasks/${task.taskId}`">
              {{task.taskDefId}}</router-link>

            <span v-if="task.arguments && task.arguments.length">
              ( {{task.arguments.length }} explicit arguments)
            </span>
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
