import os
import numpy as np
import pydicom
from PIL import Image

def analyze_image(image_path):
    """
    Function to analyze a medical image (JPEG, PNG, or DICOM) using a mock model (for environments without TensorFlow).
    Args:
        image_path (str): Path to the uploaded medical image.
    Returns:
        dict: Predicted probabilities for each condition or error message.
    """
    # Mock prediction function
    def mock_model_predict(img):
        # Return mock probabilities for demonstration purposes
        return np.array([[0.1, 0.2, 0.3, 0.1, 0.2, 0.1]])

    # Process the image
    try:
        if image_path.lower().endswith(".dcm"):
            # Handle DICOM images
            dicom_image = pydicom.dcmread(image_path)
            img = dicom_image.pixel_array
            img = np.stack((img,) * 3, axis=-1)  # Convert grayscale to RGB
            img = np.array(img, dtype="float32") / 255.0
            img = np.resize(img, (1, 224, 224, 3))
        else:
            # Handle JPEG/PNG images
            with Image.open(image_path) as img:
                img = img.resize((224, 224))
                img = np.array(img, dtype="float32") / 255.0
                img = np.expand_dims(img, axis=0)
    except Exception as e:
        return {"error": f"Failed to process the image: {e}"}

    # Predict using the mock model
    try:
        predictions = mock_model_predict(img)
    except Exception as e:
        return {"error": f"Failed to make a prediction: {e}"}

    # Define labels for the output classes
    labels = [
        "No Finding", "Pneumonia", "Effusion", "Atelectasis", "Cardiomegaly", "Edema"
    ]

    # Create a result dictionary
    result = {label: float(pred) for label, pred in zip(labels, predictions[0])}
    return result

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python analyze_image.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: The file '{image_path}' does not exist.")
        sys.exit(1)

    analysis = analyze_image(image_path)
    print(analysis)
