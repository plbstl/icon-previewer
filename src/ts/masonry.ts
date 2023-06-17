// Copied and refactored from https://github.com/Spope/MiniMasonry.js (MIT)

/**
 * CHANGES
 *
 * - No more FPS throttle when window is resizing
 */

interface MasonryConfig {
  /**
   * Target width of elements.
   * @default 255
   */
  baseWidth?: number
  /**
   * Container's selector or element.
   */
  container: string | HTMLElement
  /**
   * Width / height of gutter between elements. Use gutterX / gutterY to set different values.
   * @default 10
   */
  gutter?: number
  /**
   * Width of gutter between elements. Need `gutterY` to work, fallback to {@linkcode MasonryConfig.gutter}.
   */
  gutterX?: number
  /**
   * Height of gutter between elements. Need `gutterX` to work, fallback to {@linkcode MasonryConfig.gutter}.
   */
  gutterY?: number
  /**
   * Whether or not Masonry places elements on the shortest column or keeps exact order of the list.
   * @default true
   */
  minify?: boolean
  /**
   * Set left gutter on first columns and right gutter on last.
   * @default true
   */
  surroundingGutter?: boolean
  /**
   * Gutter applied when only 1 column can be displayed.
   * @default 5
   */
  ultimateGutter?: number
  /**
   * Sorting direction, `ltr` or `rtl`.
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl'
  /**
   * False will start to sort from center, true will start from left or right according to direction parameter.
   * @default false
   */
  wedge?: boolean
}

type ContainerChildren = HTMLCollectionOf<HTMLElement>

/**
 * Masonry will add a `resize` event listener on the `window` to redraw the masonry on window resize.
 *
 * You should have a container **relatively positioned** with your elements as children. Those children elements must be **absolutely positioned**.
 *
 * @example
 * ```html
 * <!-- HTML -->
 * <div class="cards" style="position: relative">
 *  <div class="card card1" style="position: absolute">...</div>
 *  <div class="card card2" style="position: absolute">...</div>
 *  <div class="card card3" style="position: absolute">...</div>
 * </div>
 * ```
 *
 * @example
 * // JavaScript
 * import Masonry from "masonry";
 * const masonry = new Masonry({
 *  container: '.cards'
 * });
 * masonry.layout(); // trigger first re-layout
 */
class Masonry {
  private _sizes: number[] = []
  private _columns: number[] = []
  private _width = 0
  private _config: Required<Omit<MasonryConfig, 'gutter'>> //=1
  private _container: HTMLElement //=2
  private _currentGutterX: number //=3
  private _currentGutterY: number //=4
  private _columnCount: number //=5

  constructor(config: MasonryConfig) {
    const defaultGutter = 10
    const options: Required<MasonryConfig> = {
      baseWidth: 255,
      gutter: defaultGutter,
      minify: true,
      ultimateGutter: 5,
      surroundingGutter: true,
      direction: 'ltr',
      wedge: false,
      gutterX: config.gutterX ? config.gutterX : config.gutter ? config.gutter : defaultGutter,
      gutterY: config.gutterY ? config.gutterY : config.gutter ? config.gutter : defaultGutter,
      ...config,
    }

    const container =
      typeof config.container == 'object' && config.container.nodeName
        ? config.container
        : typeof config.container == 'string'
        ? document.querySelector<HTMLElement>(config.container)
        : null

    if (!container) {
      throw new Error('Container not found or missing')
    }

    this._config = options //=1
    this._container = container //=2
    this._currentGutterX = options.gutterX //=3
    this._currentGutterY = options.gutterY //=4
    this._columnCount = this._getColumnCount() //=5

    window.addEventListener('resize', this._onResize)
    this.layout()
  }

