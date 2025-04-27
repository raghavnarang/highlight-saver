const OPENAI_API_KEY =
  "API_KEY"; // <-- Replace this with your real API key

async function loadHighlights() {
  const { highlights } = (await chrome.storage.local.get("highlights")) || {
    highlights: [],
  };
  const list = document.getElementById("highlight-list");
  list.innerHTML = "";

  if (!highlights || highlights.length === 0) {
    list.innerHTML = "<p>No highlights yet.</p>";
    return;
  }

  highlights.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "highlight-item";
    div.innerHTML = `
      <p>"${item.text}"</p>
      <small>${new URL(item.url).hostname}</small>
      <button data-index="${index}" class="delete-btn">Delete</button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const index = e.target.dataset.index;
      highlights.splice(index, 1);
      await chrome.storage.local.set({ highlights });
      loadHighlights();
    });
  });
}

function toggleSummaryCallLoading() {
  const isLoading =
    document.getElementById("summarize-btn").innerText === "Loading...";
  if (!isLoading) {
    document.getElementById("summarize-btn").innerText = "Loading...";
    document.getElementById("summarize-btn").disabled = true;
  } else {
    document.getElementById("summarize-btn").innerText = "Summarize Highlights";
    document.getElementById("summarize-btn").disabled = false;
  }
}

document.getElementById("summarize-btn").addEventListener("click", async () => {
  const { highlights } = (await chrome.storage.local.get("highlights")) || {
    highlights: [],
  };
  const texts = highlights.map((h) => h.text).join("\n");

  if (!texts) {
    document.getElementById("summary").innerText =
      "No highlights to summarize.";
    return;
  }

  toggleSummaryCallLoading();
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "Summarize these user highlights concisely.",
          },
          { role: "user", content: texts },
        ],
      }),
    });

    const data = await response.json();
    const summary = data.choices[0].message.content;
    document.getElementById("summary").innerText = summary;
  } catch (err) {
    console.error(err);
    document.getElementById("summary").innerText = "Error generating summary.";
  }
  toggleSummaryCallLoading();
});

loadHighlights();
