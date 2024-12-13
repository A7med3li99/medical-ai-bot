import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4001');

function App() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [realTimeMessages, setRealTimeMessages] = useState([]);

    const askAI = async () => {
        try {
            const response = await fetch('http://localhost:4001/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await response.json();
            setAnswer(data.answer);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Real-time communication with Socket.IO
    socket.on('real-time-message', (message) => {
        setRealTimeMessages((prevMessages) => [...prevMessages, message]);
    });

    return (
        <div>
            <h1>Medical Assistant for Doctors</h1>
            <textarea
                placeholder="Ask a medical question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            ></textarea>
            <button onClick={askAI}>Ask</button>
            {answer && (
                <div>
                    <h2>Answer:</h2>
                    <p>{answer}</p>
                </div>
            )}

            <div>
                <h2>Real-Time Messages:</h2>
                <ul>
                    {realTimeMessages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
