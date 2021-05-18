
/**
 * Permet de rajouter la navigation tactile pour le carousel
 */
class carouselTouchPlugin{


    /**
     * 
     * @param {Carousel} carousel 
     */
    constructor(carousel){
        carousel.container.addEventListener('dragstart', e => e.preventDefault())
        carousel.container.addEventListener('mousedown', this.startDrag.bind(this))
        carousel.container.addEventListener('touchstart', this.startDrag.bind(this))
        window.addEventListener('mousemove', this.drag.bind(this))
        window.addEventListener('touchmove', this.drag.bind(this))
        window.addEventListener('mouseup', this.endDrag.bind(this))
        window.addEventListener('touchend', this.endDrag.bind(this))
        window.addEventListener('touchcancel', this.endDrag.bind(this))
        this.carousel = carousel


    }

    /**
     * Démarre le déplacement au touché
     * @param {mouseEvent|TouchEvent} e 
     */
    startDrag(e){
        if(e.touches){
            if(e.touches.length > 1){
                return
            }else{
                e =  e.touches[0]
            }

        }

        this.origin = {x: e.screenX, y: e.screenY}
        this.width = this.carousel.containerWidth
        this.carousel.disableTransition
        
    }

    /**
     * Démarre le déplacement 
     * @param {mouseEvent|TouchEvent} e 
     */
    drag(e){
        if(this.origin){
            let point = e.touches ? e.touches[0] : e
            let translate = {x: point.screenX - this.origin.x, y: point.screenY - this.origin.y}
            let baseTranslate = this.carousel.currentItem * -100 / this.carousel.items.length
            
            // empecher le scroll sur l'ipad 
            if(e.touches && Math.abs(translate.x) > Math.abs(translate.y)){
                e.preventDefault()
                e.stopPropagation()
            }
            this.carousel.translate(baseTranslate + 100 * translate.x / this.width)
            this.lastTranslate = translate
        }
    }
     /**
     * Fin du déplacement 
     * @param {mouseEvent|TouchEvent} e 
     */
    endDrag(e){
        if(this.origin && this.lastTranslate){
            this.carousel.enableTransition
            if(Math.abs(this.lastTranslate.x / this.carousel.carouselWidth) > 0.2){
                if(this.lastTranslate.x < 0){
                    this.carousel.next()
                }else{
                    this.carousel.prev()
                }
            }
        }else{
            this.carousel.goTo(this.carousel.currentItem)
        }
        this.origin = null
    }
}

class Carousel{

    /**
     * @callback moveCallback
     * @param {number} index
     */

    /**
     *
     * @param {HTMLElement} element
     * @param {Object} options
     * @param {Object} [options.slidesToScroll = 1] Nombre d'éléments à faire défiller
     * @param {Object} [options.slidesVisible = 1] Nombre d'éléments visible dans un slide
     * @param {boolean} [options.loop = false] doit-on boucler en fin de carousel
     * @param {boolean} [options.infinite = false] doit-on boucler a l'infini
     * @param {boolean} [options.pagination = false]
     * @param {boolean} [options.navigation = false]
     */
    constructor(element, options = {}){
        this.element= element
        this.options = Object.assign({}, {
            slidesToScroll:  1,
            slidesVisible: 1,
            loop: false,
            pagination: false,
            navigation: false,
            infinite: false
        }, options)
        if(this.options.loop && this.options.infinite){
            console.error("un carousel ne peut pas etre à la fois en boucle et en infinie")
        }

        let children = [].slice.call(element.children)
        this.isMobile = false
        this.currentItem = 0
        this.moveCallback = []
        this.offset = 0
        // Modification du DOM
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel_container')
        this.root.setAttribute('tabindex', 0)
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map(child => {
            let item =this.createDivWithClass('carousel_item')
            item.appendChild(child)
            return item
        })
        if(this.options.infinite){
            this.offset = this.options.slidesVisible + this.options.slidesToScroll
            if( this.offset > children.length){
                console.error("Vous n'avez pas assez d'élèments dans le carousel", element)
            }
            this.items = [
                ...this.items.slice(this.items.length - this.offset).map( item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, this.offset).map( item => item.cloneNode(true))

            ]
            this.goTo(this.offset, false)

        }
        this.items.forEach( item => this.container.appendChild(item) )


        this.setStyle()
        if(this.options.navigation){
        this.createNavigation()
        }
        if(this.options.pagination){
        this.createPagination()
        }

        // Evenements
        this.moveCallback.forEach( cb => cb(this.currentItem))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => {
            if(e.key === 'ArrowRight'){
                this.next()
            }else if(e.key === 'ArrowLeft'){
                this.prev()
            }
        })
        if(this.options.infinite){
            this.container.addEventListener('transitionend', this.resetInfinite.bind(this))
        }

