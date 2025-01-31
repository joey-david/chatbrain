interface ScreenshotLabelProps {
    image: string;
    description: string;
}

function ScreenshotLabel({ image, description }: ScreenshotLabelProps) {
    return (
        <div className="w-1/3 space-x-4 text-lg flex flex-col items-center justify-center">
            <div className="space-y-4 text-lg">
                <p>{description}</p>
            </div>
            <img 
                src={image}
                alt="Tutorial Image" 
                className="w-full rounded-lg opacity-75 mt-2 shadow-lg shadow-black" 
            />
        </div>
    )
}

export default ScreenshotLabel;