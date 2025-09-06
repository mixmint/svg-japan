import { isObject, isElement, extend, hasProp, logger } from './_utils.js'
import { attributes, drawData } from './_prefectures.js'
import { Defaults, Regions } from './_defaults.js'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

class svgJapan {
    constructor( ...args ) {
        if ( args[0] && isObject( args[0] ) ) {
            this.opts = extend( Defaults, args[0] )
        } else {
            this.opts = Defaults
        }
        this.svg_atts = attributes
        this.svg_data = drawData
        this.regions  = Regions
        this.map_container = null

        this.init()

        return this
    }

    init() {
        if ( hasProp( 'element', this.opts ) ) {
            let targetElm = document.querySelector( this.opts.element )
            if ( targetElm ) {
                this.map_container = targetElm
            } else {
                logger('The container element does not exist.')
                return false
            }
        } else {
            this.map_container = document.createElement('div')
        }
        if ( this.map_container && isElement( this.map_container ) ) {
            this.map_container.classList.add('svg-japan-container')
        }

        this.curX = 0
        this.curY = 0

        // Assign Event
        this.svgJapanEvent = new MouseEvent( 'svgmap.click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0
        } )

        this.createMap().then(() => {
            // logger( 'SVG-map initialization completed successfully.', 'info' )
        })
    }

    async createMap() {
        const map = await this._drawMap()
        const self = this

        Array.prototype.forEach.call(map.querySelectorAll('path'), (prefecture) => {
            prefecture.style.cursor = 'pointer'

            // MOUSEOUT
            prefecture.addEventListener('mouseout', (evt) => {
                const target = evt.target
                if (['outline1', 'outline2'].includes(target.id)) return

                const rId = parseInt(target.getAttribute('data-region'), 10)

                if (self.opts.regionality) {
                    Array.prototype.forEach.call(target.parentNode.childNodes, (elm) => {
                        if (parseInt(elm.getAttribute('data-region'), 10) === rId) {
                            elm.setAttributeNS(null, 'fill', elm.getAttribute('data-default'))
                        }
                    })
                }

                target.setAttributeNS(null, 'fill', target.getAttribute('data-default'))

                // IE11-safe remove class
                if (target.classList) {
                    target.classList.remove('active')
                } else {
                    let _cls = target.getAttribute('class').split(' ')
                    if (_cls.includes('active')) {
                        _cls = _cls.filter((v) => v !== 'active')
                        target.setAttribute('class', _cls.join(' '))
                    }
                }

                self.showTips()
            }, false)

            // MOUSEOVER
            prefecture.addEventListener('mouseover', (evt) => {
                const target = evt.target
                if (['outline1', 'outline2'].includes(target.id)) return

                const cId = parseInt(target.id.replace('pref-', ''), 10)
                const rId = parseInt(target.getAttribute('data-region'), 10)
                const hoverColor = self.opts.activeColor || '#D70035'

                if (target.classList) {
                    target.classList.add('active')
                } else {
                    let _cls = target.getAttribute('class').split(' ')
                    if (!_cls.includes('active')) _cls.push('active')
                    target.setAttribute('class', _cls.join(' '))
                }

                target.setAttributeNS(null, 'fill', hoverColor)

                if (self.opts.regionality) {
                    Array.prototype.forEach.call(target.parentNode.childNodes, (elm) => {
                        const elmPrefId = parseInt(elm.id.replace('pref-', ''), 10)
                        if (parseInt(elm.getAttribute('data-region'), 10) === rId && elmPrefId !== cId) {
                            let regionObj = self.regions.find((r) => r.id === rId)
                            let activeRegionColor = regionObj ? regionObj.active : null

                            if (self.opts.regions && self.opts.regions.length > 0) {
                                let _rg = null
                                for (let i = 0; i < self.opts.regions.length; i++) {
                                    if (self.opts.regions[i].id === rId) {
                                        _rg = self.opts.regions[i]
                                        break
                                    }
                                }
                                if (_rg && hasProp('active', _rg)) {
                                    activeRegionColor = _rg.active
                                }
                            }

                            if (activeRegionColor) elm.setAttributeNS(null, 'fill', activeRegionColor)
                        }
                    })
                }

                self.showTips()
            }, false)

            // CLICK
            prefecture.addEventListener('click', (evt) => {
                const target = evt.target
                if (['outline1', 'outline2'].includes(target.id)) {
                    return
                }

                const prefId = parseInt(target.id.replace('pref-', ''), 10)
                let linkData = null

                if (self.opts.prefLinks && self.opts.prefLinks[prefId]) {
                    linkData = self.opts.prefLinks[prefId]
                } else if (self.opts.autoLinker) {
                    let prefEntry = Object.entries(self.svg_data).find(([key, val]) => val.id === prefId)
                    let key       = prefEntry[0]
                    let prefData  = prefEntry[1]
                    const slug    = key.toLowerCase().replace(/\s+/g, '-')
                    const baseUrl = self.opts.autoLinkBaseUrl || '/'
                    linkData      = { url: `${baseUrl.replace(/\/$/, '')}/${slug}`, target: "_self" }
                }

                if (linkData) {
                    self._openPrefLink(linkData)
                } else if (typeof self.opts.onPrefClick === "function") {
                    self.opts.onPrefClick({
                        id: prefId,
                        name: self.svg_data[prefId].name,
                        region: parseInt(target.getAttribute('data-region'), 10)
                    })
                }
            })
        })
    }

    _drawMap() {
        return new Promise((resolve) => {
            const svgElm = document.createElementNS(SVG_NAMESPACE, 'svg'),
                  mapType = [ 'full', 'dense', 'deform' ].includes( this.opts.type.toLowerCase() ) ? this.opts.type.toLowerCase() : 'full',
                  regionList = this.opts.regions || this.regions
            svgElm.setAttributeNS(null, 'version', '1.1')
            svgElm.setAttribute('xmlns', SVG_NAMESPACE)
            svgElm.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            svgElm.setAttribute('id', `svg-japan-${mapType}`)
            svgElm.setAttributeNS(null, 'x', '0px')
            svgElm.setAttributeNS(null, 'y', '0px')
            svgElm.setAttributeNS(null, 'viewBox', this.svg_atts.viewBox[mapType])
            svgElm.setAttributeNS(null, 'enable-background', this.svg_atts.enableBackground[mapType])
            svgElm.setAttribute('xml:space', 'preserve')
            Object.keys(this.svg_data).forEach((key) => {
                let pathElm = document.createElementNS(SVG_NAMESPACE, 'path'),
                    regionId   = 0,
                    fillColor  = this.opts.uniformly && this.opts.uniformColor !== '' ? this.opts.uniformColor : this.svg_data[key].color[0],// The default is the individual color of each prefecture
                    _cr = regionList.find( ({ prefs }) => prefs.includes( this.svg_data[key].id ) )

                if ( _cr ) {
                    regionId = _cr.id
                }
                if ( this.opts.regionality && ! this.opts.uniformly ) {
                    let _tr = regionList.find( ({ id }) => id === regionId )
                    fillColor = _tr ? _tr.color : fillColor
                }
                if ( this.opts.prefColors && Object.keys(this.opts.prefColors).length > 0 ) {
                    if ( Object.keys(this.opts.prefColors).includes( key ) ) {
                        fillColor = this.opts.prefColors[key]
                    }
                }

                pathElm.setAttributeNS(null, 'id', `pref-${this.svg_data[key].id}`)
                pathElm.setAttributeNS(null, 'data-region', regionId)
                pathElm.setAttributeNS(null, 'data-name', this.svg_data[key].name)
                pathElm.setAttributeNS(null, 'data-default', fillColor)
                pathElm.setAttributeNS(null, 'fill', fillColor)
                pathElm.setAttributeNS(null, 'stroke', 'none')
                pathElm.setAttributeNS(null, 'd', this.svg_data[key][mapType])
                if ( pathElm.classList ) {
                    pathElm.classList.add('prefecture-map')
                } else {
                    // For ie11
                    pathElm.setAttribute('class', 'prefecture-map')
                }

                svgElm.appendChild(pathElm)
            })
            let strokeLayer = document.createElementNS(SVG_NAMESPACE, 'g')

            strokeLayer.setAttributeNS(null, 'id', 'strokes')
            if ( this.opts.stroked ) {
                // draw outlines
                Object.keys(this.svg_atts.strokes).forEach((key) => {
                    if ( [ 'outline1', 'outline2' ].includes(key) ) {
                        let linePath = document.createElementNS(SVG_NAMESPACE, 'path'),
                            lineWidth = this.svg_atts.strokes[key].strokeWidth

                        if ( this.svg_atts.strokes[key].path[mapType] !== '' ) {
                            linePath.setAttributeNS(null, 'id', key)
                            linePath.setAttributeNS(null, 'fill', this.opts.strokeColor || this.svg_atts.strokes[key].stroke)
                            linePath.setAttributeNS(null, 'stroke', this.opts.strokeColor || this.svg_atts.strokes[key].stroke)
                            linePath.setAttributeNS(null, 'stroke-width', mapType === 'deform' ? 4.5 : lineWidth)
                            linePath.setAttributeNS(null, 'd', this.svg_atts.strokes[key].path[mapType])
                            strokeLayer.appendChild(linePath)
                        }
                    }
                })
            }
            if ( 'dense' === mapType ) {
                // draw divider
                let divPath = document.createElementNS(SVG_NAMESPACE, 'polyline')

                divPath.setAttributeNS(null, 'id', 'divider')
                divPath.setAttributeNS(null, 'fill', 'none')
                divPath.setAttributeNS(null, 'stroke', this.svg_atts.strokes.divider.stroke)
                divPath.setAttributeNS(null, 'stroke-width', this.svg_atts.strokes.divider.strokeWidth)
                divPath.setAttributeNS(null, 'points', this.svg_atts.strokes.divider.points[mapType])
                strokeLayer.appendChild(divPath)
            }
            if ( strokeLayer.hasChildNodes() ) {
                if ( svgElm.prepend ) {
                    svgElm.prepend(strokeLayer)
                } else {
                    svgElm.insertBefore(strokeLayer, svgElm.childNodes[0])
                }
            }
            svgElm.style.position = 'relative'

            svgElm.addEventListener('mousemove', (evt) => {
                this.curX = evt.clientX
                this.curY = evt.clientY

                const tips = document.getElementById('svg-japan-tips')
                if (tips) {
                    tips.style.left = `${this.curX + 10}px`
                    tips.style.top  = `${this.curY + 10}px`
                }
            }, false)

            if ( this.opts.height ) {
                this.map_container.style.height = this.opts.height
            }
            if ( this.opts.width ) {
                this.map_container.style.width = this.opts.width
            }
            if ( ! this.opts.height && ! this.opts.width ) {
                this.map_container.style.height = '90vh'
            }
            this.map_container.appendChild(svgElm)
            resolve(svgElm)
        })
    }

    _openPrefLink(linkData) {
        let url, target, rel
        if (typeof linkData === "string") {
            url    = linkData
            target = "_self"
        } else {
            url    = linkData.url
            target = linkData.target || "_self"
            rel    = linkData.rel || null
        }

        const allowedTargets = ["_self", "_blank", "_parent", "_top"]
        if (!allowedTargets.includes(target)) {
            target = "_self"
        }

        const allowedRels = ["alternate","author","bookmark","external","help","license","me","next","nofollow","noopener","noreferrer","prefetch","prev","search","sponsored","tag","ugc"]
        if (rel && !allowedRels.includes(rel)) {
            rel = null
        }

        if (target === "_blank" && !rel) {
            rel = "noopener noreferrer"
        }

        const finalUrl = new URL(url, window.location.href).href
        const a        = document.createElement("a")
        a.href         = finalUrl
        a.target       = target

        if (rel) {
            a.rel = rel
        }

        a.style.display = "none"
        document.body.appendChild(a)

        a.click()
        document.body.removeChild(a)
    }

    showTips() {
        if (!this.opts.withTips) return

        const _activePath = this.map_container.querySelector('path.active')
        if (!_activePath) {
            const targetTips = document.getElementById('svg-japan-tips')
            if (targetTips) targetTips.remove()
            return
        }

        const activePref = {
            region: parseInt(_activePath.getAttribute('data-region'), 10),
            name: _activePath.getAttribute('data-name'),
            default: _activePath.getAttribute('data-default')
        }

        let contents = []

        if (this.opts.regionality) {
            const regionList = this.opts.regions || this.regions
            const _match = regionList.find(({ id }) => id === activePref.region)
            if (_match) contents.push(`<span class="region-name">${_match.name}</span>`)
        }

        if (activePref.name) contents.push(`<span class="prefecture-name">${activePref.name}</span>`)

        let tips = document.getElementById('svg-japan-tips')
        if (!tips) {
            tips = document.createElement('div')
            tips.id = 'svg-japan-tips'
            tips.classList.add('svg-map-tips')
            tips.style.position = 'fixed'
            tips.style.pointerEvents = 'none'
            document.body.appendChild(tips)
        }

        tips.innerHTML = contents.join("\n")
        tips.style.visibility = 'visible'
    }


    selectedMap( element ) {
        element.dispatchEvent( this.svgJapanEvent )
    }

}

export default svgJapan
