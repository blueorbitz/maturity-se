# H0 Hackathon — Maturity-SE Pitch Deck

## Pre-flight: Fix Before Recording

1. Go to AWS Console > RDS > Create database
2. Choose Aurora PostgreSQL (Serverless v2 if available)
3. Connect your app to the new endpoint
4. Take a screenshot of the Aurora instance in the AWS Console (required for submission)

---

## Presentation Structure (3 minutes max)

| Section | Time | Visual | Notes |
|---------|------|--------|-------|
| Hook | 0:00–0:15 | Text animation + pain B-roll | Grab attention immediately |
| Problem | 0:15–0:40 | Talking head + icons | Who suffers, what's broken |
| Demo | 0:40–1:30 | Screen recording | Show it WORKING — this is make-or-break |
| Architecture | 1:30–2:10 | Diagram + AWS screenshot | Judges are AWS Database leads |
| Impact | 2:10–2:40 | Talking head + montage | Why this matters, conviction |
| Close | 2:40–3:00 | Logo + URL | Clean, memorable ending |

---

## Full Script

### SECTION 1 — HOOK (0:00–0:15)

**On-screen**: Full-screen text an imation. Numbers count up: `0 → 1 → 5 → 25 → 100 → ...` then freeze on a red `???`. Cut to talking head.

**B-roll**: Screen recording of a messy spreadsheet or checklist being scrolled through frantically — the "before" pain.

**Script**:
> "Engineering teams don't know where they stand. They run retros, hire consultants, fill out maturity models — and nothing changes. Because maturity assessments today are static PDFs, gut feelings, and spreadsheets nobody updates twice."

> Engineering teams don't know where they stand. Maturity models such as UX Maturity or DevOps Maturity are an example of how they depends on existing maturity model assessments. Assessment are usually a series of questions translate into a maturity profile.

**Text overlay**: "Engineering maturity is broken."

---

### SECTION 2 — PROBLEM + WHO (0:15–0:40)

**On-screen**: Split layout — left side shows role icons (Engineering Manager, CTO, VP of Engineering). Right side shows pain points fading in.

**B-roll**: Quick cuts of Slack messages, Jira boards, a calendar full of meetings — the chaos of engineering leadership.

**Script**:
> "Maturity-SE is a B2B SaaS tool for engineering leaders who need to measure, track, and improve engineering maturity across their teams — not with a one-time consultant report, but with a living, data-driven dashboard that updates as they grow."

> Maturity-SE is a B2B SaaS tool for engineering leaders who need to measure, track, and improve engineering maturity across their teams. Simplifiying hours of research, rolling out the questionnaires, curate response and get insights of how their team is progressing.

**Text overlay**: "For engineering leaders who want to know where they actually stand."

---

### SECTION 3 — PRODUCT DEMO (0:40–1:30)

**On-screen**: Screen recording of the actual app. This is the most important section. Show it live.

**Script (narrate over demo)**:
> "Here's Maturity-SE. You start by selecting an assessment framework — we cover DORA, Team Topologies, or build your own."

*(Show the assessment framework selection UI)*

> "The team answers targeted questions across dimensions like deployment frequency, incident response, code review culture."

*(Show the assessment question UI — scroll through a few questions)*

> "Results render as a radar chart with dimension scores, trend lines over time, and prioritized recommendations — not just 'you scored 3 out of 5,' but 'here's what to fix first and why.'"

*(Show the dashboard with radar chart + recommendations panel)*

> "Leaders can compare teams, track progress sprint-over-sprint, and export reports for board meetings — all in real time."

*(Show team comparison view or trend chart)*

**Critical notes for demo recording**:
- Move cursor SLOWLY — viewers need to follow
- Hover over interactive elements to show tooltips
- Keep each screen visible for 5–8 seconds minimum
- If the app loads slowly, edit out the loading time in post

---

### SECTION 4 — TECH ARCHITECTURE (1:30–2:10)

**On-screen**: Architecture diagram on screen (clean, minimal). Narrate over it.

**B-roll**: Quick flas h of the Vercel dashboard showing the deployment, then the AWS Console showing Aurora PostgreSQL.

**Script**:
> "The stack is Vercel and Next.js on the front end, scaffolded with v0 — shipped the UI in hours, not weeks."

*(Show Vercel deployment screenshot — the project dashboard)*

