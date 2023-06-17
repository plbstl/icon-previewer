import { change, dragenter, dragleave, dragover, drop } from './event-handlers'

document.querySelector('#icon')?.addEventListener('change', change)
document.documentElement.addEventListener('dragenter', dragenter)
document.documentElement.addEventListener('dragover', dragover)
document.documentElement.addEventListener('dragleave', dragleave)
document.documentElement.addEventListener('drop', drop)
