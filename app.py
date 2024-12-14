import os
import numpy as np
import matplotlib.pyplot as plt
from flask import Flask, request, render_template, jsonify
from monai.transforms import Compose, RandGaussianNoise, RandAffine, ScaleIntensity, EnsureChannelFirst
from monai.data import create_test_image_3d
from PIL import Image
import sqlite3

# Flask application setup
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database setup
def init_db():
    conn = sqlite3.connect('results.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS analysis_results (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        image_result TEXT,
                        text_result TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                      )''')
    conn.commit()
    conn.close()
init_db()

# Synthetic image generation
def generate_synthetic_image():
    try:
        image, _ = create_test_image_3d(128, 128, 128, num_objs=5, rad_max=20)
        transforms = Compose([
            EnsureChannelFirst(),
            RandGaussianNoise(prob=1.0, mean=0.0, std=0.1),
            RandAffine(prob=1.0, translate_range=(5, 5, 5), rotate_range=(0.1, 0.1, 0.1), padding_mode='zeros'),
            ScaleIntensity()
        ])
        transformed_image = transforms(image)

        # Save a slice of the image
        plt.imshow(transformed_image[0, 64, :, :], cmap="gray")
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], 'synthetic_image.png')
        plt.savefig(save_path)
        plt.close()

        return save_path
    except Exception as e:
        return None, str(e)

# Mock text analysis
def analyze_text(text):
    # Simulated analysis (replace with NLP model in production)
    keywords = text.split()[:5]
    return {"Summary": "Mock analysis of medical text.", "Keywords": keywords}

# Image analysis
def analyze_image(image_path):
    try:
        if not os.path.exists(image_path):
            return {"error": "Image file does not exist."}

        # Example processing (mock analysis)
        result = {"Result": "Mock image analysis completed."}
        return result
    except Exception as e:
        return {"error": str(e)}

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        image_analysis = None
        text_analysis = None
        image_url = None

        # Handle uploaded image
        image = request.files.get('image')
        if image:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
            image.save(image_path)
            try:
                image_analysis = analyze_image(image_path)
                image_url = f"/uploads/{image.filename}"
            except Exception as e:
                image_analysis = {"error": str(e)}

        # Handle entered text
        text = request.form.get('text')
        if text:
            try:
                text_analysis = analyze_text(text)
            except Exception as e:
                text_analysis = {"error": str(e)}

        # Store results in database
        conn = sqlite3.connect('results.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO analysis_results (image_result, text_result) VALUES (?, ?)',
                       (str(image_analysis), str(text_analysis)))
        conn.commit()
        conn.close()

        return jsonify({"image_analysis": image_analysis, "text_analysis": text_analysis, "image_url": image_url})

    return render_template('index.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True)
