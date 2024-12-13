from flask import Flask, request, jsonify
from transformers import pipeline, AutoModelForImageClassification, AutoFeatureExtractor
from sentence_transformers import SentenceTransformer, util
from PIL import Image
import torch

app = Flask(__name__)

# إعداد النماذج
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-ar")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
sentiment_model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")
similarity_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
text_generation_model = pipeline("text-generation", model="microsoft/BioGPT")
image_model_name = "google/vit-base-patch16-224"
image_feature_extractor = AutoFeatureExtractor.from_pretrained(image_model_name)
image_model = AutoModelForImageClassification.from_pretrained(image_model_name)

# 1. الترجمة
@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Text is required'}), 400

    translation = translator(text, max_length=500)
    return jsonify({'translation': translation[0]['translation_text']})

# 2. التلخيص
@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Text is required'}), 400

    summary = summarizer(text, max_length=130, min_length=30, do_sample=False)
    return jsonify({'summary': summary[0]['summary_text']})

# 3. تحليل المشاعر
@app.route('/sentiment', methods=['POST'])
def sentiment():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Text is required'}), 400

    sentiments = sentiment_model(text)
    return jsonify({'sentiments': sentiments})

# 4. الإجابة على الأسئلة
@app.route('/qa', methods=['POST'])
def question_answering():
    data = request.json
    question = data.get('question', '')
    context = data.get('context', '')
    if not question or not context:
        return jsonify({'error': 'Question and context are required'}), 400

    answer = qa_model(question=question, context=context)
    return jsonify({'answer': answer['answer']})

# 5. تشابه النصوص
@app.route('/similarity', methods=['POST'])
def similarity():
    data = request.json
    text1 = data.get('text1', '')
    text2 = data.get('text2', '')
    if not text1 or not text2:
        return jsonify({'error': 'Two texts are required'}), 400

    embeddings1 = similarity_model.encode(text1, convert_to_tensor=True)
    embeddings2 = similarity_model.encode(text2, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embeddings1, embeddings2)
    return jsonify({'similarity': similarity.item()})

# 6. توليد النصوص الطبية
@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    generated = text_generation_model(prompt, max_length=200, num_return_sequences=1)
    return jsonify({'generated_text': generated[0]['generated_text']})

# 7. تحليل الصور
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400

    image_file = request.files['image']
    image = Image.open(image_file).convert("RGB")
    inputs = image_feature_extractor(images=image, return_tensors="pt")
    outputs = image_model(**inputs)
    logits = outputs.logits
    predicted_class_idx = torch.argmax(logits, dim=-1).item()
    return jsonify({'predicted_class': image_model.config.id2label[predicted_class_idx]})

# تشغيل التطبيق
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
