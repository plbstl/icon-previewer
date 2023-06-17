import { masonry } from './layout'
import type Masonry from './masonry'

let uploadIconCount = 0

function handleFiles(files: FileList | null) {
  if (!files) {
    alert('No file found')
    return
  }

  let shouldAlertOnlyImages = false

  for (const file of files) {
    if (!file?.type.startsWith('image/')) {
      shouldAlertOnlyImages = true
      continue
    }
    const card = elem('div', 'card')

    const cardPreview = elem('div', 'preview')
    const cardPreviewImg = img(file, card, masonry)
    cardPreview.appendChild(cardPreviewImg)

    const cardCaption = elem('div', 'caption')
    const cardCaptionText = elem('p', undefined, ['Tap here to edit'])
    cardCaption.appendChild(cardCaptionText)

    card.appendChild(cardPreview)
    card.appendChild(cardCaption)
  }

  // makes sure alert shows only once
  if (shouldAlertOnlyImages) {
    alert('Only images are allowed!')
  }
}

function elem<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  if (className) {
    element.className = className
  }
  if (children) {
    element.append(...children)
  }
  return element
}

function img(file: File, cardContainer: HTMLElement, masonry: Masonry): HTMLImageElement {
  const img = document.createElement('img')
  const objectURL = window.URL.createObjectURL(file)
  img.src = objectURL
  img.alt = `Uploaded icon #${++uploadIconCount}`
  // img.clientHeight affects masonry layout
  img.onload = () => {
    const cards = document.querySelector<HTMLDivElement>('.cards')!
    cards.children[0].after(cardContainer)
    masonry.layout()
  }
  return img
}

export { handleFiles }
