<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

    <utl-dialog
      :dialog-opened="dialogOpened"
      title="Add Parameter"
      position="top"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-md"
      >
        <div :class="{'text-red': !data.paramName.length}">
          Name:
          <q-input
            dense hide-bottom-space
            class="bg-light-blue-1"
            v-model.trim="data.paramName"
            type="text"
            autofocus hide-bottom-space
            style="width:24em"
          />
        </div>

        <div class="row justify-between items-center">
          <div :class="{'text-red': !data.typeSelected}">
            Type:
            <parameter-type-select
              v-model="data.typeSelected"
            />
          </div>

          <q-checkbox
            v-if="$mxmVal.isNumericType(data.typeSelected)"
            label="Units?"
            v-model="withUnits"
          />
        </div>

        <q-checkbox
          label="Required?"
          v-model="data.required"
        />

        <div>
          <q-field
            stack-label label="Default Value:"
            :label-width="4"
            :error="!!defaultValueError()"
            :error-message="defaultValueError()"
            hide-bottom-space
          >
            <parameter-value
              ref="parameter-value"
              class="q-pa-xs"
              style="font-family:monospace;width:24em"
              label="Default value:"
              :param-name="data.paramName"
              :param-type="data.typeSelected"
              :param-value="data.defaultValue"
              editable
              @save="val => { data.defaultValue = val }"
            />
          </q-field>

          <q-input
            v-if="$mxmVal.isNumericType(data.typeSelected) && withUnits"
            prefix="Units:"
            dense hide-bottom-space
            type="text"
            v-model.trim="defaultUnits"
            :error="!defaultUnits"
            class="q-ml-xl bg-light-blue-1"
            style="height:2.2em; width:12em"
          />
        </div>

        <q-field
          stack-label label="Description:"
          :label-width="4"
          hide-bottom-space
        >
          <mxm-markdown
            expandable
            class="bg-light-blue-1"
            style="min-height:4em;width:24em"
            :text="data.description"
            editable edit-click
            @saveDescription="d => { data.description = d }"
          />
        </q-field>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import parameterInsertGql from '../graphql/parameterInsert.gql'

  import ParameterValue from 'components/parameter-value'
  import ParameterTypeSelect from 'components/parameter-type-select'

  import map from 'lodash/map'
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'

  const debug = false

  const initialData = {
    paramName: '',
    typeSelected: null,
    required: true,
    defaultValue: '',
    description: null,
  }

  export default {
    props: {
      providerId: {
        type: String,
        required: true
      },

      missionTplId: {
        type: String,
        required: true
      }
    },

    components: {
      ParameterValue,
      ParameterTypeSelect,
    },

    data: () => ({
      data: cloneDeep(initialData),
      withUnits: false,
      defaultUnits: '',
      dialogOpened: false,
    }),

    computed: {
      okToSubmit() {
        return this.data.paramName && this.data.typeSelected
            && !this.defaultValueError()
      },

      okToDismiss() {
        return isEqual(this.data, initialData)
      },
    },

    methods: {
      openDialog() {
        this.data = cloneDeep(initialData)
        this.withUnits = false
        this.defaultUnits = ''
        this.dialogOpened = true
      },

      defaultValueError() {
        const parval = this.$refs['parameter-value']
        return parval && parval.errorMessage()
      },

      submit() {
        const variables = {
          providerId: this.providerId,
          missionTplId: this.missionTplId,
          paramName: this.data.paramName,
          type: this.data.typeSelected,
          required: this.data.required,
          defaultValue: this.data.defaultValue,
          description: this.data.description,
        }
        if (this.withUnits) {
          variables.defaultUnits = this.defaultUnits
        }
        if (debug) console.debug('variables=', variables)

        const mutation = parameterInsertGql
        this.$apollo.mutate({mutation, variables})
          .then(data => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Parameter created',
              timeout: 1000,
              position: 'top',
              color: 'info',
            })
            this.$emit('created', variables)
          })
          .catch(error => {
            console.error('mutation error=', error)
          })
      },
    }
  }
</script>
