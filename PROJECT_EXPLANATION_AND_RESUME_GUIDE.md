# Sanchalak (संचालक) — The Glass-Box Dispatcher
### Comprehensive Project Explanation, Unique Features & Resume Portfolio Guide

---

## 📌 1. What is Sanchalak in Simple Words?

Imagine **Air Traffic Control (ATC)**, but for the Indian Railways.

In India today, deciding which train gets to go first and which train has to wait on a side loop track (called "dispatching" or "precedence") is done **completely by hand** by a human called a **Section Controller** (*Sanchalak* / संचालक). 
- The existing software on their monitors only draws colored lines and shows where trains are—**it does not make decisions**.
- When corridors are crowded and trains are delayed, a single controller has to manage 10–20 trains simultaneously in their head.
- Because of this manual dispatching, Indian Railways' punctuality fell from **94% to ~74%**, and the busiest corridors operate at **120%+ of rated capacity**.
- Worse, on 2 June 2023 near **Balasore (Bahanaga Bazar)**, a signalling circuit failure routed the *Coromandel Express* into an occupied loop line at 128 km/h, leading to nearly 300 fatalities.

### The Solution:
**Sanchalak** is an open-source, explainable **AI Co-Pilot** built specifically for the Indian Railways section controller. It maps directly to the Ministry of Railways' flagship Smart India Hackathon problem statement (**SIH25022**): *"Maximizing section throughput through AI-powered, real-time train traffic control."*

Unlike proprietary foreign systems (from Siemens, Alstom, Hitachi) that cost upwards of ₹1,000+ Crore and act as "black boxes" that controllers don't trust, Sanchalak is:
1. **Explainable ("Glass-Box"):** It explains every single decision in plain, human English with mathematical justification (e.g., *"Held Express train for 11 mins so Superfast could pass, because reversing this order causes 1.7× more passenger delay"*).
2. **Physically Un-crashable:** It separates safety from optimization. A hard-coded **Interlocking Safety Floor** makes collisions physically impossible—even if the AI algorithm makes a mistake or a human sets a wrong route.
3. **Controller-First Decision Support:** The human controller remains in charge. They can query the system (*"What if I override this?"*) and see the exact delay cost before deciding.

---

## ⚙️ 2. Step-by-Step: How Sanchalak Works Under the Hood

Here is the exact step-by-step lifecycle of how Sanchalak controls train traffic in real time:

```
[ Real Railway Corridor & Timetable Data ]
                     │
                     ▼
       Step 1: Digital Twin Simulation
  (Tracks, Block Sections, Signal States, Speeds)
                     │
                     ▼
          Step 2: Conflict Detection
   (Head-on clashes, single-line bottlenecks, trailing merges)
                     │
                     ▼
        Step 3: Interlocking Safety Floor
  (Hard Invariant: At most 1 train per block; locks direction)
                     │
                     ▼
          Step 4: AI Heuristic Optimizer
   (Evaluates ordering permutations weighted by train priority)
                     │
                     ▼
        Step 5: Glass-Box Explanation Engine
  (Translates decision variables into plain English rationale)
                     │
                     ▼
     Step 6: Section Controller Interactive Copilot
   (Answers "Why held?", "What if override?", 100% offline)
```

### Step 1: Real-World Corridor Modeling (Digital Twin)
- Models the real **Kharagpur–Bhadrak corridor** (South Eastern Railway, eastern India) including real stations (*Kharagpur, Jaleswar, Basta, Soro, Bahanaga Bazar, Balasore, Rupsa, Bhadrak*).
- Integrates coordinate data from **8,697 real Indian stations** (DataMeet CC0 dataset) and real passenger timetables (*Coromandel Express, Purushottam Superfast, Jagannath Express, etc.*).
- Models track physics: single-line vs. double-line tracks, block sections, permissible speeds, loop line capacities, and commercial dwell times.

### Step 2: Conflict & Contention Detection
- As trains advance along the corridor, the simulation engine continuously projects their future trajectories.
- It detects conflicts before they happen:
  - **Head-on conflicts:** Two trains traveling in opposite directions toward the same single-line section.
  - **Trailing conflicts / Overtakes:** A faster premier train (e.g., Superfast at 130 km/h) catching up to a slower freight or passenger train (65 km/h) on the same track.
  - **Station loop bottlenecks:** Multiple trains arriving at a station with limited loop tracks to hold them.

### Step 3: The Interlocking Safety Floor (Zero-Collision Guarantee)
- **Safety is decoupled from AI.** 
- Before the AI can even suggest a movement, the interlocking layer validates track rules:
  - **Rule 1 (Block Occupancy):** Strictly maximum of ONE train per block section.
  - **Rule 2 (Direction Locking):** Single-line sections lock their direction until cleared.
  - **Rule 3 (Loop Limits):** A train can only be routed to a station loop if a loop line is physically vacant.
