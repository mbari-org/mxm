<template>
  <div>
    <q-layout
      view="lhh LpR lff"
      container
      :style="sizeInfo.containerStyle"
      class="shadow-2 rounded-borders"
    >
      <q-header reveal class="bg-primary glossy">
        <q-toolbar>
          <q-btn flat round dense icon="menu" />
          <q-toolbar-title>{{ label }}</q-toolbar-title>
          <q-btn flat round dense icon="menu" />
        </q-toolbar>
      </q-header>

      <div style="height:50px">filler</div>
      <qgeomap
        ref="qgeomap"
        debug-feature="right"
        :google-api-key="$mxmConfig.googleApiKey"
        :editable="editable"
        @startEditing="_startEditing"
        @editsApplied="_editsApplied"
        @warning="_showWarning"
        include-table
        :style="sizeInfo.qgeomapStyle"
      />
    </q-layout>

<!--    <span style="word-break:break-all;font-size:0.7em">{{valueString}}</span>-->
  </div>
</template>

<script>
  import map from 'lodash/map'

  const debug = true

  export default {
    props: {
      label: {
        type: String,
        required: false
      },

      paramName: {
        type: String,
        required: true
      },

      paramType: {
        type: String,
        default: 'Point'
      },

      value: {
        type: String,
        required: false
      },

      editable: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      entry_id() {
        return this.paramName
      },

      sizeInfo() {
        return this.editable ? {
          containerStyle: 'height:600px;width:700px',
          qgeomapStyle: 'height:600px;width:700px',
        } : {
          containerStyle: 'max-width:400px',
          qgeomapStyle: 'height:350px;width:350px',
        }
      },
    },

    data () {
      return {
        valueString: ''
      }
    },

    mounted() {
      if (debug) console.log(`MOUNTED geojson-input
      paramName=${this.paramName}
      paramType=${this.paramType}
      value=${this.value}
      editable=${this.editable}
      `)

      this.$nextTick(() => {
        this._setFeatureData(this.value)
      })
    },

    methods: {
      _setFeatureData(value) {
        const qgeomap = this.$refs.qgeomap

        this.valueString = value && value.trim() || ''
        const entry_id = this.entry_id
        const geometry = this.$mxmVal.toGeojson(this.paramType, this.valueString)

        const entry = {
          entry_id,
          geometry,
          color: 'cyan',
          tooltip: entry_id,
        }

        qgeomap.addEntry(entry)
        this.$nextTick(() => {
          if (this.editable) {
            qgeomap.selectEntry(entry_id)
            qgeomap.editEntry(entry_id)
          }
          else {
            qgeomap.zoomToAll()
          }
        })
      },

      _startEditing(selectedEntry) {
        console.log(`_startEditing: selectedEntry=`, selectedEntry)
        if (!selectedEntry) {
          // TODO any further action here?
        }
        // Else: qgeomap already taking care of the edit.
      },

      _editsApplied(entryEdited) {
        // console.log(`_editsApplied: entryEdited=`, entryEdited)
        this._updateValueString(entryEdited.geometry)
      },

      _updateValueString(geometry) {
        this.valueString = this.$mxmVal.fromGeojson(this.paramType, geometry)
        console.debug(`_updateValueString emiting '${this.valueString}'`)
        this.$emit('input', this.valueString)
      },

      _showWarning(message) {
        console.warn('WARN:', message)
        this.$q.notify({
          message,
          position: 'top',
          color: 'warning',
          textColor: 'black',
          timeout: 1500,
        })
      },
    },
  }
</script>
