import os
from dotenv import load_dotenv

# Test 1: Check if .env file is loading
print("=== Testing .env File ===")
load_dotenv()

groq_key = os.getenv('GROQ_API_KEY')
print(f"Groq API Key from .env: {'✅ Found' if groq_key else '❌ Missing'}")
if groq_key:
    print(f"Key preview: {groq_key[:10]}...")

# Test 2: Check if we can import Groq
print("\n=== Testing Groq Import ===")
try:
    import groq
    print("✅ Groq library imported successfully")
    
    # Test 3: Check if we can create Groq client
    if groq_key:
        try:
            client = groq.Groq(api_key=groq_key)
            print("✅ Groq client created successfully")
            
            # Test 4: Test actual API call
            print("\n=== Testing Groq API Call ===")
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": "Say 'Hello World'"}],
                model="llama-3.1-8b-instant",
                max_tokens=10
            )
            print("✅ Groq API call successful!")
            print(f"Response: {chat_completion.choices[0].message.content}")
            
        except Exception as e:
            print(f"❌ Groq client error: {e}")
    else:
        print("❌ Cannot test Groq client without API key")
        
except ImportError as e:
    print(f"❌ Groq import error: {e}")

# Test 5: Check backend URL
print("\n=== Testing Backend URL ===")
print("Backend should be running on: http://localhost:5000")
print("Open this in your browser to check if backend is running")