- If a route would lead to an occupied line (the exact Balasore disaster failure mode), the interlocking **refuses the admission** and halts the train at the home signal. No AI policy or human action can bypass this.

### Step 4: Priority-Weighted AI Dispatcher Optimization
- When multiple trains contend for the same track section, the optimizer generates all feasible ordering permutations.
- It calculates the total penalty cost using a **Priority-Weighted Delay Function**:
  $$\text{Cost} = \sum (\text{Delay Seconds} \times \text{Class Weight})$$
- Priority weights reflect Indian Railways hierarchy:
  - **Special / Vande Bharat / Rajdhani / Relief Trains:** Highest Weight ($\times 5$)
  - **Superfast Express:** High Weight ($\times 4$)
  - **Mail / Express:** Medium Weight ($\times 3$)
  - **Passenger (Slow Local):** Lower Weight ($\times 2$)
  - **Goods / Freight:** Base Weight ($\times 1$)
- The optimizer selects the permutation that minimizes total system-wide weighted delay.

### Step 5: The "Glass-Box" Explanation Engine
- Unlike neural networks that provide an answer with no justification, Sanchalak inspects the optimizer's internal decision matrix:
  - The delay each option would cost.
  - The alternative option that was rejected.
  - The specific multiplier difference.
- It instantly converts these metrics into transparent, auditable English sentences:
  > *"Cleared 12801 (Purushottam SF); held 18045 (East Coast Exp). Holding 12801 instead would cost 18.5 weighted-min vs 10.8 for this plan (1.7× worse), because holding the higher-priority train multiplies passenger delay."*

### Step 6: Interactive Offline Controller Copilot
- The section controller can type plain questions directly into the terminal or click pre-set queries:
  - *"Why is 12801 held?"* $\rightarrow$ Gives immediate audit breakdown.
  - *"Is the section safe?"* $\rightarrow$ Reports safety status and count of prevented unsafe admissions.
  - *"What if I override?"* $\rightarrow$ Calculates the exact tradeoff: *"Allowing the held train to go first will add ~7.7 weighted-minutes. The controller remains in command; this is your tradeoff."*
- **100% Deterministic & Offline:** Runs without internet or external LLM API calls, ensuring zero latency and zero hallucinations.

---

## 🌟 3. All Unique Features (Why Sanchalak Stands Out)

| # | Unique Feature | How It Works / Why It Matters |
|---|----------------|-------------------------------|
| **1** | **Glass-Box Explainability** | No black-box mystery. Every precedence decision is converted into a transparent, audit-ready explanation based on actual mathematical penalty weights. |
| **2** | **Decoupled Interlocking Safety Floor** | Safety rules are hardcoded in a separate verification layer. Even in the event of an AI anomaly or signal mis-wiring, accidents are blocked by code invariants. |
| **3** | **Live A/B Dispatcher Toggle** | Switch seamlessly in real-time between the **AI Optimizer** and **FCFS (First-Come-First-Served)** baseline to visibly demonstrate delay reduction and throughput gains. |
| **4** | **Re-staging of the 2023 Balasore Disaster** | Includes a dedicated historical scenario that simulates the Balasore condition (a route set toward an occupied track). Proves Sanchalak's interlocking halts the train before entry. |
| **5** | **Deterministic Offline Copilot** | Natural language Q&A engine built on decision traces. No external API keys, zero network latency, and zero hallucinations. |
| **6** | **Disruption Recovery & Dynamic Re-planning** | Allows blocking an entire track section mid-simulation to simulate a broken rail or fallen tree; the optimizer dynamically re-routes and reschedules traffic on the fly. |
| **7** | **Interactive String-Line (Time-Distance) Chart** | Displays the standard railway operational diagram used by controllers worldwide, plotting distance vs. time curves for every train. |
| **8** | **Zero Cloud Dependencies** | Runs 100% in the client browser with bundled fonts, vector SVG graphics, and offline datasets. Reliable even in remote railway control cabins with spotty internet. |

---

## 📊 4. Measured Results & Impact Metrics

In side-by-side benchmark testing against the traditional manual / FCFS baseline on the Kharagpur–Bhadrak peak hour corridor:
- 📉 **20% to 25% Reduction in Priority-Weighted Delay** across the section.
- ⏱️ **~1.46 Lakh Passenger-Minutes Saved** in a single peak operational window.
- 🚄 **33% Reduction in Delays for Superfast / Premier Trains** (arriving ~27 minutes sooner).
- 🛡️ **Zero (0) Unsafe States:** 100% safety invariant enforcement across 12 automated regression and fuzz tests.

---

## 💻 5. Technology Stack & Architecture

- **Frontend / UI:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Hand-drawn Interactive SVG (Track schematic, Time-distance stringline, Geographic map).
- **Simulation Engine:** Custom Discrete-Event Railway Simulation in TypeScript (Block section progression, signal interlocking, train kinematics).
- **Optimization Layer:** Operations Research (OR) Heuristic with Look-Ahead permutation search.
- **Explainability & Copilot:** Deterministic Natural Language Generation (NLG) engine mapped to solver variables.
- **Testing & Quality:** Vitest (12 comprehensive unit and invariant tests covering collision prevention, deadlock avoidance, and optimization bounds).
- **Build & Tooling:** Vite 5, Node.js, PostCSS.

