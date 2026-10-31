<p align="center">
  <img src="assets/images/park_scene.jpg" alt="ALVI Scene" width="280" style="border-radius:12px;" />
</p>

<h1 align="center">ALVI — Alzheimer's Voice & Cognitive Intelligence</h1>

<p align="center">
  <em>"Every voice has a history. AI helps reveal changes over time."</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Web_Audio_API-4285F4?style=flat&logo=google-chrome&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" />
</p>

---

## 🧠 What is ALVI?

**ALVI** (Alzheimer's Voice & Cognitive Intelligence) is a premium, interactive web application that combines **voice analysis**, **story recall**, and **cognitive mini-games** into a single, connected cognitive assessment journey.

ALVI is designed as a **screening and monitoring tool** — it tracks cognitive patterns over time and highlights changes worth monitoring. It does **not** diagnose Alzheimer's disease or any medical condition.

> **Disclaimer:** ALVI supports cognitive pattern monitoring and is not a diagnostic tool.

---

## ✨ Core Experiences

### 1. 🎙️ Voice Description
The user views a scene and describes it aloud using their real microphone. ALVI captures the recording and visualises the live audio waveform in real time using the Web Audio API.

### 2. 📖 Story Recall
The user listens to or reads a short story and then retells it. The interface demonstrates analysis of recall, coherence, vocabulary, and sequencing.

### 3. 🎮 MindPlay — Cognitive Games
Three interactive challenges connected directly to the story:

| Challenge | Description |
|-----------|-------------|
| **Remember** | Select objects mentioned in the story |
| **Sequence** | Place story events in the correct order |
| **Find** | Quickly identify an object from the story |

---

## 📊 Additional Modules

| Page | Purpose |
|------|---------|
| **Dashboard** | Overview of check-in history and cognitive pattern summary |
| **Analysis** | Detailed breakdown of voice and cognitive metrics |
| **Results** | Session results and comparison with personal baseline |
| **Journey** | Longitudinal timeline of all check-ins — the "Voice Journey" |
| **Pattern Explorer** | Explore trends and variations across sessions |
| **Insights** | AI-generated observations about cognitive patterns |
| **Profile** | Editable user profile with localStorage persistence |

---

## 🛠️ Technologies

| Technology | Usage |
|------------|-------|
| **HTML5** | Semantic page structure |
| **CSS3** | Page-specific styling |
| **Tailwind CSS** (CDN) | Utility-first responsive design |
| **Vanilla JavaScript** | All interactivity, navigation, and state management |
| **Web Audio API** | Real-time microphone waveform visualisation (AnalyserNode) |
| **MediaRecorder API** | Real browser microphone recording |
| **localStorage** | Client-side profile and session data persistence |
| **Chart.js** (CDN) | Data visualisation for patterns and journey charts |

> **No frameworks.** No React, Vue, Angular, or backend server required.

---

## 📁 Project Structure

```
ALVI/
├── index.html              # Landing / Dashboard
├── dashboard.html          # Dashboard (alias)
├── voice.html              # Voice Description check-in
├── story.html              # Story Recall check-in
├── mindplay.html           # MindPlay cognitive games
├── analysis.html           # Detailed analysis view
├── results.html            # Session results
├── journey.html            # Longitudinal Voice Journey timeline
├── patterns.html           # Pattern Explorer
├── insights.html           # AI Insights
├── profile.html            # User profile (editable)
│
├── css/
│   ├── global.css          # Shared styles across all pages
│   ├── dashboard.css       # Dashboard-specific styles
│   ├── voice.css           # Voice page styles
│   ├── story.css           # Story page styles
│   ├── mindplay.css        # MindPlay styles
│   ├── analysis.css        # Analysis styles
│   ├── results.css         # Results styles
│   ├── journey.css         # Journey styles
│   └── profile.css         # Profile styles
│
├── js/
│   ├── app.js              # Global app logic & profile sync
│   ├── navigation.js       # Sidebar navigation
│   ├── voice.js            # Real microphone recording & waveform
│   ├── story.js            # Story recall logic
│   ├── mindplay.js         # MindPlay game engine
│   ├── analysis.js         # Analysis page logic
│   ├── results.js          # Results page logic
│   ├── journey.js          # Journey timeline & charts
│   ├── patterns.js         # Pattern explorer logic
│   ├── insights.js         # Insights page logic
│   └── profile.js          # Profile edit/save with localStorage
│
├── assets/
│   └── images/
│       └── park_scene.jpg  # Scene image for Voice Description
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Edge, Firefox, or Safari)
- A microphone (for the Voice Description check-in)
- No server, database, or package manager required

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/alvi.git
   cd alvi
   ```

2. **Open in browser:**

   Simply open `index.html` in your browser, or use any local HTTP server:

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (npx)
   npx serve .

   # Using VS Code Live Server extension
   # Right-click index.html → Open with Live Server
   ```

3. **Navigate to** `http://localhost:8000` and explore the ALVI assessment journey.

---

## 🎯 Design Philosophy

ALVI is designed with a **premium, calm, trustworthy** aesthetic inspired by:

- Apple Health's clarity
- Linear's polish
- Modern AI healthcare products

**Design principles:**
- Sophisticated and minimal
- Generous whitespace and strong typography
- Elegant cards with subtle borders and restrained shadows
- 1440px desktop-first viewport
- No clinical or hospital-management aesthetic

### 🌊 Signature Visual: The Voice Journey

A unique waveform-to-timeline visual identity that represents:

```
╮
╰──●────●────●────◉
   Jan  Mar  May  Today
```

**Voice → Repeated Check-ins → AI Analysis → Cognitive Pattern Timeline**

---

## ⚠️ Important Notes

- **This is a frontend prototype** built for a hackathon demonstration.
- **No backend, database, or ML model** is included.
- **No real medical diagnosis** is performed. ALVI uses terms like "Pattern Change," "Variation from Personal Baseline," and "Changes Worth Monitoring."
- **Microphone recording is real** — the app uses `getUserMedia` and `MediaRecorder` for genuine audio capture.
- **Profile data** is persisted in `localStorage` (browser-local, no server).
- **Audio data** is held in memory for playback during the session and is never permanently stored.

---

## 🤝 Contributing

This is a hackathon project. Contributions, ideas, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>ALVI</strong> — Every voice has a history. AI helps reveal changes over time.
</p>
