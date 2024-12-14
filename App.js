// Updated App.js
import React, { useEffect, useState } from 'react';
import './styles.css';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import './i18n';

const App = () => {
  const { t, i18n } = useTranslation();

  const [results, setResults] = useState({ imageAnalysis: null, textAnalysis: null });

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const form = document.querySelector('form');
    const imageInput = document.querySelector("input[type='file']");
    const textInput = document.querySelector('textarea');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData();
      if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
      }
      if (textInput.value.trim()) {
        formData.append('text', textInput.value);
      }

      fetch('/', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setResults({
            imageAnalysis: data.image_analysis,
            textAnalysis: data.text_analysis,
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  }, []);

  const renderGraph = (data) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Probability',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    return <Bar data={chartData} />;
  };

  return (
    <div className="app">
      <header>
        <h1>{t('welcome')}</h1>
        <nav>
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('ar')}>العربية</button>
        </nav>
      </header>

      <main className="container">
        <form>
          <div className="form-group">
            <label>{t('uploadImage')}:</label>
            <input type="file" accept="image/*" />
          </div>

          <div className="form-group">
            <label>{t('enterText')}:</label>
            <textarea placeholder={t('typeHere')} rows="4"></textarea>
          </div>

          <button className="submit-btn" type="submit">
            {t('submit')}
          </button>
        </form>

        <div id="results">
          {results.imageAnalysis && (
            <div className="result-item">
              <h2>{t('imageAnalysis')}</h2>
              {results.imageAnalysis.Result && renderGraph(results.imageAnalysis)}
              <p>{results.imageAnalysis.Result || results.imageAnalysis.error}</p>
              {results.imageAnalysis.image_url && (
                <img src={results.imageAnalysis.image_url} alt="Processed" />
              )}
            </div>
          )}

          {results.textAnalysis && (
            <div className="result-item">
              <h2>{t('textAnalysis')}</h2>
              {Object.entries(results.textAnalysis).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer>
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
};

export default App;