> "On the backend, Amazon Aurora PostgreSQL handles all assessment data, team configurations, and scoring history."

> > The stack is build on Next JS scaffolded with v0. On the backend, Amazon Aurora Postgres is used to handles all the data store -- which includes configuration, assessments, and responses.
> > We choose Aurora because of being lightweight and cost effective. It works well with the reporting nature which requires a lots of data aggregation. 
> > Bedrock is use as the AI brain to generate template. Saving hours trying to craft the questionnaire. We support BYOK or using our platform keys.

*(Show AWS Console with Aurora PostgreSQL instance — REQUIRED screenshot for submission)*

> "I chose Aurora because maturity data is relational — teams belong to organizations, assessments have versions, scores have history — and Aurora gives me ACID transactions, complex queries, and production-grade reliability without managing infrastructure."

> "Deployed on Vercel with zero-config. The whole thing took a weekend."

**Text overlay**: "Next.js + v0 + Aurora PostgreSQL"

---

### SECTION 5 — IMPACT (2:10–2:40)

**On-screen**: Back to talking head. Show conviction — lean in slightly, direct eye contact.

**B-roll**: Quick montage — a team high-fiving, a green CI pipeline passing, a graph trending upward.

**Script**:
> "Engineering maturity isn't a nice-to-have — it's the difference between teams that ship and teams that spin. Maturity-SE makes it measurable, trackable, and actionable. No more guesswork. No more stale PDFs. Just a live view of where you are and a clear path to where you want to be."

**Text overlay**: "Measure. Track. Improve."

---

### SECTION 6 — CLOSE (2:40–3:00)

**On-screen**: App logo + tagline on clean dark background. Cut to talking head for final line.

**Script**:
> "Maturity-SE. Built with Vercel v0 and Aurora PostgreSQL. Live at [YOUR-URL]. Thanks."

**Text overlay**: Project name + URL + "Built for H0 Hackathon"

---

## Canva Guide — What to Leverage

### Slide Deck Setup

1. **Start from a template**: Search "Technology Presentation" or "SaaS Pitch Deck" in Canva templates. Pick one with dark/navy theme — it reads as premium and matches AWS branding.
2. **Custom dimensions**: Set to 1920x1080 (16:9) for video export. Go to Create a Design > Custom size > 1920 x 1080 px.
3. **Brand kit**: If you have Canva Pro, set up a brand kit with your colors. If not, manually set:
   - Primary: `#0A1628` (dark navy)
   - Accent: `#00D4FF` (cyan blue — AWS-adjacent)
   - Text: `#FFFFFF` (white)
   - Secondary: `#6B7280` (muted gray for subtitles)

### Canva Features to Use

| Feature | How to use it | Why |
|---------|--------------|-----|
| **Magic Design** | Upload your screenshots, ask it to generate slide layouts | Saves layout time |
| **AI Image Generator** | Use "Text to Image" (Magic Media) for backgrounds and illustrations | See prompts below |
| **Background Remover** | Clean up talking head photos for profile slides | Professional look |
| **Animate** | Apply "Rise" or "Pan" animations to text and elements | Smooth transitions |
| **Transitions** | Use "Dissolve" or "Circle" between slides | Polished feel |
| **Charts** | Insert > Charts > Radar chart for your maturity scores | Match your app's UI |
| **Video Recording** | Record yourself directly in Canva (Record button) | No extra software needed |
| **Video Export** | Download as MP4 with all animations baked in | One file, ready for YouTube |
| **QR Code** | Add a QR code linking to your live demo | Judges can try it themselves |

### Canva Video Workflow

1. Create your slides in Canva (1920x1080)
2. Add animations to each element (keep it subtle — "Rise" or "Fade")
3. Record yourself talking over each slide using Canva's Record feature
4. OR: Export slides as images, edit in CapCut with screen recordings + talking head
5. Export as MP4 (1080p)

### Slide Design Rules

- **Max 3 lines of text per slide** — you're narrating, not reading
- **Large fonts**: Title 60pt+, body 32pt+ — must be readable at 720p
- **High contrast**: White text on dark backgrounds, or dark text on light backgrounds
- **One idea per slide** — don't cram
- **Screenshots at 100% zoom** — never blurry or scaled down
- **Consistent spacing** — use Canva's grid/snap guides

---

