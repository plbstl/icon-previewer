import { handleFiles } from './file-uploads'

function change(event: Event) {
  handleFiles((event.target as HTMLInputElement).files)
}

export { change }
