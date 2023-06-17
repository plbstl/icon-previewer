import Masonry from './masonry'

const masonry = new Masonry({
  container: '.cards',
  baseWidth: 128,
  surroundingGutter: false,
  gutter: 24,
  ultimateGutter: 16,
})

export { masonry }
