import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from routes.chat import chat_bp
    print("✅ chat.py imports successfully!")
except ImportError as e:
    print(f"❌ chat.py import failed: {e}")

try:
    from routes.upload import upload_bp
    print("✅ upload.py imports successfully!")
except ImportError as e:
    print(f"❌ upload.py import failed: {e}")

try:
    from routes.url import url_bp
    print("✅ url.py imports successfully!")
except ImportError as e:
    print(f"❌ url.py import failed: {e}")
