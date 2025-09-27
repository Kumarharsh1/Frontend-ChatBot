import json
import os
from datetime import datetime

class DataProcessor:
    def __init__(self):
        self.data_file = 'data/ingested_data.json'
        self._ensure_data_file()

    def _ensure_data_file(self):
        if not os.path.exists(self.data_file):
            os.makedirs('data', exist_ok=True)
            with open(self.data_file, 'w') as f:
                json.dump({}, f)

    def store_data(self, content, data_type='general'):
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
            
            timestamp = datetime.now().isoformat()
            if data_type not in data:
                data[data_type] = []
            
            data[data_type].append({
                'content': content[:1000],  # Store first 1000 chars
                'timestamp': timestamp,
                'source': 'upload'
            })
            
            # Keep only last 10 entries per type
            if len(data[data_type]) > 10:
                data[data_type] = data[data_type][-10:]
            
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return f"Stored {len(content)} characters for {data_type}"
            
        except Exception as e:
            return f"Error storing data: {str(e)}"

    def get_recent_data(self, data_type='general'):
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
            
            return data.get(data_type, [])
        except:
            return []
