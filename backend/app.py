from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from the same directory as app.py
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app, origins=["*"])

# Debug: Print current working directory and environment
print("🔍 Current working directory:", os.getcwd())
print("🔍 Script directory:", os.path.dirname(__file__))
print("🔍 Environment file path:", os.path.join(os.path.dirname(__file__), '.env'))

# Check if .env file exists
env_path = os.path.join(os.path.dirname(__file__), '.env')
print("🔍 .env file exists:", os.path.exists(env_path))

# Debug environment variables
print("🔍 All environment variables:")
for key, value in os.environ.items():
    if 'GROQ' in key or 'API' in key:
        print(f"   {key}: {value}")

# Initialize Groq
groq_client = None
groq_api_key = os.getenv('GROQ_API_KEY')

print(f"🔑 GROQ_API_KEY loaded: {groq_api_key is not None}")
print(f"📏 API Key length: {len(groq_api_key) if groq_api_key else 0}")
print(f"✅ API Key starts with 'gsk_': {groq_api_key.startswith('gsk_') if groq_api_key else False}")

if groq_api_key and groq_api_key.startswith('gsk_'):
    try:
        print("🔄 Initializing Groq client...")
        groq_client = Groq(api_key=groq_api_key)
        
        # Test the connection
        test_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": "Say 'Hello' only"}],
            model="llama-3.1-8b-instant",
            max_tokens=10
        )
        print("✅ Groq client initialized and tested successfully!")
        print(f"   Test response: {test_response.choices[0].message.content}")
        
    except Exception as e:
        print(f"❌ Groq initialization failed: {e}")
        groq_client = None
else:
    print("❌ Invalid or missing GROQ_API_KEY")

@app.route('/api/chat/message', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        chat_type = data.get('type', 'general')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        print(f"💬 Received message: '{message}'")
        print(f"🔧 Groq client available: {groq_client is not None}")
        
        if groq_client:
            try:
                print("🔄 Calling Groq API...")
                response = groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": message}],
                    model="llama-3.1-8b-instant",
                    max_tokens=500,
                    temperature=0.7
                )
                
                bot_response = response.choices[0].message.content
                print(f"🤖 Groq response received ({len(bot_response)} characters)")
                
                return jsonify({
                    'response': bot_response,
                    'type': chat_type,
                    'provider': 'groq'
                })
                
            except Exception as e:
                print(f"❌ Groq API call failed: {e}")
                return jsonify({
                    'response': f"Error: {str(e)}",
                    'type': chat_type,
                    'provider': 'groq_error'
                })
        else:
            print("⚠️ Using echo response (Groq not available)")
            return jsonify({
                'response': f"Echo: {message} (Groq not configured - API Key: {groq_api_key})",
                'type': chat_type,
                'provider': 'echo'
            })
            
    except Exception as e:
        print(f"💥 Server error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/functions', methods=['GET'])
def get_functions():
    return jsonify({
        'functions': [
            {'id': 'news', 'name': 'News Assistant', 'description': 'Get latest news and updates'},
            {'id': 'health', 'name': 'Healthcare & Well-being', 'description': 'Health advice and wellness tips'},
            {'id': 'ecommerce', 'name': 'E-commerce', 'description': 'Shopping assistance and product recommendations'},
            {'id': 'travel', 'name': 'Travel & Hospitality', 'description': 'Travel planning and booking help'}
        ]
    })

@app.route('/')
def home():
    return jsonify({'message': 'Multi-AI ChatBot API is running!'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Server running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)