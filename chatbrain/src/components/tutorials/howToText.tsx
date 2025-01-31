function TextTutorial() {
  return (
    <div className="p-4 max-w-5xl">
        <div>
            <h2 className="text-2xl font-medium mb-2">1. Copy and pasting from another platform</h2>
            <div className="flex flex-row items-center justify-center space-x-4 mt-8">
                <div className="w-2/5 space-y-4 text-lg">
                    <p>You can manually <b>copy and paste</b> conversations from any platform of your liking to chatbrain.</p>
                    <p className="text-left">1. Navigate to your platform/app of choice<br/>
                    2. Select the conversation you want to copy<br/>
                    3. Press <b><code>ctrl+c</code></b> (on smartphone, long-press then hit copy).<br/>
                    4. Navigate back to chatbrain, and under the <a href="/use"><b><i>Analyze a conversation</i></b></a> tab,
                     click the <br/>"<b><i>Type/paste text</i></b>" button.<br/>
                    5. Press <b><code>ctrl+v</code></b> (on smartphone, long-press then hit paste), then click <b><i>Submit</i></b>.</p>
                </div>
                <img src="https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif"
                    alt="Tutorial GIF" 
                    className="w-3/5 h-auto rounded-lg opacity-80" />
            </div>
            <h2 className="text-2xl font-medium my-8">2. Transcribing manually</h2>
            <div className="flex flex-row items-center justify-center space-x-4">
                <img src="https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif"
                    alt="Tutorial GIF" 
                    className="w-3/5 h-auto rounded-lg opacity-80" />
                <div className="w-2/5 space-y-4 text-lg">
                    <p>If copy and pasting is impossible, you can always <b>transcribe</b> the conversation yourself.</p>
                    <p className="text-left">1. Under the <a href="/use"><b><i>Analyze a conversation</i></b></a> tab,
                    click the "<b><i>Type/paste text</i></b>" button.<br/>
                    2. Write down the conversation in the text box provided, making sure to respect the following format for each line:<br/></p>
                    <code className="text-center">Username: message</code><br/>
                    <p className="text-left">3. Once you're done, simply click <b><i>Submit</i></b>.</p>
                </div>
            </div>
        </div>
    </div>
  )
};

export default TextTutorial;