---

## 📝 6. Resume Ready Formats

Choose the format that best fits your resume layout:

### Option A: 3-Bullet Compact Format (Ideal for standard Software Engineer / Full-Stack resumes)

> **Sanchalak — Explainable AI Train Dispatching & Traffic Optimization System** | *React, TypeScript, Tailwind, Operations Research, Vitest*
> - Engineered an explainable AI co-pilot for Indian Railways section controllers addressing **SIH25022**, cutting section delay by **20–25%** and saving **1.46L+ passenger-minutes** during peak hours.
> - Implemented a two-tier decoupled architecture separating a hard-coded **Interlocking Safety Floor** (zero-collision invariant) from an **Operations Research Dispatcher** optimizing priority-weighted delays.
> - Developed a zero-latency, deterministic **Glass-Box Explanation Engine** and interactive natural language copilot that audited dispatch choices and what-if overrides without external LLM dependencies.

---

### Option B: Detailed 4-Bullet Format (Ideal for AI / Systems Engineering resumes)

> **Sanchalak — Glass-Box Railway Traffic Optimization & Safety Interlocking** | *TypeScript, React 18, Vite, Vitest, Algorithms*
> - Designed and built a real-time railway digital twin simulating the Kharagpur–Bhadrak corridor with 8,697 real station coordinates and multi-class passenger timetables (Vande Bharat to Freight).
> - Formulated an operations-research heuristic solver that evaluates feasible train ordering permutations at single-line bottlenecks, reducing premier train delays by **33%**.
> - Enforced strict safety invariants via a decoupled interlocking layer that refuses admission to occupied blocks, successfully validating against the 2023 Balasore disaster failure mode.
> - Built interactive visualization panels including live track schematics, SVG time-distance string-line charts, and a side-by-side A/B toggle comparing AI vs. manual FCFS dispatching.

---

## 🎯 7. STAR Method Breakdown (For Interviews)

When an interviewer asks: *"Tell me about a complex project you built,"* use this script:

- **Situation:** *"In Indian Railways, train dispatching is done manually by human section controllers. When congested, delays snowball, punctuality drops, and cognitive overload can lead to catastrophic mistakes like the 2023 Balasore tragedy where a train entered an occupied loop line."*
- **Task:** *"We wanted to build an intelligent dispatching assistant that maximizes line throughput and prioritizes premier passenger trains, while ensuring absolute safety and providing plain-English explanations so human controllers actually trust and adopt it."*
- **Action:** 
  - *"I developed Sanchalak with a two-tier architecture: an Interlocking Safety Floor that guarantees at most one train per block section, and an Operations Research AI Optimizer that minimizes priority-weighted delay.*
  - *To avoid black-box mistrust, I built a 'Glass-Box' explanation engine that reads the solver's internal penalty variables and generates real-time plain language rationales.*
  - *I added an interactive offline copilot that lets controllers evaluate 'what-if' overrides before making dispatch decisions."*
- **Result:** *"The system achieved a 20–25% reduction in weighted delay, cut premier train lateness by 33%, maintained a 100% zero-collision safety record across automated tests, and successfully passed a simulated re-staging of the Balasore incident by auto-refusing the hazardous route."*

---

## ❓ 8. Top Interview Questions & Winning Answers

#### Q1: "Why did you use Operations Research heuristics instead of Reinforcement Learning (RL) or Deep Learning?"
> **Answer:** *"In train dispatching benchmarks like the global Flatland Challenge (organized by SBB, DB, and SNCF), classical Operations Research heuristics consistently outperform Reinforcement Learning. RL models suffer from sample inefficiency, unpredictable edge cases, and lack of mathematical explainability. In railway control, predictability and explainability are non-negotiable, which made an OR look-ahead heuristic the superior engineering choice."*

#### Q2: "Is Sanchalak an alternative to Kavach (India's Automatic Train Protection system)?"
> **Answer:** *"No, Sanchalak is strictly complementary to Kavach. Kavach is the certified track-and-locomotive hardware layer that enforces emergency braking and anti-collision signals. Sanchalak is the operational intelligence and throughput layer above it that decides precedence and routing. Sanchalak calculates optimal traffic flow, while Kavach and interlocking enforce safety at the physical layer."*

#### Q3: "Why is the copilot deterministic instead of using ChatGPT / OpenAI APIs?"
> **Answer:** *"Three reasons: First, railway control cabins cannot rely on high-latency or unstable internet connections. Second, commercial LLMs can hallucinate reasoning that contradicts physical reality. Third, Sanchalak's explanation engine inspects the actual mathematical cost functions of the solver, ensuring 100% factual fidelity and zero operational risk."*
