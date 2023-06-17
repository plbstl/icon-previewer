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
    const cardCaptionText = elem('textarea', undefined, ['Tap here to edit'])
    cardCaptionText.style.height = '26px'
    cardCaptionText.addEventListener('focus', (ev) => selectAllText(ev.target as HTMLTextAreaElement))
    cardCaptionText.addEventListener('keydown', blurTextareaWithEnterKey)
    cardCaptionText.addEventListener('input', (ev) => resizeTextarea(ev.target as HTMLTextAreaElement))
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

function selectAllText(textarea: HTMLTextAreaElement) {
  textarea.select()
}

function blurTextareaWithEnterKey(event: KeyboardEvent) {
  // allow `shift+enter` for newline
  if (event.key !== 'Enter') {
    return
  }
  if (event.shiftKey) {
    return
  }
  const textarea = event.target as HTMLTextAreaElement
  textarea.blur()
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = '0px'
  textarea.style.height = `${textarea.scrollHeight}px`
  masonry.layout()
}

export { blurTextareaWithEnterKey, handleFiles, resizeTextarea, selectAllText }
