import { change, dragenter, dragleave, dragover, drop } from './event-handlers'
import { blurTextareaWithEnterKey, resizeTextarea, selectAllText } from './file-uploads'

document.querySelector('#icon')?.addEventListener('change', change)
document.documentElement.addEventListener('dragenter', dragenter)
document.documentElement.addEventListener('dragover', dragover)
document.documentElement.addEventListener('dragleave', dragleave)
document.documentElement.addEventListener('drop', drop)

// default icons
document.querySelectorAll('.caption textarea').forEach((element) => {
  const textarea = element as HTMLTextAreaElement
  resizeTextarea(textarea)
  textarea.addEventListener('focus', (ev) => selectAllText(ev.target as HTMLTextAreaElement))
  textarea.addEventListener('keydown', blurTextareaWithEnterKey)
  // keyboard events may not be fired if the user is using an alternate means of entering text, such as a handwriting system on a tablet or graphics tablet.
  textarea.addEventListener('input', (ev) => resizeTextarea(ev.target as HTMLTextAreaElement))
})
