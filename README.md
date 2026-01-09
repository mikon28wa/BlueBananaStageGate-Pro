# 🍌 BlueBananaStageGate Pro

**Enterprise Product Governance Dashboard & Digital Thread Intelligence**

BlueBananaStageGate Pro ist eine Next-Gen Webanwendung für das Management komplexer Produktentwicklungszyklen (Stage-Gate-Prozess). Sie kombiniert strenge Governance-Regeln mit moderner KI-Unterstützung (Google Gemini) und Echtzeit-Systemintegration, um Datensilos zwischen ERP, PLM und Issue-Trackern aufzubrechen.

![Status](https://img.shields.io/badge/Status-Prototype-blue) ![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Vite%20%7C%20Gemini%20AI-indigo)

## 🌟 Hauptfunktionen

### 1. Phase-Gate Governance
Steuerung des Produktlebenszyklus durch 5 definierte Phasen (Strategie, Design, Prototyping, Sicherheit, Produktion).
- **Multi-Role Sign-off:** Erzwingt 4- oder 6-Augen-Prinzipien (z.B. muss der *Security Officer* die Sicherheitsphase freigeben).
- **Digitale Siegel:** Kryptografische Versiegelung abgeschlossener Phasen.
- **Protocol Checklist:** Manuelles Abhaken von ISO/IEC-Normen.

### 2. AI-Driven Compliance (Enterprise Intelligence)
Die integrierte KI (powered by Google Gemini) agiert als virtueller Auditor.
- **Dokumenten-Audit:** Analysiert hochgeladene Artefakte (BOMs, Specs) auf Konsistenz.
- **Risiko-Analyse:** Erstellt automatische SWOT-Analysen basierend auf dem Projektstatus.
- **Content Generation:** Erzeugt IP-Whitepaper, Marketing-Pitches und "Integration Stories" auf Knopfdruck.

### 3. Digital Thread Observability
Visualisierung der vernetzten IT-Landschaft.
- **Integration Matrix:** Zeigt Verbindungen zwischen SAP, Teamcenter, Jira und Salesforce.
- **Event Stream Simulator:** Simuliert Echtzeit-Traffic (z.B. "SAP Order Created"), der automatisch Auswirkungen auf den Phasenstatus haben kann (z.B. automatisches Entsperren einer Phase durch ein Jira-Event).

### 4. CQRS & Event Sourcing Architektur
Das Frontend simuliert eine komplexe Backend-Architektur:
- **Event Store:** Jede Aktion (Upload, Unterschrift, KI-Audit) wird als unveränderliches Event gespeichert.
- **Replay-Fähigkeit:** Der aktuelle Status wird dynamisch aus der Historie der Events berechnet (`Projections`).

---

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js (v18 oder höher)
- Ein Google Cloud API Key mit Zugriff auf **Gemini 2.5/3.0 Flash & Pro**.

### 1. Repository klonen
```bash
git clone <repository-url>
cd bluebanana-stagegate-pro
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Environment Variable setzen
Erstellen Sie eine `.env` Datei im Hauptverzeichnis:

```env
API_KEY=Ihr_Google_Gemini_API_Key_Hier
```

### 4. Anwendung starten
```bash
npm run dev
```
Die App ist nun unter `http://localhost:5173` erreichbar.

---

## 🎮 Bedienungsanleitung (User Journey)

### Rollen wechseln
Oben rechts im Header können Sie auf den Avatar klicken, um die Rolle zu wechseln. Dies ist notwendig, um verschiedene Phasen zu unterschreiben:
- **Dr. Sarah Weber (PM):** Strategie, Design, Produktion.
- **James Chen (ENG):** Design, Prototyping, Produktion.
- **Marcus Sterling (QA):** Strategie, Prototyping, Sicherheit, Produktion.
- **Elena Korv (SEC):** Sicherheit.

### Workflow Beispiel
1.  **Dokumente hochladen:** Laden Sie eine Dummy-Datei (z.B. "spec.pdf") in der Phase "Strategie" hoch.
2.  **KI-Audit:** Klicken Sie auf "Run Audit". Die KI analysiert den Status und gibt (hoffentlich) grünes Licht.
3.  **Checklisten:** Haken Sie alle manuellen Punkte ab.
4.  **Sign-off:** Unterschreiben Sie als aktueller User. Wechseln Sie dann die Rolle (oben rechts), um die zweite erforderliche Unterschrift zu leisten.
5.  **Gate Passing:** Wenn alle Bedingungen erfüllt sind, wird das Zertifikat erstellt und die nächste Phase freigeschaltet.

### Simulator nutzen
Gehen Sie auf die Seite **"Digital Thread"**.
- Starten Sie den Simulator unten rechts.
- Beobachten Sie, wie Events ("Jira Issue Closed") einlaufen.
- **Hinweis:** Ein spezielles Event ("Jira Trigger: Blocker Resolved") ist programmiert, um Phase 3 automatisch freizuschalten, falls sie blockiert wäre.

---

## 🛠 Tech Stack

- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI Integration:** Google GenAI SDK (`@google/genai`)
- **State Management:** Custom CQRS/Event Sourcing Engine (lokal im Browser)

---

## 📂 Projektstruktur

```
/src
  ├── commands/       # Command Handlers (Business Logic)
  ├── components/     # UI Components (StageCard, Matrix, etc.)
  ├── pages/          # Hauptansichten (Governance, Roadmap, etc.)
  ├── queries/        # Projections (State Berechnung aus Events)
  ├── services/       # Gemini AI Service & CQRS Manager
  ├── shared/         # Shared Types & Event Definitions
  └── App.tsx         # Root Component & Routing
```

---

**BlueBananaStageGate Pro** – *Governance meets Intelligence.*
