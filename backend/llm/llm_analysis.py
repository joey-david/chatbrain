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
    Act as a forensic conversation analyst with expertise in microexpression decoding and personality archetype detection. 
    Perform a multi-layered analysis of this chat between {user_details} using these advanced techniques:

    1. **Conversation-level matrix (100pt scales):**
      - Linguistic Synchrony Score: How users subconsciously mirror communication patterns (vocabulary, sentence length, emoji use)
      - Trust Asymmetry Score: Imbalanced reliance levels measured through vulnerability disclosures
      - Temporal Engagement Score: Consistency of involvement across conversation timeline

    2) **User-level metrics (for each user by name, 100pt scale):**
    - Emotional Complexity: Nuance range in emotional expression (1D anger->5D wistful nostalgia)
    - Social Perception Score: Accuracy in interpreting others' unstated needs
    - Cognitive Dissonance: Contradictions between stated values and behavioral patterns
    - Vulnerability Activation: Frequency of self-disclosure triggers
    - Temporal Consistency: Personality stability across conversation timeline
    - Trust: Implicit faith in others measured through delegation frequency
    - Conceptual proficiency: Ability to grasp complex ideas and explain them clearly
    
    3. **Insights Protocol:**
    Generate 3 "DNA Insights" following these rules:
    - MUST be an advanced inference and deduction
    - MUST be relevant to the conversation context
    - MUST be precise and targeted
    - Present in original message language
    - MUST be around 4 to 5 sentences long

    IMPOSED OUTPUT JSON FORMAT: 

    {{
    "conversation_metrics": {{
      "linguistic_synchrony_score": int
      "conflict_potential_score": int,
      "trust_asymetry_score": int,
      "temporal_engagement_score": int
    }},
    "users": {{
      // FOR EACH USER in {user_details}
      username: {{
        "emotional_complexity": int,
        "social_perception": int,
        "cognitive_dissonance": int,
        "vulnerability_activation": int,
        "temporal_consistency": int,
        "trust": int
        "conceptual_proficiency": int
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
