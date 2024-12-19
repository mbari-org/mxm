import { boot } from 'quasar/wrappers'
import { ref, Ref } from 'vue'
import { QVueGlobals } from 'quasar'

const debug = window.location.search.match(/.*debug=.*\bexc\b.*/)

interface Utl {
  routeLoc: typeof routeLoc
  push: (loc: string[]) => void
  replace: (loc: string[]) => void
  ticker: Ref<Date>
  getAgo: typeof getAgo
  cloneDeep: (obj: object) => object
  exceptionHelper: typeof exceptionHelper
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    utl: Utl
  }
}

export default boot(({ app, router }) => {
  const ticker = ref(new Date())

  setInterval(() => {
    ticker.value = new Date()
  }, 3000)

  const utl = {
    routeLoc,

    push(loc: string[]) {
      router.push(routeLoc(loc))
    },

    replace(loc: string[]) {
      router.replace(routeLoc(loc))
    },

    ticker,
    getAgo,

    cloneDeep(obj: object) {
      return JSON.parse(JSON.stringify(obj))
    },

    exceptionHelper,
  }

  app.provide('utl', utl)
  app.config.globalProperties.utl = utl
})

function routeLoc(loc: string[]) {
  return '/' + loc.map(encodeURIComponent).join('/')
}

function getAgo(date: Date, baseDate: Date) {
  const elapsedMs = date.getTime() - baseDate.getTime()
  // prefix with "+" if the date is in the future:
  const prefix = elapsedMs > 0 ? '+' : ''
  return getAgoWithElapsedMs(elapsedMs, prefix)
}

function getAgoWithElapsedMs(elapsedMs: number, prefix: string) {
  const ms = Math.abs(elapsedMs)

  const seconds = ms / 1000.0
  if (seconds <= 99) {
    return prefix + Math.round(seconds) + 's'
  }
  const minutes = seconds / 60.0

  if (minutes <= 99) {
    return prefix + Math.round(minutes) + 'm'
  }
  const hoursF = minutes / 60.0

  const hours = Math.floor(hoursF)
  if (hours <= 24) {
    const remMins = Math.floor((hoursF - hours) * 60.0)
    return prefix + hours + 'h' + (remMins > 0 ? ':' + remMins + 'm' : '')
  }
  if (hours <= 72) {
    return prefix + Math.round(hours) + 'h'
  }
  const daysF = hours / 24.0

  const days = Math.floor(daysF)
  if (days <= 99) {
    const remHours = Math.floor((daysF - days) * 24.0)
    return prefix + days + 'd' + (remHours > 0 ? ':' + remHours + 'h' : '')
  }
  const months = daysF / 30.0
  if (months <= 24) {
    return prefix + Math.round(months) + 'M'
  }
  const years = Math.round(daysF / 365.0)
  return prefix + years + 'y'
}

function exceptionHelper($q: QVueGlobals, error: object) {
  if (debug)
    console.debug('exceptionHelper: error=', JSON.stringify(error, null, 2))

  const escape = (text: string): string =>
    text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\n<br/>')

  const providerFailure = error?.message ?? ''
  let message, caption
  if (providerFailure.startsWith('MxmException:')) {
    message = 'MXM server detected a problem'
    caption = escape(providerFailure.substring('MxmException:'.length))
  } else {
    message = 'Unexpected failure'
    const text = escape(error?.message ?? error?.toString() ?? 'Unknown error')
    caption = `
        Unexpected failure:
        <br/><br/>
        ${text}
        <br/><br/>
        Please try again later.
        If the problem persists, please contact the MXM administrator.
        `
  }
  $q.notify({
    message,
    caption,
    html: true,
    position: 'top',
    timeout: 0,
    closeBtn: 'Close',
    type: 'warning',
  })
}
