import L from 'leaflet'
import { GeoJSON } from 'geojson'

const debug = true //window.location.search.match(/.*debug=(-|.*\bdraw\b).*/)

export default class QDrawMan {
  lmap: L.Map
  drawFeatureGroup: L.FeatureGroup
  drawControl: L.Control.Draw | null = null

  entryEdited: object | null = null

  constructor(lmap: L.Map) {
    this.lmap = lmap
    this.drawFeatureGroup = L.featureGroup()

    lmap.on(L.Draw.Event.CREATED, e => {
      if (debug) console.warn('L.Draw.Event.CREATED', e)
      this.drawFeatureGroup.addLayer(e.layer)
    })

    lmap.on(L.Draw.Event.DELETED, e => {
      e.layers.eachLayer(layer => {
        if (debug) console.warn('L.Draw.Event.DELETED layer=', layer)
        this.drawFeatureGroup.removeLayer(layer)
      })
    })

    lmap.on(L.Draw.Event.DRAWSTART, e => {
      if (debug) console.warn('L.Draw.Event.DRAWSTART', e)
    })

    lmap.on(L.Draw.Event.DRAWSTOP, e => {
      if (debug) console.warn('L.Draw.Event.DRAWSTOP', e)
    })

    lmap.on(L.Draw.Event.DRAWVERTEX, e => {
      if (debug) console.warn('L.Draw.Event.DRAWVERTEX', e)
    })

    lmap.on(L.Draw.Event.EDITSTART, e => {
      if (debug) console.warn('L.Draw.Event.EDITSTART', e)
    })

    lmap.on(L.Draw.Event.EDITMOVE, e => {
      if (debug) console.warn('L.Draw.Event.EDITMOVE', e)
    })

    lmap.on(L.Draw.Event.EDITRESIZE, e => {
      if (debug) console.warn('L.Draw.Event.EDITRESIZE', e)
    })

    lmap.on(L.Draw.Event.EDITVERTEX, e => {
      if (debug) console.warn('L.Draw.Event.EDITVERTEX', e)
    })

    lmap.on(L.Draw.Event.EDITSTOP, e => {
      if (debug) console.warn('L.Draw.Event.EDITSTOP', e)
    })
  }

  isEditing() {
    return !!this.drawControl
  }

  startEditing(entry: object | null) {
    const prevEntry = this.entryEdited

    this.endEditing()

    if (entry) {
      this.entryEdited = entry
      this.addLayersToDraw(this.entryEdited)
    }

    this.drawControl = createDrawControl(this.drawFeatureGroup, entry)
    this.lmap.addControl(this.drawControl)

    return prevEntry
  }

  drawGroupToGeoJSON(): GeoJSON {
    const layers = []
    this.drawFeatureGroup.eachLayer(layer => {
      if (debug) console.debug('drawGroupToGeoJSON', 'layer=', layer)
      if (layer.getRadius) {
        const radius = layer.getRadius()
        const coordinates = L.GeoJSON.latLngToCoords(layer.getLatLng())
        layers.push(
          L.geoJSON({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates,
            },
            properties: {
              radius,
            },
          })
        )
      } else {
        layers.push(layer)
      }
    })
    this.drawFeatureGroup.clearLayers()
    return new L.FeatureGroup(layers).toGeoJSON()
  }

  addLayersToDraw(entry: object) {
    if (debug) console.warn('addLayersToDraw: entry=', entry)

    const entryLayer = geometryToLayer(entry, entry.geometry)
    this.addNonGroupLayers(entryLayer)
  }

  // https://gis.stackexchange.com/a/203773
  addNonGroupLayers(sourceLayer: L.Layer) {
    // console.warn('addNonGroupLayers: sourceLayer=', sourceLayer)
    if (sourceLayer instanceof L.LayerGroup) {
      sourceLayer.eachLayer(layer => {
        this.addNonGroupLayers(layer)
      })
    } else {
      this.drawFeatureGroup.addLayer(sourceLayer)
      sourceLayer.addTo(this.lmap)
    }
  }

  endEditing(): { entryEdited: object | null; geometry: GeoJSON } | null {
    if (this.drawControl) {
      this.lmap.removeControl(this.drawControl)
      this.drawControl = null
    }
    let ret = null
    if (this.entryEdited) {
      const geometry = this.drawGroupToGeoJSON()
      ret = { entryEdited: this.entryEdited, geometry }
      this.entryEdited = null
    }
    return ret
  }
}

function createDrawControl(featureGroup: L.FeatureGroup, entry: object | null) {
  if (debug) console.log('createDrawControl: entry=', entry)
  const color = (entry && entry.color) || '#ff0000'

  const edit = {
    featureGroup,
    edit: {
      selectedPathOptions: {
        maintainColor: true,
        fillOpacity: 0.3,
      },
      moveMarkers: true, // centroids, default: false
      shapeOptions: {
        color: '#ff0000',
      },
    },
    poly: {
      allowIntersection: false,
      showArea: true,
    },
    remove: true,
  }

  const repeatMode = true
  const draw = {
    circle: {
      shapeOptions: {
        color,
        weight: 4,
      },
      showArea: true,
    },

    circlemarker: {
      shapeOptions: {
        weight: 4,
      },
      repeatMode,
    },

    marker: {
      repeatMode,
    },

    rectangle: {
      shapeOptions: {
        color,
        weight: 4,
      },
      showArea: true,
    },

    polyline: {
      shapeOptions: {
        color,
        weight: 4,
      },
    },

    polygon: {
      allowIntersection: false, // Restrict shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
      },
      shapeOptions: {
        color,
      },
      showArea: true,
    },
  }

  const options = {
    position: 'topleft',
    edit,
    draw,
  }

  return new L.Control.Draw(options)
}

function geometryToLayer(entry: object, geometry: object): L.Layer {
  switch (geometry.type) {
    case 'FeatureCollection': {
      // L.GeoJSON.geometryToLayer does not support FeatureCollection
      // but supports Feature:
      const layers = []
      geometry.features.forEach(feature => {
        const layer = geometryToLayer(entry, feature)
        if (layer) {
          layers.push(layer)
        }
      })
      return new L.FeatureGroup(layers)
    }

    default:
      return L.GeoJSON.geometryToLayer(geometry, entry.options)
  }
}
