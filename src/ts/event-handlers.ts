import { handleFiles } from './file-uploads'

export function change(event: Event) {
  handleFiles((event.target as HTMLInputElement).files)
}

export function dragenter(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
  document.body.classList.add('dragging')
}

export function dragleave(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
  document.body.classList.remove('dragging')
}

export function dragover(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
  document.body.classList.add('dragging')
}

export function drop(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()

  const dt = e.dataTransfer
  const files = dt?.files

  handleFiles(files || null)
  document.body.classList.remove('dragging')
}