        new carouselTouchPlugin(this)


    }

    /**
     * Applique les boones dimensions aux élements du carousel
     */
    setStyle(){
        let ratio = this.items.length / this.slidesVisible
        this.container.style.width = (ratio * 100) + '%'
        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible)) / ratio +  '%' )
    }

    /**
     *
     */
    createNavigation(){
        let nextButton = this.createDivWithClass('carousel_next')
        let prevButton = this.createDivWithClass('carousel_prev')
        let iconNext = document.createElement('i')
        iconNext.classList.add('fa')
        iconNext.classList.add('fa-arrow-circle-right')
        let iconPrev = document.createElement('i')
        iconPrev.classList.add('fa')
        iconPrev.classList.add('fa-arrow-circle-left')
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.appendChild(iconNext)
        prevButton.appendChild(iconPrev)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))

        if(this.options.loop === true){
            return
        }
        this.onMove(index => {
            if(index === 0){
                prevButton.classList.add('carousel_prev--hidden')
            }else{
                prevButton.classList.remove('carousel_prev--hidden')

            }
            if(this.items[this.currentItem + this.slidesVisible] === undefined){
                nextButton.classList.add('carousel_next--hidden')
            }else{
                nextButton.classList.remove('carousel_next--hidden')
            }
        })


    }

    /**
     *  Crée la pagination dans le DOM
     */
    createPagination(){
        let pagination = this.createDivWithClass('carousel_pagination')
        this.root.appendChild(pagination)
        let buttons = []
        for( let i = 0; i < (this.items.length - (2 * this.offset)); i = i + this.options.slidesToScroll){
            let button = this.createDivWithClass('carousel_pagination_button')
            pagination.appendChild(button)
            button.addEventListener('click', () => this.goTo(i + this.offset))
            buttons.push(button)
        }
        this.onMove(index => {
            let count = this.items.length - (2 * this.offset)
            let activeButton = buttons[Math.floor(((index - this.offset) % count) / this.options.slidesToScroll)]
            if(activeButton){
                buttons.forEach( button => {button.classList.remove('carousel_pagination_button--active')})
                activeButton.classList.add('carousel_pagination_button--active')
            }
        })
    }

    next(){
        this.goTo(this.currentItem + this.slidesToScroll)

    }
    prev(){
        this.goTo(this.currentItem - this.slidesToScroll)
    }

    /**
     *  Déplace le carousel vers l'élement ciblé
     * @param {number} index
     * @param {boolean} [ animation = true]
     */
    goTo(index, animation = true){
        if( index < 0) {
            if(this.options.loop){
            index = this.items.length - this.slidesVisible
            }else{
                return
            }
        }else if( index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem)){
            if(this.options.loop){
            index = 0
            }else{
                return
            }
        }
        let translateX = index * -100 / this.items.length
        if(animation === false){
        this.disableTransition
        }
        this.translate(translateX)
        this.container.offsetHeight  //Forcer Repaint
        if(animation === false){
        this.enableTransition
        }
        this.currentItem = index
        this.moveCallback.forEach( cb => cb(index))

    }

    /**
     * Déplace le container pour donner l'impression d'un slide à l'infini
     */
    resetInfinite(){
        if(this.currentItem <= this.options.slidesToScroll){
            this.goTo(this.currentItem + (this.items.length - 2 * this.offset), false)
        }else if(this.currentItem >= (this.items.length - this.offset)){
            this.goTo(this.currentItem - (this.items.length - 2 * this.offset), false)
        }
    }
    /**
     *
     * @param {moveCallback} cb
     */
    onMove(cb){
        this.moveCallback.push(cb)
    }

    onWindowResize(){
        let mobile = window.innerWidth < 800
        if(mobile !== this.isMobile){
            this.isMobile = mobile
            this.setStyle()
            this.moveCallback.forEach( cb => cb(this.currentItem))
        }
    }
    /**
     *
     * @param classNam
     * @returns {HTMLDivElement}
     */
    createDivWithClass(classNam){
        let div = document.createElement('div')
        div.classList.add(classNam)
        return div
    }
    translate(percent){
        this.container.style.transform = 'translate3d(' + percent + '%,0,0)'
    }

    /**
     *
     * @returns {number}
     */
    get slidesToScroll(){
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    /**
     *
     * @returns {number}
     */
    get slidesVisible(){
        return this.isMobile ? 1 : this.options.slidesVisible
    }

    get disableTransition(){
        this.container.style.transition = 'none'
    }
    get enableTransition(){
        this.container.style.transition = ''
    }
    /**
     * @return {number}
     */
    get containerWidth(){
        return this.container.offsetWidth
    }
    /**
     * @return {number}
     */
    get carouselWidth(){
        return this.root.offsetWidth
    }



}
// document.addEventListener('DOMContentLoaded', function(){
//     new Carousel(document.querySelector('#carousel1'), {
//         slidesToScroll: 3,
//         slidesVisible: 3
//     })
//     console.log('test')
//
// })
    new Carousel(document.querySelector('#carousel1'), {
        slidesToScroll: 1,
        slidesVisible: 2,
        loop: true,
        navigation: true,
        pagination: true
    })
    new Carousel(document.querySelector('#carousel2'), {
        slidesToScroll: 1,
        slidesVisible: 3,
        infinite: true,
        navigation: true,
        pagination: true
    })
    new Carousel(document.querySelector('#carousel3'), {
        slidesToScroll: 1,
        slidesVisible: 1,
        navigation: true,
        pagination: true
    })



