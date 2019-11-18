<template>
  <div
    :class="classes"
  >
    {{ showValue }}
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

      checkRequired: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      error() {
        if (this.paramValue) {
          const lcType = this.paramType.toLowerCase()
          switch (lcType) {
            case 'integer': {
              if (!this.paramValue.match(/^-?\d+$/)) {
                return 'Invalid integer'
              }
              break
            }

            case 'float': {
              if (!this.paramValue.match(/^-?\d*(\.\d+)?$/)) {
                return 'Invalid float'
              }
              break
            }

            case 'boolean': {
              if (!this.paramValue.match(/^(true|false)$/)) {
                return 'Invalid boolean'
              }
              break
            }
          }
        }
        else if (this.checkRequired) {
          return 'A value is required'
        }
      },

      showValue() {
        if (this.paramValue) {
          return this.paramValue
        }
        else if (this.error) {
          return '??'
        }
        else {
          return ''
        }
      },

      classes() {
        return `bg-light-blue-1${this.error ? ' text-red' : ''}`
      },
    },

    methods: {
      errorMessage() {
        return this.error
      },
    },
  }
</script>
