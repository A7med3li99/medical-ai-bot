import sys

if len(sys.argv) < 2:
    print("Error: Please provide a question as an argument.")
    sys.exit(1)

question = sys.argv[1]

def process_question(question):
    """
    Simulates processing the medical question.
    Args:
        question (str): The medical question to process.
    Returns:
        str: A mock response.
    """
    return f"This is a mock response to your question: '{question}'"

# Simulate processing the question
response = process_question(question)
print(response)
