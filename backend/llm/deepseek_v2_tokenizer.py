# pip3 install transformers
# python3 deepseek_v2_tokenizer.py
import transformers

def tokenCount(text, chat_tokenizer_dir):
        """Returns the number of tokens in `text`, based on the tokenizer in `chat_tokenizer_dir`."""
        tokenizer = transformers.AutoTokenizer.from_pretrained( 
                chat_tokenizer_dir, trust_remote_code=True
                )
        return len(tokenizer.encode(text))

def tokenList(text, chat_tokenizer_dir):
        """Returns the list of tokens in `text`, based on the tokenizer in `chat_tokenizer_dir`."""
        tokenizer = transformers.AutoTokenizer.from_pretrained(
                chat_tokenizer_dir, trust_remote_code=True
                )
        return tokenizer.encode(text)

def apiCallPrice(text, outputSize, chat_tokenizer_dir, imageCount=0, imageSizes=[]):
        """Returns the price of an API call to `deepseek-ai/DeepSeek-V3` for `text`, given a specific `outputSize`."""
        # assuming deepseek-ai/DeepSeek-V3 usage
        price_per_M_tokens = 0.14 # in USD
        tokens = tokenCount(text, chat_tokenizer_dir) + outputSize
        return tokens * price_per_M_tokens / 1e6, tokenCount(text, chat_tokenizer_dir)

if __name__ == "__main__":
        chat_tokenizer_dir = "deepseek-ai/DeepSeek-V3"
        
        def get_string_from_file(file_path):
            with open(file_path, 'r') as file:
                return file.read()

        text = get_string_from_file("../data/shrink_test_output.txt")
        print("Token count: " + str(tokenCount(text, chat_tokenizer_dir)))
        tokens = tokenList(text, chat_tokenizer_dir)
        print("Token list: ")
        print(tokens)
        print("API call price: {:.8f} USD".format(apiCallPrice(text, 1500, chat_tokenizer_dir)))