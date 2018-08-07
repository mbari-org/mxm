import axios from 'axios'

const axiosInstance = axios.create({
  // baseURL: 'http://odss-test.shore.mbari.org:???/pxs/api'
  baseURL: 'http://localhost:5050/api'
})

export default ({ Vue }) => {
  Vue.prototype.$axios = axiosInstance
}
