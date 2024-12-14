import React, { useEffect, useState } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';

const App = () => {
  const { t, i18n } = useTranslation();

  // State to store results dynamically
  const [results, setResults] = useState({ imageAnalysis: null, textAnalysis: null });

  // Function to change language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const form = document.querySelector("form");
    const imageInput = document.querySelector("input[type='file']");
    const textInput = document.querySelector("textarea");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData();
      if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
      }
      if (textInput.value.trim()) {
        formData.append("text", textInput.value);
      }

      fetch("/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // Update results state with fetched data
          setResults({
            imageAnalysis: data.image_analysis,
            textAnalysis: data.text_analysis,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }, []);

  return (
    <div className="app">
      <header>
        <h1>{t('welcome')}</h1>
        <nav>
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('ar')}>العربية</button>
        </nav>
      </header>

      <main>
        <form>
          <label>{t('uploadImage')}:
            <input type="file" accept="image/*" />
          </label>
          <br />
          <label>{t('enterText')}:
            <textarea placeholder={t('typeHere')} rows="4"></textarea>
          </label>
          <br />
          <button type="submit">{t('submit')}</button>
        </form>

        <div className="results">
          {/* Display image analysis results dynamically */}
          {results.imageAnalysis && (
            <div className="result-item">
              <h2>{t('imageAnalysis')}</h2>
              <p>{results.imageAnalysis.Result || results.imageAnalysis.error}</p>
              {results.imageAnalysis.image_url && (
                <img src={results.imageAnalysis.image_url} alt="Processed Image" />
              )}
            </div>
          )}

          {/* Display text analysis results dynamically */}
          {results.textAnalysis && (
            <div className="result-item">
              <h2>{t('textAnalysis')}</h2>
              {Object.entries(results.textAnalysis).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
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
