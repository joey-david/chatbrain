import { useEffect, useRef } from 'react'

interface Box {
    xywhn: number[]
    conf: number
    cls: number
    posClass: number
    text: string
}

interface ImageResult {
    boxes: Box[]
    oneSided: boolean
}

interface ImageResultsProps {
    results: ImageResult[]
    originalFiles: File[]
}

export function ImageResults({ results, originalFiles }: ImageResultsProps) {
    return (
        <div>
            <h1 className="text-white text-3xl mt-8">Message Detection</h1>
            <div className="max-w-6xl grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 place-items-center mt-5">
                {originalFiles.map((file, index) => (
                    <ImageWithBoxes 
                        key={file.name} 
                        file={file}
                        boxes={results[index]?.boxes || []}
                    />
                ))}
            </div>
        </div>
    )
}

interface ImageWithBoxesProps {
    file: File
    boxes: Box[]
}

function ImageWithBoxes({ file, boxes }: ImageWithBoxesProps) {
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const drawBoxes = () => {
            const image = imageRef.current
            const canvas = canvasRef.current
            if (!image || !canvas) return

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Set canvas size to match image's natural size
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight

            // Draw boxes
            boxes.forEach(box => {
                const [x, y, w, h] = box.xywhn
                const boxX = (x - w/2) * image.naturalWidth
                const boxY = (y - h/2) * image.naturalHeight
                const boxW = w * image.naturalWidth
                const boxH = h * image.naturalHeight

                ctx.strokeStyle = box.cls === 0 ? 'blue' : box.cls === 1 ? 'red' : box.cls === 2 ? 'orange' : 'red'
                ctx.lineWidth = 5
                ctx.strokeRect(boxX, boxY, boxW, boxH)
            })
        }

        // Wait for image to load before drawing boxes
        const image = imageRef.current
        if (image) {
            if (image.complete) {
                drawBoxes()
            } else {
                image.onload = drawBoxes
            }
        }
    }, [boxes])

    return (
        <div className="relative w-[250px] rounded-xl overflow-hidden opacity-80 shadow-2xl">
            <img
                ref={imageRef}
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-auto rounded-xl"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"
            />
        </div>
    )
}