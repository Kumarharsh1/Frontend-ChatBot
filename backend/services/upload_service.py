import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.upload_service import UploadService

upload_bp = Blueprint('upload', __name__)
upload_service = UploadService()

# Make sure this function is defined and correct
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/file', methods=['POST'])
def upload_file():
    # 1. Check if the file part is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    # 2. Check if a file was selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # 3. Validate file type and save it
    if file and allowed_file(file.filename):
        # Secure the filename to avoid path traversal attacks
        filename = secure_filename(file.filename)
        
        # Ensure the upload folder exists
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Create the full filepath
        filepath = os.path.join(upload_folder, filename)
        
        try:
            # Save the file to the filesystem
            file.save(filepath)
            current_app.logger.info(f"File saved successfully to: {filepath}")
            
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500
        
        # 4. Now, process the saved file with your service
        try:
            result = upload_service.process_file(filepath, request.form.get('type', 'general'))
            return jsonify(result)
        
        except Exception as e:
            return jsonify({'error': f'File processing error: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Allowed types are: txt, pdf, png, jpg, jpeg, gif'}), 400