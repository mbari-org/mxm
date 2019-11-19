<template>
  <div>
    {{ _showValue }}
  </div>
</template>

<script>
  const debug = true

  export default {
    props: {
      paramType: {
        type: String,
        required: false
      },

      paramValue: {
        type: String,
        default: true
      },

      required: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      _error() {
        if (this.paramValue) {
          const lcType = this.paramType.toLowerCase()
          switch (lcType) {
            case 'integer':
              return checkInteger(this.paramValue)

            case 'float':
              return checkFloat(this.paramValue)

            case 'boolean':
              return checkBoolean(this.paramValue)

            case 'point':
              return checkPoint(this.paramValue)
          }
        }
        else if (this.required) {
          return 'A value is required'
        }
      },

      _showValue() {
        if (this.paramValue) {
          return this.paramValue
        }
        else if (this.required) {
          return '??'
        }
        else {
          return ''
        }
      },
    },

    methods: {
      errorMessage() {
        return this._error
      },
    },
  }

  function checkInteger(value) {
    if (!value.match(/^-?\d+$/)) {
      return 'Invalid integer'
    }
  }

  function checkFloat(value) {
    if (!value.match(/^-?\d*(\.\d+)?$/)) {
      return 'Invalid float'
    }
  }

  function checkBoolean(value) {
    if (!value.match(/^(true|false)$/)) {
      return 'Invalid boolean'
    }
  }

  function checkPoint(value) {
    try {
      const json = JSON.parse(value)
      if (!Array.isArray(json)) {
        return 'point syntax error'
      }
      if (json.length < 2 || json.length > 3) {
        return `2 or 3 elements expected`
      }
    }
    catch (err) {
      return err
    }
    if (!value.match(/^(true|false)$/)) {
      return 'Invalid boolean'
    }
  }
</script>

