from transformers import AutoTokenizer, AutoModelForSequenceClassification
import sys

def analyze_text(question, speciality):
    model_name = "emilyalsentzer/Bio_ClinicalBERT" if speciality == "general" else "microsoft/BioGPT"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)

    inputs = tokenizer(question, return_tensors="pt")
    outputs = model(**inputs)
    probabilities = outputs.logits.softmax(dim=-1)
    prediction = probabilities.argmax().item()

    return f"Prediction: {prediction}, Probabilities: {probabilities.tolist()}"

if __name__ == "__main__":
    question = sys.argv[1]
    speciality = sys.argv[2]
    result = analyze_text(question, speciality)
    print(result)
