import os
import numpy as np
from flask import Flask, request, jsonify
from monai.transforms import Compose, RandGaussianNoise, RandAffine, ScaleIntensity, EnsureChannelFirst
from monai.data import create_test_image_3d
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from PIL import Image
import torch

# Flask app setup
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load text analysis model
TEXT_MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
text_tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_NAME)
text_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_NAME)

# Labels for image analysis (mock)
IMAGE_LABELS = ["No Finding", "Pneumonia", "Effusion", "Atelectasis", "Cardiomegaly", "Edema"]

def generate_synthetic_image():
    """
    Generate a synthetic medical image using MONAI.
    Returns:
        np.ndarray: A synthetic 3D medical image.
    """
    try:
        image, _ = create_test_image_3d(128, 128, 128, num_objs=5, rad_max=20)
        transforms = Compose([
            EnsureChannelFirst(),
            RandGaussianNoise(prob=1.0, mean=0.0, std=0.1),
            RandAffine(prob=1.0, translate_range=(5, 5, 5), rotate_range=(0.1, 0.1, 0.1), padding_mode='zeros'),
            ScaleIntensity()
        ])
        transformed_image = transforms(image)
        return transformed_image
    except Exception as e:
        return None, {"error": f"Error generating synthetic image: {str(e)}"}

def analyze_image(image_path):
    """
    Analyze a medical image using a mock model.
    Args:
        image_path (str): Path to the uploaded medical image.
    Returns:
        dict: Predicted probabilities or error message.
    """
    try:
        if image_path.lower().endswith(".dcm"):
            import pydicom
            dicom_image = pydicom.dcmread(image_path)
            img = dicom_image.pixel_array
        else:
            with Image.open(image_path) as img:
                img = img.resize((224, 224))
                img = np.array(img, dtype="float32") / 255.0
        img = torch.tensor(img).unsqueeze(0).unsqueeze(0)
        mock_predictions = np.random.rand(len(IMAGE_LABELS))
        mock_predictions /= mock_predictions.sum()  # Normalize to 1
        return {label: float(pred) for label, pred in zip(IMAGE_LABELS, mock_predictions)}
    except Exception as e:
        return {"error": f"Failed to analyze image: {str(e)}"}

def analyze_text(text):
    """
    Analyze medical text using a pretrained BERT model.
    Args:
        text (str): Input medical text.
    Returns:
        dict: Predictions and keywords.
    """
    try:
        inputs = text_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        outputs = text_model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)
        prediction = probabilities.argmax().item()
        return {
            "Prediction": prediction,
            "Probabilities": probabilities.tolist()
        }
    except Exception as e:
        return {"error": f"Failed to analyze text: {str(e)}"}

@app.route('/analyze_image', methods=['POST'])
def image_analysis_endpoint():
    """
    Endpoint to analyze a medical image.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files['image']
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(image_path)

    result = analyze_image(image_path)
    return jsonify(result)

@app.route('/analyze_text', methods=['POST'])
def text_analysis_endpoint():
    """
    Endpoint to analyze medical text.
    """
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = analyze_text(text)
    return jsonify(result)

@app.route('/generate_image', methods=['GET'])
def generate_image_endpoint():
    """
    Endpoint to generate a synthetic medical image.
    """
    image, error = generate_synthetic_image()
    if error:
        return jsonify(error), 500

    save_path = os.path.join(app.config['UPLOAD_FOLDER'], 'synthetic_image.png')
    plt.imshow(image[0, 64, :, :], cmap="gray")
    plt.savefig(save_path)
    return jsonify({"image_path": save_path})

if __name__ == "__main__":
    app.run(debug=True)
