from openai import OpenAI
from dotenv import load_dotenv
import os
import deepseek_v2_tokenizer as dtok
import pickle

load_dotenv()  # Load environment variables from .env file
model_name = "deepseek-ai/DeepSeek-V3"
base_url = "https://api.deepseek.com"

# usage stats : https://platform.deepseek.com/usage
client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url=base_url)

def calculate_api_cost(chat_completion):
  # Pricing information
  input_price_cache_hit = 0.014  # $0.014 per 1M tokens (cache hit)
  input_price_cache_miss = 0.14  # $0.14 per 1M tokens (cache miss)
  output_price = 0.28  # $0.28 per 1M tokens

  # Extract token usage details from the ChatCompletion object
  usage = chat_completion.usage
  prompt_tokens = usage.prompt_tokens
  completion_tokens = usage.completion_tokens
  prompt_cache_hit_tokens = usage.prompt_cache_hit_tokens
  prompt_cache_miss_tokens = usage.prompt_cache_miss_tokens

  # Calculate input cost based on cache hit/miss
  input_cost_cache_hit = (prompt_cache_hit_tokens / 1_000_000) * input_price_cache_hit
  input_cost_cache_miss = (prompt_cache_miss_tokens / 1_000_000) * input_price_cache_miss
  total_input_cost = input_cost_cache_hit + input_cost_cache_miss

  # Calculate output cost
  total_output_cost = (completion_tokens / 1_000_000) * output_price

  # Total cost
  total_cost = total_input_cost + total_output_cost

  return total_cost

def getSystemPrompt(users):
  
  if users == ["unidentifiable"]:
    user_details = """Since this file contains no user information, do your best to find the users' names from the prompt.
      If you absolutely can't, name them User1, User2, etc."""

  else:
    user_details = ", ".join([f"{user}" for user in users if user != "unidentifiable"])

  return f"""
    Act as a hyperintelligent psychiatrist capable of infering a complete and radical understanding of people and their characteristics from a simple conversation.
    Analyze the following chat between:
    {user_details}

    Your task is to provide a detailed analysis with the following metrics:

    1) **Conversation-level metrics:**
    - **Stability Score (out of 100):** Reflects the emotional consistency and lack of dramatic fluctuations in the conversation.
    - **Health Score (out of 100):** Indicates the overall positive or negative tone and supportiveness of the conversation.
    - **Intensity Score (out of 100):** Measures the engagement level, such as message frequency and response speed.

    2) **User-level metrics (for each user by name):**
    - **Assertiveness (out of 100):** Reflects the user's confidence and decisiveness in their messages.
    - **Positiveness (out of 100):** Indicates the overall positive or negative tone of the user's messages.
    - **Affection Towards Other (out of 100):** Measures the user's emotional warmth and care towards others.
    - **Romantic Attraction Towards Other (out of 100):** Reflects the user's romantic interest or attraction towards others.
    - **Rationality (out of 100):** Indicates the user's logical and analytical thinking in their messages.
    - **Emotiveness (out of 100):** Measures the user's emotional expressiveness and sensitivity.
    - **IQ Estimate (out of 100):** assume baseline of 100, adjust based on the user's messages.
    
    3) **Insights:**
    - An array of at least three insights IN THE SAME LANGUAGE AS THE MESSAGES. Each around 100 words each,
    offering advanced obscure inferences/guesses on the users, not summaries of the conversation.
    Don't worry about possibly being wrong, just go far and precise with your guesses.
    their full names, not their nicknames.

    IMPOSED OUTPUT JSON FORMAT: 

    {{
    "conversation_metrics": {{
    "stability_score_out_of_100": int,
    "health_score_out_of_100": int,
    "intensity_score_out_of_100": int
    }},
    "users": {{
      // FOR EACH USER in {user_details}
      username: {{
      "assertiveness": int,
      "positiveness": int,
      "affection_towards_other": int,
      "romantic_attraction_towards_other": int,
      "rationality": int,
      "emotiveness": int,
      "IQ_estimate": int
    }},
    "insights": ["Insight 1", "Insight 2", "Insight 3"]
    }}
  """

def promptToJSON(prompt, maxOutputTokens, users=[], model_name="deepseek-ai/DeepSeek-V3"):
  # build the system prompt
  systemPrompt = getSystemPrompt(users)

  #check for outsanding prices, get general token information
  price, tokenCount = dtok.apiCallPrice(prompt + systemPrompt, maxOutputTokens, model_name)
  print(f"Token count: {tokenCount}")
  if price > 0.002:
    print(f"Warning: This API call will cost ${price:.4f} USD.")
    raise ValueError("API call price exceeds $0.002 USD.")
    
  # make the API call
  response = api_call("deepseek-chat", maxOutputTokens, prompt, systemPrompt)
  if response.choices[0].message.refusal != None:
    print("Model refused to answer for the following reason:")
    print(response.choices[0].message.refusal)
    return None  
  jsonOutput = response.choices[0].message.content
  return jsonOutput, response

def api_call(model, maxOutputTokens, userPrompt, systemPrompt=None):

  response = client.chat.completions.create(
    model=model,
    messages=[
      {"role": "system", "content": systemPrompt},
      {"role": "user", "content": userPrompt}
    ],
    max_tokens=maxOutputTokens,
    response_format={'type': 'json_object'}
  )
  # pickle the response object
  with open("chat_completion.pkl", "wb") as f:
    pickle.dump(response, f)



  # with open("chat_completion.pkl", "rb") as f:
  #   response = pickle.load(f)

  return (response)

if __name__ == "__main__":
  print(getSystemPrompt(["Alice", "Bob"], ["A", "B"]))
