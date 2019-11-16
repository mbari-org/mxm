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
            <q-select
              :error="!data.typeSelected"
              :label-width="4"
              bottom-slots
              class="bg-light-blue-1"
              style="width:12em"
              v-model="data.typeSelected"
              :options="typeOptions"
              @input="val => {$emit('input', val)}"
              hide-bottom-space
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
        >
          <div
            class="bg-light-blue-1 q-pa-xs"
            style="width:24em;font-family:monospace"
          >
            {{ data.defaultValue }}&nbsp;
          </div>

          <q-popup-edit
            v-if="data.typeSelected"
            buttons
            v-model="data.defaultValue"
            @show="popupEditVisible = true"
            @hide="() => { popupEditVisible = false }"
          >
            <parameter-value-input
              v-if="popupEditVisible"
              :param-name="data.paramName"
              v-model="data.defaultValue"
              :param-type="data.typeSelected.value"
              :default-value="''"
            />
          </q-popup-edit>
        </q-field>

        <q-field
          stack-label label="Description:"
          :label-width="4"
        >
          <mxm-markdown
            class="bg-light-blue-1"
            :text="data.description"
            style="width:24em"
          />
          <q-popup-edit
            v-model="data.description"
            title="Description"
            buttons persistent
          >
            <q-input
              style="width:30em; font-family:monospace"
              v-model.trim="data.description"
              clearable
              class="bg-light-blue-1 q-pl-md q-pr-md"
              type="textarea"
              rows="5"
              :max-height="300"
              autofocus @keyup.enter.stop
            />
          </q-popup-edit>
        </q-field>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import parameterInsert from '../graphql/parameterInsert.gql'
  import MxmMarkdown from 'components/mxm-markdown'
  import ParameterValueInput from 'components/parameter-value-input'
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
      ParameterValueInput,
    },

    data: () => ({
      data: cloneDeep(initialData),
      dialogOpened: false,
      popupEditVisible: false,
    }),

    computed: {
      types() {
        return [
          'float', 'integer', 'boolean', 'string',
          'Point', 'MultiPoint', 'LineString', 'Polygon',
        ]
      },

      typeOptions() {
        return map(this.types, t => ({
          label: t,
          value: t
        }))
      },

      okToSubmit() {
        return this.data.paramName && this.data.typeSelected
      },

      okToDismiss() {
        return isEqual(this.data, initialData)
      },
    },

    methods: {
      openDialog() {
        this.data = cloneDeep(initialData)
        this.popupEditVisible = false
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          missionTplId: this.missionTplId,
          paramName: this.data.paramName,
          type: this.data.typeSelected.value,
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
