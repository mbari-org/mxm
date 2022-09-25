export default {
  findContainingLMapId(elm: HTMLElement | null): string {
    while (elm) {
      if (elm && elm.dataset && elm.dataset.lmapid) {
        return elm.dataset.lmapid
      } else {
        elm = elm.parentElement
      }
    }
    throw new Error('findContainingLMapId: no containing lmapid found')
  },
}
