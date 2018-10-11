<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Plans" to="/plans"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshPlans"
      />
    </q-breadcrumbs>

    <q-table
      title="Plans"
      :data="allPlansList"
      :columns="columns"
      row-key="name"
    >
      <div slot="top-right" slot-scope="props" class="fit">
        <plan-new-button v-on:created="planCreated"/>
      </div>

      <q-td slot="body-cell-name" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/plans/${encodeURIComponent(props.row.planId)}`">
          {{props.row.name}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import PlanNewButton from 'components/plan-new-button'
  import allPlansList from '../graphql/plans.gql'

  const debug = false

  export default {
    components: {
      PlanNewButton
    },

    data() {
      return {
        allPlansList: [],
        columns: [
          {
            field: 'name',
            name: 'name',
            label: 'Name',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          }
        ]
      }
    },

    apollo: {
      allPlansList,
    },

    mounted() {
      this.refreshPlans()
    },

    methods: {
      refreshPlans() {
        this.$apollo.queries.allPlansList.refetch()
      },

      planCreated(data) {
        this.refreshPlans()
      }
    },

    watch: {
      allPlansList(val) {
        if (debug) console.log('watch allPlansList=', val)
      }
    }
  }
</script>
