import Masonry from './masonry'

const masonry = new Masonry({
  container: '.cards',
  baseWidth: 128,
  surroundingGutter: false,
  gutter: 24,
  ultimateGutter: 16,
})

// img.clientHeight affects masonry layout
const hardcodedSelector = 'body > main > .cards > .card:nth-child(5) > .preview > img'
;(document.querySelector(hardcodedSelector) as HTMLImageElement).onload = masonry.layout
