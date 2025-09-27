from flask import Blueprint, request, jsonify

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/message', methods=['POST'])
def handle_chat():
    try:
        data = request.json
        message = data.get('message', '')
        chat_type = data.get('type', 'general')
        
        return jsonify({
            'response': f"Received: {message}",
            'type': chat_type,
            'provider': 'test'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/functions', methods=['GET'])
def get_functions():
    return jsonify({
        'functions': [
            {'id': 'news', 'name': 'News Assistant', 'description': 'Get latest news and updates'},
            {'id': 'health', 'name': 'Healthcare & Well-being', 'description': 'Health advice and wellness tips'},
            {'id': 'ecommerce', 'name': 'E-commerce', 'description': 'Shopping assistance and product recommendations'},
            {'id': 'travel', 'name': 'Travel & Hospitality', 'description': 'Travel planning and booking help'}
        ]
    })