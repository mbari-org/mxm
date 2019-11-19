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
      v-on:submit="submit"
      v-on:dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <q-field
          stack-label label="Name:"
          :label-width="4"
        >
          <q-input
            :error="!data.paramName.length"
            class="bg-light-blue-1"
            v-model.trim="data.paramName"
            type="text"
            autofocus hide-bottom-space
            style="width:24em"
          />
        </q-field>

        <div class="row justify-between">
          <q-field
            stack-label label="Type:"
            :label-width="4"
          >
            <parameter-type-select
              v-model="data.typeSelected"
            />
          </q-field>

          <q-toggle
            v-model="data.required"
            label="Required?"
            :label-width="4"
            :left-label="true"
          />
        </div>

        <q-field
          stack-label label="Default Value:"
          :label-width="4"
          :error="!!defaultValueError()"
          :error-message="defaultValueError()"
        >
          <parameter-value
            ref="parameter-value"
            class="q-pa-xs"
            style="font-family:monospace;width:24em"
            :param-type="data.typeSelected"
            :param-value="data.defaultValue"
          />

          <q-popup-edit
            v-if="data.typeSelected"
            buttons
            v-model="data.defaultValue"
          >
            <parameter-value-input
              :param-name="data.paramName"
              v-model="data.defaultValue"
              :param-type="data.typeSelected"
              default-value=""
              editable
            />
          </q-popup-edit>
        </q-field>

        <q-field
          stack-label label="Description:"
          :label-width="4"
        >
          <mxm-markdown
            class="bg-light-blue-1"
            style="min-height:4em;width:24em"
            :text="data.description"
            editable
            v-on:saveDescription="d => { data.description = d }"
          />
        </q-field>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import parameterInsert from '../graphql/parameterInsert.gql'
  import MxmMarkdown from 'components/mxm-markdown'
  import ParameterValue from 'components/parameter-value'
  import ParameterValueInput from 'components/parameter-value-input'
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
    description: '',
  }

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },

      missionTplId: {
        type: String,
        required: true
      }
    },

    components: {
      MxmMarkdown,
      ParameterValue,
      ParameterValueInput,
      ParameterTypeSelect,
    },

    data: () => ({
      data: cloneDeep(initialData),
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
        this.dialogOpened = true
      },

      defaultValueError() {
        const parval = this.$refs['parameter-value']
        return parval && parval.errorMessage()
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          missionTplId: this.missionTplId,
          paramName: this.data.paramName,
          type: this.data.typeSelected,
          required: this.data.required,
          defaultValue: this.data.defaultValue,
          description: this.data.description,
        }
        if (debug) console.debug('variables=', variables)

        const mutation = parameterInsert
        this.$apollo.mutate({mutation, variables})
          .then(data => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Parameter created',
              timeout: 1000,
              type: 'info'
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
