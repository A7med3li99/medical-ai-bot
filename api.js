document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const imageInput = document.querySelector("input[type='file']");
    const textInput = document.querySelector("textarea");
    const resultsContainer = document.getElementById("results");

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
                displayResults(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });

    function displayResults(data) {
        resultsContainer.innerHTML = ""; // Clear previous results

        if (data.image_analysis) {
            const imageResult = document.createElement("div");
            imageResult.className = "result-item";
            imageResult.innerHTML = `<h2>Image Analysis</h2><p>${data.image_analysis.Result || data.image_analysis.error}</p>`;
            if (data.image_url) {
                imageResult.innerHTML += `<img src="${data.image_url}" alt="Processed Image">`;
            }
            resultsContainer.appendChild(imageResult);
        }

        if (data.text_analysis) {
            const textResult = document.createElement("div");
            textResult.className = "result-item";
            textResult.innerHTML = `<h2>Text Analysis</h2>`;
            for (const [key, value] of Object.entries(data.text_analysis)) {
                textResult.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
            }
            resultsContainer.appendChild(textResult);
        }
    }
});