  /**
   * Trigger a re-layout of the masonry.
   */
  public layout = (): void => {
    this._reset()

    // Computing columns count
    if (!this._columnCount) {
      this._columnCount = this._getColumnCount()
    }

    // Computing columns width
    let colWidth = this._computeColumnWidth()

    // Computing columns
    for (let i = 0; i < this._columnCount; i++) {
      this._columns[i] = 0
    }

    // Saving children real heights
    const children = this._container.children as ContainerChildren
    for (let i = 0; i < children.length; i++) {
      // Set colWidth before retrieving element height if content is proportional
      children[i].style.width = `${colWidth}px`
      this._sizes[i] = children[i].clientHeight
    }

    let startX: number
    if (this._config.direction == 'ltr') {
      startX = this._config.surroundingGutter ? this._currentGutterX : 0
    } else {
      startX = this._width - (this._config.surroundingGutter ? this._currentGutterX : 0)
    }

    if (this._columnCount > this._sizes.length) {
      // If more columns than children
      const occupiedSpace = this._sizes.length * (colWidth + this._currentGutterX) - this._currentGutterX
      if (this._config.wedge) {
        if (this._config.direction === 'ltr') {
          //
        } else {
          startX = this._width - this._currentGutterX
        }
      } else {
        if (this._config.direction === 'ltr') {
          startX = (this._width - occupiedSpace) / 2
        } else {
          startX = this._width - (this._width - occupiedSpace) / 2
        }
      }
    }

    // Computing position of children
    for (let index = 0; index < children.length; index++) {
      const nextColumn = this._config.minify ? this._getShortestColumn() : this._getNextColumn(index)

      let childrenGutter = 0
      if (this._config.surroundingGutter || nextColumn != this._columns.length) {
        childrenGutter = this._currentGutterX
      }

      let x: number
      if (this._config.direction == 'ltr') {
        x = startX + (colWidth + childrenGutter) * nextColumn
      } else {
        x = startX - (colWidth + childrenGutter) * nextColumn - colWidth
      }

      let y = this._columns[nextColumn]

      children[index].style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`

      this._columns[nextColumn] +=
        this._sizes[index] + (this._columnCount > 1 ? this._config.gutterY : this._config.ultimateGutter) //margin-bottom
    }

    this._container.style.height = `${this._columns[this._getLongestColumn()] - this._currentGutterY}px`
  }

  /**
   * Remove the resize listener and set back container as it was before initialization.
   */
  public destroy = (): void => {
    if (typeof this._removeListener == 'function') {
      this._removeListener()
    }

    const children = this._container.children as ContainerChildren
    for (let i = 0; i < children.length; i++) {
      children[i].style.removeProperty('width')
      children[i].style.removeProperty('transform')
    }

    this._container.style.removeProperty('height')
    this._container.style.removeProperty('min-width')
  }

  private _removeListener = (): void => {
    window.removeEventListener('resize', this._onResize)
  }

  private _reset = (): void => {
    this._sizes = []
    this._columns = []
    this._columnCount = 0
    this._width = this._container.clientWidth
    let minWidth = this._config.baseWidth

    if (this._width < minWidth) {
      this._width = minWidth
      this._container.style.minWidth = `${minWidth}px`
    }

    if (this._getColumnCount() === 1) {
      // Set ultimate gutter when only one column is displayed
      this._currentGutterX = this._config.ultimateGutter
      // As gutters are reduced, two column may fit, forcing to 1
      this._columnCount = 1
    } else if (this._width < this._config.baseWidth + 2 * this._currentGutterX) {
      // Remove gutter when screen is too low
      this._currentGutterX = 0
    } else {
      this._currentGutterX = this._config.gutterX
    }
  }

  private _getColumnCount = (): number => {
    if (this._config.surroundingGutter) {
      return Math.floor((this._width - this._currentGutterX) / (this._config.baseWidth + this._currentGutterX))
    }
    return Math.floor((this._width + this._currentGutterX) / (this._config.baseWidth + this._currentGutterX))
  }

  private _computeColumnWidth = (): number => {
    let width: number
    if (this._config.surroundingGutter) {
      width = (this._width - this._currentGutterX) / this._columnCount - this._currentGutterX
    } else {
      width = (this._width + this._currentGutterX) / this._columnCount - this._currentGutterX
    }
    width = Number.parseFloat(width.toFixed(2))
    return width
  }

  private _getNextColumn = (index: number): number => {
    return index % this._columnCount
  }

  private _getShortestColumn = (): number => {
    let shortestColumn = 0
    for (let currentColumn = 0; currentColumn < this._columnCount; currentColumn++) {
      if (this._columns[currentColumn] < this._columns[shortestColumn]) {
        shortestColumn = currentColumn
      }
    }
    return shortestColumn
  }

  private _getLongestColumn = (): number => {
    let longestColumn = 0
    for (let currentColumn = 0; currentColumn < this._columnCount; currentColumn++) {
      if (this._columns[currentColumn] > this._columns[longestColumn]) {
        longestColumn = currentColumn
      }
    }
    return longestColumn
  }

  private _onResize = (): void => {
    //IOS Safari throw random resize event on scroll, call layout only if size has changed
    if (this._container.clientWidth !== this._width) {
      this.layout()
    }
  }
}

export default Masonry
export { MasonryConfig }
