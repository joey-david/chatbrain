export function validateFiles(files: File[]): void {
    const fileTypes = new Set<string>()
    const extensions = new Set<string>()
  
    files.forEach(file => {
      const mimeType = file.type
      const extension = file.name.split('.').pop()
  
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
  
    if (fileTypes.size > 1 || extensions.size > 1) {
      alert("All files should be of the same type and extension.")
      throw new Error("All files should be of the same type and extension.")
    }
    if (fileTypes.has('txt') && files.length > 1) {
      alert("Only one text file is allowed.")
      throw new Error("Only one text file is allowed.")
    }
  }