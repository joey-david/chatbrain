export function validateFiles(files: File[]): void {
  if (files.length > 10) {
    alert("You can upload a maximum of 10 files.")
    throw new Error("You can upload a maximum of 10 files.")
  }

  const fileTypes = new Set<string>()
  const extensions = new Set<string>()
  let totalSize = 0
  
  files.forEach(file => {
    const mimeType = file.type
    const extension = file.name.split('.').pop()
    totalSize += file.size
  
    if (mimeType.startsWith('text')) {
      fileTypes.add('txt')
    } else if (mimeType.startsWith('audio')) {
      fileTypes.add('aud')
    } else if (mimeType.startsWith('image')) {
      fileTypes.add('img')
    } else {
      alert("A file of an invalid format was submitted.")
      throw new Error("A type of an invalid format was submitted.")
    }
  
    if (extension) {
      extensions.add(extension)
    }
  })

  if (fileTypes.size > 1) {
    alert("Please upload only one file type at a time.")
    throw new Error("Mixed file types are not supported.")
  }
  
  if (fileTypes.has('txt') && files.length > 1) {
    alert("Only one text log is allowed at once.")
    throw new Error("Only one text log is allowed at once.")
  }
  if (totalSize > 20 * 1024 * 1024) {
    alert("The total size of the files should not exceed 20MB.")
    throw new Error("The total size of the files should not exceed 20MB.")
  }
}