## AI Image Generation Prompts (for Canva Magic Media or SeeDream)

### Slide Backgrounds

**Hook slide — dark tech aesthetic:**
```
Minimal dark gradient background, abstract engineering blueprint lines, subtle grid pattern, deep navy blue to black, clean modern tech aesthetic, no text, no people, 16:9 aspect ratio, high resolution
```

**Architecture slide — clean white:**
```
Clean white background with subtle light gray circuit board pattern, minimal, corporate tech style, no text, 16:9, soft even lighting, professional
```

**Impact slide — upward momentum:**
```
Abstract upward trending graph lines glowing cyan and blue on dark background, data visualization aesthetic, futuristic tech dashboard, no text, 16:9, cinematic
```

### Illustration Elements

**Engineering team icon (for Problem slide):**
```
Flat illustration of diverse engineering team collaborating around a holographic dashboard, dark background, cyan and blue accent colors, modern tech style, no text, clean lines
```

**Data flow illustration (for Architecture slide):**
```
Isometric illustration of database servers connected to a web application, data flowing between them as glowing lines, dark background, AWS-style color palette blue and orange, no text, minimal
```

**Growth visualization (for Impact slide):**
```
Abstract 3D bar chart growing upward, glowing cyan bars on dark navy background, futuristic holographic style, no text, clean minimal, 16:9
```

### Closing/Branding

**Logo background:**
```
Dark navy gradient background with subtle particle effects, glowing center point, premium tech company branding aesthetic, no text, 16:9, cinematic lighting
```

---

## Recording Setup

### Talking Head (You)

- **Camera**: Phone on a tripod or stack of books, eye level
- **Lighting**: Window in front of you (face the window), or a desk lamp behind the phone
- **Background**: Plain wall, bookshelf, or tidy desk. No clutter.
- **Audio**: Record in a quiet room. Use earbuds with a mic if possible.
- **Framing**: Chest up, centered or slightly off-center (rule of thirds)

### Screen Recording

- **Tool**: OBS Studio (free) or built-in Windows/macOS recorder
- **Resolution**: 1920x1080
- **Cursor**: Increase cursor size in OS settings so viewers can follow
- **Browser**: Fullscreen the app, hide bookmarks bar, close other tabs
- **Speed**: Move mouse slowly and deliberately. Click with intention.

### Editing in Canva

1. Upload your screen recording as a video element
2. Place it as a full-slide background on your demo slides
3. Add text overlays and captions on top
4. Use Canva's timeline to sync narration with visuals
5. Export as MP4

### Editing in CapCut (Alternative)

1. Import all clips: talking head, screen recordings, Canva slides as images
2. Lay talking head on the main track
3. Cut to screen recordings during demo section
4. Add text overlays for key points
5. Add subtle background music (YouTube Audio Library — royalty-free)
6. Export at 1080p, under 3 minutes

---

## Rehearsal Checklist

- [ ] Script printed or on a second screen
- [ ] Timer running during practice — target 2:45 to 2:55 (leaves buffer)
- [ ] Demo app loaded and logged in before recording
- [ ] Browser notifications OFF, phone on silent
- [ ] Test recording: watch back for audio quality, pacing, cursor speed
- [ ] Watch without sound — does the visual story make sense?
- [ ] Watch with sound only — does the narration flow?

---

## Submission Checklist

- [ ] Aurora PostgreSQL connected + screenshot taken
- [ ] Demo video under 3 minutes, uploaded to YouTube
- [ ] Vercel project link + Vercel Team ID
- [ ] Architecture diagram (Canva or Excalidraw)
- [ ] Text description mentioning Aurora PostgreSQL by name
- [ ] Screenshot proving AWS Database usage
- [ ] Optional: publish build log on LinkedIn/medium/dev.to with #H0Hackathon

---

## Winning Criteria Alignment

| Judge Criteria | How This Script Addresses It |
|----------------|------------------------------|
| **Technical Implementation** | Architecture section shows Aurora PostgreSQL + Vercel integration, explains WHY Aurora was chosen (relational data model) |
| **Design** | Demo shows polished UI, radar charts, team comparison — full-stack thinking |
| **Impact & Real-world Applicability** | Problem section defines real audience (engineering leaders), solution is shippable |
| **Originality** | Maturity assessment done live vs. static PDFs — genuine insight |
