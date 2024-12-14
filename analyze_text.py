from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# تحميل النموذج المناسب
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

def analyze_text(question):
    """
    تحليل النصوص باستخدام Bio_ClinicalBERT.
    Args:
        question (str): النص الطبي المراد تحليله.
    Returns:
        dict: التوقعات، الاحتمالات، والكلمات المفتاحية.
    """
    try:
        inputs = tokenizer(question, return_tensors="pt", truncation=True, padding=True)
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)
        prediction = torch.argmax(probabilities, dim=-1).item()
        keywords = question.split()[:5]  # استخراج الكلمات المفتاحية (أبسط مثال)

        return {
            "prediction": prediction,
            "probabilities": probabilities.tolist(),
            "keywords": keywords
        }
    except Exception as e:
        return {"error": f"Error analyzing text: {str(e)}"}

if __name__ == "__main__":
    import sys
    question = sys.argv[1] if len(sys.argv) > 1 else None
    if question:
        print(analyze_text(question))
    else:
        print({"error": "No input text provided"})
