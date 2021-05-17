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
     */
    constructor(element, options = {}){
        this.element= element
        this.options = Object.assign({}, {
            slidesToScroll:  1,
            slidesVisible: 1,
            loop: false
        }, options)
        let children = [].slice.call(element.children)
        this.isMobile = false
        this.currentItem = 0
        this.moveCallback = []

        // Modification du DOM
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel_container')
        this.root.setAttribute('tabindex', 0)
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map(child => {
            let item =this.createDivWithClass('carousel_item')
            item.appendChild(child)
            this.container.appendChild(item)
            return item
        })
        this.setStyle()
        this.createNavigation()

        // Evenements
        this.moveCallback.forEach( cb => cb(0))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => {
            if(e.key === 'ArrowRight'){
                this.next()
            }else if(e.key === 'ArrowLeft'){
                this.prev()
            }
        })



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

    next(){
        this.goTo(this.currentItem + this.slidesToScroll)

    }
    prev(){
        this.goTo(this.currentItem - this.slidesToScroll)
    }

    /**
     *  Déplace le carousel vers l'élement ciblé
     * @param {number} index
     */
    goTo(index){
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
        this.container.style.transform = 'translate3d(' + translateX + '%,0,0)'
        this.currentItem = index
        this.moveCallback.forEach( cb => cb(index))

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
        slidesToScroll: 3,
        slidesVisible: 3,
        loop: true
    })
    new Carousel(document.querySelector('#carousel2'), {
        slidesToScroll: 2,
        slidesVisible: 2
    })
    new Carousel(document.querySelector('#carousel3'), {
        slidesToScroll: 1,
        slidesVisible: 1
    })



