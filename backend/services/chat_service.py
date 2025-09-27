import os
import re
import logging
from groq import Groq
from dotenv import load_dotenv
from utils.data_processor import DataProcessor

load_dotenv()

class ChatService:
    def __init__(self):
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.groq_client = Groq(api_key=groq_api_key)
        self.data_processor = DataProcessor()
        self.logger = logging.getLogger(__name__)

        # Define system contexts
        self.contexts = {
            'general': "You are a helpful AI assistant that can answer questions on various topics.",
            'news': """You are a NEWS ASSISTANT specialized exclusively in news and current events.
STRICT RULES: Only answer questions about news. Politely redirect questions outside your domain.""",
            'health': """You are a HEALTH ASSISTANT specialized exclusively in health, fitness, and wellness.
STRICT RULES: Only answer health-related questions. Politely redirect questions outside your domain.""",
            'ecommerce': """You are an E-COMMERCE ASSISTANT specialized exclusively in shopping and product guidance.
STRICT RULES: Only answer e-commerce questions. Politely redirect questions outside your domain.""",
            'travel': """You are a TRAVEL ASSISTANT specialized exclusively in travel and hospitality.
STRICT RULES: Only answer travel-related questions. Politely redirect questions outside your domain."""
        }

        # Domain keyword patterns (more flexible)
        self._domain_patterns = {
            'news': {
                'allowed': [
                    r'\b(news|update|headline|breaking|current|event|politics|government|election|business|sports|weather|entertainment|world|local|national|international|report|media|journalism)\b'
                ],
                'disallowed': [
                    r'\b(recipe|cooking|medical|prescription|shop|buy|purchase|product|travel|vacation|hotel|flight)\b'
                ]
            },
            'health': {
                'allowed': [
                    r'\b(health|medical|doctor|hospital|medicine|treatment|fitness|exercise|diet|nutrition|wellness|mental|therapy|symptom|vitamin|workout|yoga|meditation|pain|illness|disease)\b'
                ],
                'disallowed': [
                    r'\b(travel|vacation|flight|booking|news|politics|election|shop|buy|purchase|sale|deal)\b'
                ]
            },
            'ecommerce': {
                'allowed': [
                    r'\b(shop|buy|purchase|product|price|sale|discount|shopping|retail|store|online|order|delivery|review|brand|compare|deal|offer|cart|checkout|payment|shipping)\b'
                ],
                'disallowed': [
                    r'\b(travel|vacation|medical|health|news|politics|government|recipe|cooking)\b'
                ]
            },
            'travel': {
                'allowed': [
                    r'\b(travel|trip|vacation|holiday|journey|tour|destination|itinerary|hotel|resort|accommodation|flight|airline|booking|reservation|passport|visa|sightseeing|guide|plan|beach|mountain|city|culture|adventure|cruise|roadtrip)\b'
                ],
                'disallowed': [
                    r'\b(medical|health|prescription|news|politics|shop|buy|purchase|product|sale)\b'
                ]
            }
        }

        # Redirect messages
        self._redirect_messages = {
            'news': {
                'health': "I'm your News Assistant. For health questions, please use the Health Assistant.",
                'travel': "I'm your News Assistant. For travel planning, please use the Travel Assistant.",
                'ecommerce': "I'm your News Assistant. For shopping questions, please use the E-commerce Assistant.",
                'general': "I'm your News Assistant. This seems like a general question - try our General Assistant!"
            },
            'health': {
                'news': "I'm your Health Assistant. For news updates, please use the News Assistant.",
                'travel': "I'm your Health Assistant. For travel questions, please use the Travel Assistant.",
                'ecommerce': "I'm your Health Assistant. For shopping questions, please use the E-commerce Assistant.",
                'general': "I'm your Health Assistant. This seems like a general question - try our General Assistant!"
            },
            'ecommerce': {
                'news': "I'm your E-commerce Assistant. For news updates, please use the News Assistant.",
                'health': "I'm your E-commerce Assistant. For health questions, please use the Health Assistant.",
                'travel': "I'm your E-commerce Assistant. For travel planning, please use the Travel Assistant.",
                'general': "I'm your E-commerce Assistant. This seems like a general question - try our General Assistant!"
            },
            'travel': {
                'news': "I'm your Travel Assistant. For news updates, please use the News Assistant.",
                'health': "I'm your Travel Assistant. For health questions, please use the Health Assistant.",
                'ecommerce': "I'm your Travel Assistant. For shopping questions, please use the E-commerce Assistant.",
                'general': "I'm your Travel Assistant. This seems like a general question - try our General Assistant!"
            }
        }

    def process_message(self, message, chat_type='general'):
        """Process a message with the specified chat type."""
        if not message or not message.strip():
            return {'error': 'Message cannot be empty'}

        # Validate chat_type
        if chat_type not in self.contexts:
            self.logger.warning(f"Invalid chat_type: {chat_type}, defaulting to 'general'")
            chat_type = 'general'

        if chat_type == 'general':
            return self._use_groq(message, chat_type)

        # Check if message is within domain
        if self._is_domain_mismatch(message, chat_type):
            return self._get_domain_redirect_response(message, chat_type)

        # If domain matches, call LLM
        return self._use_groq(message, chat_type)

    def _is_domain_mismatch(self, message, chat_type):
        """Check if message doesn't match the specified domain."""
        message_lower = message.lower()
        patterns = self._domain_patterns.get(chat_type, {})
        
        if not patterns:
            return False
            
        # Count allowed and disallowed matches with more flexible scoring
        allowed_matches = sum(len(re.findall(p, message_lower)) for p in patterns.get('allowed', []))
        disallowed_matches = sum(len(re.findall(p, message_lower)) for p in patterns.get('disallowed', []))
        
        # More flexible matching: require at least 2 allowed matches or disallowed > allowed
        return allowed_matches < 2 or disallowed_matches > allowed_matches

    def _detect_intended_domain(self, message):
        """Detect the most likely domain for the message."""
        message_lower = message.lower()
        scores = {}
        
        for domain, patterns in self._domain_patterns.items():
            allowed_score = sum(len(re.findall(p, message_lower)) for p in patterns.get('allowed', []))
            disallowed_score = sum(len(re.findall(p, message_lower)) for p in patterns.get('disallowed', []))
            scores[domain] = max(0, allowed_score - disallowed_score)
            
        detected = max(scores, key=scores.get)
        return detected if scores[detected] > 0 else 'general'

    def _get_domain_redirect_response(self, message, chat_type):
        """Generate a redirect response for domain mismatch."""
        detected_domain = self._detect_intended_domain(message)
        response_message = self._redirect_messages.get(chat_type, {}).get(
            detected_domain,
            f"I'm your {chat_type.title()} Assistant. This question seems outside my expertise. Please try the appropriate assistant!"
        )
        
        return {
            'response': response_message,
            'type': chat_type,
            'provider': 'domain_redirect',
            'redirect_required': True,
            'suggested_assistant': detected_domain
        }

    def _use_groq(self, message, chat_type):
        """Call Groq API with proper error handling."""
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.contexts[chat_type]},
                    {"role": "user", "content": message}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=500,
                timeout=30  # Add timeout
            )
            
            return {
                'response': chat_completion.choices[0].message.content,
                'type': chat_type,
                'provider': 'groq',
                'redirect_required': False
            }
            
        except Exception as e:
            self.logger.error(f"Groq API error: {str(e)}")
            return {
                'error': f'Sorry, I encountered an error processing your request. Please try again.',
                'type': chat_type,
                'provider': 'groq',
                'redirect_required': False
            }