/* ================================
   GLOBAL VARIABLES
================================ */

const historyDiv = document.getElementById("historyList");

/* ================================
   BACKGROUND IMAGE SLIDER
================================ */

const backgroundImages = [
  "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1920&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80",
  "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=1920&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
  "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80"
];

let bgIndex = 0;
const bgImage = document.getElementById("bgImage");

if (bgImage) {
  bgImage.src = backgroundImages[0];

  setInterval(() => {
    bgImage.style.opacity = 0;
    setTimeout(() => {
      bgIndex = (bgIndex + 1) % backgroundImages.length;
      bgImage.src = backgroundImages[bgIndex];
      bgImage.style.opacity = 1;
    }, 1000);
  }, 5000);
}

/* ================================
   IMAGE GENERATOR (FIXED)
================================ */

function generate(promptId, imageId, type) {

  const input = document.getElementById(promptId);
  const resultImg = document.getElementById(imageId);
  const outputDiv = document.querySelector(".output");

  if (!input || !resultImg) {
    console.error("Element ID mismatch");
    return;
  }

  const prompt = input.value.trim();

  if (!prompt) {
    alert(`Enter ${type} description`);
    return;
  }

  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "block";

  fetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: prompt })
  })
  .then(res => {
    if (!res.ok) throw new Error("Backend error");
    return res.json();
  })
  .then(data => {
    if (loading) loading.style.display = "none";

    if (!data.base64) {
      alert("Image generation failed!");
      return;
    }

    resultImg.src = "data:image/png;base64," + data.base64;

    // ✅ SHOW OUTPUT SECTION
    const output = document.querySelector(".output");
    if (output) output.style.display = "block";

    saveHistory(`${type}: ${prompt}`, resultImg.src);
})

  .catch(err => {
    if (loading) loading.style.display = "none";
    console.error(err);
    alert("Something went wrong!");
  });
}

/* ================================
   HISTORY SYSTEM
================================ */

function saveHistory(prompt, image) {
  let data = JSON.parse(localStorage.getItem("history")) || [];
  data.push({ prompt, image });
  localStorage.setItem("history", JSON.stringify(data));
}

if (historyDiv) {
  const data = JSON.parse(localStorage.getItem("history")) || [];
  data.reverse().forEach(item => {
    historyDiv.innerHTML += `
      <div style="margin:20px">
        <p>${item.prompt}</p>
        <img src="${item.image}" width="250">
      </div>
    `;
  });
}

/* ================================
   IMAGE ACTIONS
================================ */

function downloadImage(imageId, defaultName = "image.png") {
  const img = document.getElementById(imageId);
  if (!img || !img.src) return alert("Generate image first");

  const a = document.createElement("a");
  a.href = img.src;
  a.download = defaultName;
  a.click();
}

function copyImage(imageId) {
  const img = document.getElementById(imageId);
  if (!img || !img.src) return;

  navigator.clipboard.writeText(img.src);
  alert("Image link copied!");
}

function shareImage(imageId) {
  const img = document.getElementById(imageId);
  if (!img || !img.src) return;

  if (navigator.share) {
    navigator.share({
      title: "AI Generated Image",
      url: img.src
    });
  } else {
    alert("Sharing not supported on this browser");
  }
}
