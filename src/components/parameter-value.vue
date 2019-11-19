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
        default: ''
      },

      required: {
        type: Boolean,
        default: false
      },
    },

    computed: {
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
        return this.$mxmVal && this.$mxmVal.checkValue(this.paramValue, this.paramType, this.required)
      },
    },
  }

</script>

