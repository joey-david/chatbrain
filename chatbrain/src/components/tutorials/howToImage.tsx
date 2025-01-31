import ScreenshotLabel from '@/components/ui/screenshotLabel';

function ImageTutorial() {
    return (
    <div className="p-4 max-w-5xl">
        <div>
            <h2 className="text-2xl font-medium mb-2">1. Analyzing exported conversation logs</h2>
            <div>
                <h3 className="text-lg text-gray-400 font-semibold mb-2">DISCLAIMER: Chat logs tend to be very large,
                    and chatbrain will not perform an LLM analysis on conversations containing roughly over 100 texts,
                    in order not to overload the app. Metadata graphs and metrics will still be available.
                </h3>
                <h3 className="text-xl font-semibold mb-2 mt-10">I. Obtaining the log(s)</h3>
                <p className="mb-8">
                    <b>Whatsapp</b> is used as an example. 
                    Here are links to tutorials for other platforms:
                    <a className= "" href="https://www.kidsonlinesafetyresearch.ie/how-do-i-download-messages-from-instagram/"> Instagram</a>,
                    <a className= "" href="https://lifehacker.com/you-can-export-your-entire-imessage-history-1850000632"> iMessage</a>,
                    <a className= "" href="https://help.snapchat.com/hc/en-us/articles/7012305371156-How-do-I-download-my-data-from-Snapchat"> Snapchat</a>,
                    <a className= "" href="https://www.maketecheasier.com/export-telegram-chat-history/"> Telegram</a> or 
                    <a className= "" href="https://www.wikihow.com/Export-Messages-on-Facebook"> Messenger</a>.
                </p>          
            </div>
            <div className="flex flex-row items-center justify-center space-x-4 mt-4">
                <ScreenshotLabel image="src/assets/tutorialImage1.png" description="1. Click the name of your contact." />
                <ScreenshotLabel image="src/assets/tutorialImage2.png" description="2. Scroll to the bottom of the page." />
                <ScreenshotLabel image="src/assets/tutorialImage3.png" description='3. Click the "export chat" button.' />
            </div>
            <div className="flex flex-row items-center justify-center space-x-4 mt-8">
                <ScreenshotLabel image="src/assets/tutorialImage4.png" description="4. Save the zip file to your device." />
                <ScreenshotLabel image="src/assets/tutorialImage5.png" description="5. Extract the file you've downloaded." />
                <ScreenshotLabel image="src/assets/tutorialImage6.png" description="6. Ensure you know where your file is." />
            </div>
            <h3 className="text-xl font-semibold mb-2 mt-10">II. Uploading the log(s)</h3>
            <p className="text-center text-lg mt-4">Simply upload the extracted file(s) to chatbrain using the <b>Upload File(s)</b> button.</p>
        
        
            <h2 className="text-2xl font-medium mt-8 mb-4">2. Uploading screenshots</h2>
            <div className="flex flex-row items-center justify-center space-x-4">
                <ScreenshotLabel image="src/assets/tutorialImage7.png" description="1. Take a single screenshot or..." />
                <ScreenshotLabel image="src/assets/tutorialImage8.png" description="2. Up to 10, if you need to." />
                <div className="w-1/2 space-x-4 text-lg flex flex-col items-center justify-center">
                    <p className="text-lg">3. Upload your screenshot(s) using the <a href="/use"><b>Upload File(s)</b></a> button.</p>                    <img src="src/assets/uploadButton.png"
                        alt="Tutorial Image" 
                        className="w-full rounded-lg opacity-80 mt-2 shadow-lg shadow-black" />
                </div>
            </div>
        </div>
    </div>
    )
};
  
  export default ImageTutorial;