import os
import numpy as np
import matplotlib.pyplot as plt
from monai.transforms import Compose, RandGaussianNoise, RandAffine, ScaleIntensity, EnsureChannelFirst
from monai.data import create_test_image_3d
from PIL import Image

def generate_synthetic_image():
    """
    Generate a synthetic medical image using MONAI.
    Returns:
        np.ndarray: Generated 3D medical image.
    """
    try:
        # Generate a 3D test image with random objects
        image, _ = create_test_image_3d(128, 128, 128, num_objs=5, rad_max=20)

        # Apply transformations to enhance realism
        transforms = Compose([
            EnsureChannelFirst(),  # Ensure the channel dimension is first
            RandGaussianNoise(prob=1.0, mean=0.0, std=0.1),
            RandAffine(prob=1.0, translate_range=(5, 5, 5), rotate_range=(0.1, 0.1, 0.1), padding_mode='zeros'),
            ScaleIntensity()
        ])
        transformed_image = transforms(image)

        # Display a 2D slice of the 3D image
        plt.imshow(transformed_image[0, 64, :, :], cmap="gray")
        plt.title("Synthetic Medical Image Slice")
        plt.show()

        return transformed_image
    except Exception as e:
        raise RuntimeError(f"Error generating synthetic image: {e}")

def analyze_image(image_path):
    """
    Analyze a medical image (JPEG, PNG, or synthetic) using a mock model.
    Args:
        image_path (str): Path to the uploaded medical image or None for synthetic.
    Returns:
        dict: Predicted probabilities for each condition or error message.
    """
    # Mock prediction function
    def mock_model_predict(img):
        # Return mock probabilities for demonstration purposes
        return np.array([[0.1, 0.2, 0.3, 0.1, 0.2, 0.1]])

    try:
        if image_path:
            # Process real images (JPEG/PNG/DICOM)
            if image_path.lower().endswith(".dcm"):
                import pydicom
                dicom_image = pydicom.dcmread(image_path)
                img = dicom_image.pixel_array
                if len(img.shape) == 2:
                    img = np.expand_dims(img, axis=0)  # Add channel
                img = np.stack((img,) * 3, axis=-1)  # Convert grayscale to RGB
            else:
                with Image.open(image_path) as img:
                    img = img.resize((224, 224))
            img = np.array(img, dtype="float32") / 255.0
            img = np.expand_dims(img, axis=0)
        else:
            # Generate synthetic image if no path is provided
            img = generate_synthetic_image()
            img = np.expand_dims(img[0, 64, :, :], axis=0)  # Use a 2D slice with channel
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
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if not os.path.exists(image_path):
            print(f"Error: The file '{image_path}' does not exist.")
            sys.exit(1)
    else:
        image_path = None  # Use synthetic image if no path provided

    try:
        analysis = analyze_image(image_path)
        print(analysis)
    except RuntimeError as e:
        print({"error": str(e)})
