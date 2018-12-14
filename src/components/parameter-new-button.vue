<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:700px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Add Parameter
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Name:"
            :error="!paramName.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="paramName"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Type:"
            :error="!type.length"
            :label-width="4"
          >
            <q-select
              class="bg-light-blue-1"
              style="width:12em"
              v-model="type"
              :options="typeOptions"
              @input="val => {$emit('input', val)}"
              placeholder="Select type"
            />
          </q-field>

          <q-field
            label="Default Value:"
            :label-width="4"
          >
            <div
              class="bg-green-1 q-pa-xs"
              style="width:24em;font-family:monospace"
            >
              {{defaultValue}}&nbsp;
            </div>

            <q-popup-edit
              v-if="type.length"
              buttons
              v-model="defaultValue"
              @show="popupEditVisible = true"
              @hide="() => { popupEditVisible = false }"
              @close="() => { popupEditVisible = false }"
              @cancel="() => { popupEditVisible = false }"
              @save="() => { popupEditVisible = false }"
            >
              <parameter-value-input
                v-if="popupEditVisible"
                :param-name="paramName"
                v-model="defaultValue"
                :param-type="type"
                :default-value="''"
              />
            </q-popup-edit>
          </q-field>

          <q-field
            label="Required?"
            :label-width="4"
            :warning="required"
          >
            <q-checkbox
              v-model="required"
              :left-label="true"
            />
          </q-field>

          <q-field
            label="Description:"
            :label-width="4"
          >
            <pxs-markdown :text="description"
                          style="width:24em"
            />
            <q-popup-edit
              v-model="description"
              title="Description"
              buttons
            >
              <q-field>
                <q-input
                  style="width:30em"
                  v-model.trim="description"
                  clearable
                  class="bg-green-1"
                  type="textarea"
                  rows="5"
                  :max-height="300"
                />
              </q-field>
            </q-popup-edit>
          </q-field>

        </div>

        <q-toolbar slot="footer" color="flat">
          <q-toolbar-title/>
          <q-btn dense
                 :color="okToSubmit ? 'primary' : 'light'"
                 @click="submit"
                 label="Submit"
                 :disable="!okToSubmit"
          />
        </q-toolbar>
      </q-modal-layout>
    </q-modal>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

  </div>
</template>

<script>
  import parameterInsert from '../graphql/parameterInsert.gql'
  import PxsMarkdown from 'components/pxs-markdown'
  import ParameterValueInput from 'components/parameter-value-input'

  const debug = false

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
      PxsMarkdown,
      ParameterValueInput,
    },

    data() {
      return {
        dialogOpened: false,
        paramName: '',
        type: '',
        required: true,
        defaultValue: '',
        description: '',
        popupEditVisible: false,
      }
    },

    computed: {
      types() {
        return [
          'float', 'integer', 'boolean', 'string',
          'Point', 'MultiPoint', 'Polygon',
        ]
      },

      typeOptions() {
        return _.map(this.types, t => ({
          label: t,
          value: t
        }))
      },

      okToSubmit() {
        return this.paramName && this.type
      }
    },

    methods: {
      openDialog() {
        this.paramName = ''
        this.type = ''
        this.required = true
        this.defaultValue = null
        this.description = null
        this.popupEditVisible = false
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          missionTplId: this.missionTplId,
          paramName: this.paramName,
          type: this.type,
          required: this.required,
          defaultValue: this.defaultValue,
          description: this.description,
        }
        if (debug) console.debug('variables=', variables)

        const mutation = parameterInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Parameter created',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },
    }
  }
</script>
