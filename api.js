document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#analysis-form");
    const spinner = document.querySelector("#spinner");
    const resultsContainer = document.querySelector("#results .result-container");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    
        spinner.classList.remove("hidden");
        resultsContainer.innerHTML = "";
    
        const formData = new FormData(form);
    
        fetch("/analyze-image", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                spinner.classList.add("hidden");
                displayResults(data);
            })
            .catch((error) => {
                spinner.classList.add("hidden");
                resultsContainer.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            });
    });
    
    function displayResults(data) {
        if (data.image_analysis) {
            const imageResult = document.createElement("div");
            imageResult.className = "result-item border-l-4 border-blue-500 p-4";
            imageResult.innerHTML = `
                <h3 class="text-blue-600 font-semibold">Image Analysis</h3>
                <p>${data.image_analysis.Result || data.image_analysis.error}</p>
                ${data.image_url ? `<img src="${data.image_url}" alt="Processed Image" class="mt-2">` : ""}
            `;
            resultsContainer.appendChild(imageResult);
        }

        if (data.text_analysis) {
            const textResult = document.createElement("div");
            textResult.className = "result-item border-l-4 border-green-500 p-4";
            textResult.innerHTML = `
                <h3 class="text-green-600 font-semibold">Text Analysis</h3>
                ${Object.entries(data.text_analysis)
                    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                    .join("")}
            `;
            resultsContainer.appendChild(textResult);
        }
    }
});
