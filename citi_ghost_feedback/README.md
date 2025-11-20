# Citi Ghost Feedback

Local-first feedback toolbar that teams can embed into any Citi web experience. The floating “Citi Ghost” widget captures context, takes html2canvas screenshots, and ships the payload to a lightweight Flask API that stores rows in `tickets.xlsx` plus PNG screenshots.

## Repo Layout

```
citi_ghost_feedback/
├── frontend/
│   ├── index.html          # Demo portal with multiple sample UIs
│   ├── styles.css          # Citi dark theme styling
│   ├── widget.js           # Embeddable toolbar + modal logic
│   └── html2canvas.min.js  # Local copy (v1.4.1)
├── backend/
│   ├── app.py              # Flask app + Excel/screenshot storage
│   ├── requirements.txt
│   ├── tickets.xlsx        # Auto-generated at runtime
│   └── screenshots/        # Screenshot PNG output
└── README.md
```

## Running the Backend

# 1. Go to the backend folder
cd citi_ghost_feedback/backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Allow PowerShell to run activation scripts (session–only)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# 4. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run the Flask backend
python app.py

The Flask service listens on `http://127.0.0.1:5000`. On start it ensures:

- `screenshots/` directory exists.
- `tickets.xlsx` has the header row `["Ticket ID", "Role", "URL", "Description", "Screenshot Path", "User Agent", "Timestamp"]`.

Every feedback POST appends a new worksheet row and optionally writes a PNG under `screenshots/` using UTC timestamps (example: `20240514_154055_a3f2c9d2.png`).

## Trying the Frontend Demo

1. Open `citi_ghost_feedback/frontend/index.html` in any modern browser (double-click or serve it via `python -m http.server` if you prefer localhost URLs).
2. Ensure the backend is running so submissions succeed.
3. Use the floating Citi Ghost toolbar to capture screenshots, enter descriptions, and submit feedback.

The widget also works when embedded into other HTML apps—just drop in:

```html
<script src="/path/to/html2canvas.min.js"></script>
<script src="/path/to/widget.js"></script>
```

All widget styles are injected automatically, so no extra CSS dependencies are required.

## API Contract

`POST /submit-feedback`

```json
{
  "role": "Client",
  "description": "Report module froze on submit",
  "url": "http://localhost:8080/deal-book",
  "userAgent": "Mozilla/5.0 ...",
  "screenshot": "data:image/png;base64,iVBOR..." // optional
}
```

Response:

```json
{ "status": "success", "ticket_id": 3, "timestamp": "2024-05-14 15:40:55" }
```

## Design Notes

- **Citi Dark Theme** colors drive every surface (primary `#0A1224`, secondary `#111C33`, Citi blue accent `#255BE3`, cyan edge `#2DAEF7`, warning red `#FF3C28`). 
- **Custom CSS Ghost Icon** appears in the navbar, toolbar, and modal header. The SVG path is unique—rounded cap with a wavy skirt and expressive face—not derived from existing brand marks.
- **html2canvas** is bundled locally so screenshots continue to work offline.
- **Local-first storage** keeps feedback files on-disk for regulated environments—no cloud services, no databases, easy to archive.

## Next Ideas

- Render submitted tickets inside the menu once the Excel rows are ingested.
- Add authentication hooks for Citi SSO or local tokens.
- Stream events to Splunk/SIEM by tailing the Excel workbook or mirroring data into CSVs.
