import numpy as np
from PIL import Image
import logging
import torchvision.transforms as transforms

# إعداد سجل الأخطاء
logging.basicConfig(
    filename="medical_ai_api.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

def analyze_image(image_path=None):
    """
    تحليل الصور الطبية باستخدام نموذج Mock.
    """
    def mock_model_predict(img):
        return np.random.rand(1, 6)

    try:
        labels = ["No Finding", "Pneumonia", "Effusion", "Atelectasis", "Cardiomegaly", "Edema"]
        if image_path:
            img = Image.open(image_path).convert("RGB")
            transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5], std=[0.5])
            ])
            img_tensor = transform(img).unsqueeze(0)
        else:
            raise ValueError("Image path is required")

        predictions = mock_model_predict(None)
        diagnosis = [label for label, pred in zip(labels, predictions[0]) if pred > 0.2]

        return {
            "probabilities": {label: float(pred) for label, pred in zip(labels, predictions[0])},
            "diagnosis": diagnosis
        }
    except Exception as e:
        logging.error(f"Error analyzing image: {e}")
        return {"error": f"Failed to analyze image: {e}"}

if __name__ == "__main__":
    import sys
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    if image_path:
        print(analyze_image(image_path))
    else:
        print({"error": "No input image provided"})
