import base64
import csv
import logging
import secrets
from datetime import datetime
from pathlib import Path
from typing import Optional

from flask import Flask, jsonify, request

BASE_DIR = Path(__file__).resolve().parent
EVIDENCE_DIR = BASE_DIR / "evidence"
CSV_FILE = BASE_DIR / "feedback_storage.csv"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("citi_ghost_feedback")

app = Flask(__name__)


def ensure_storage():
    """Ensure screenshots directory and workbook exist before serving requests."""
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    # Create CSV storage with header if not present
    if not CSV_FILE.exists():
        logger.info("feedback_storage.csv not found. Creating a new CSV with header.")
        header = [
            "Unique ID",
            "Summary",
            "Issue Type",
            "Description",
            "Portfolio",
            "Reporter SOEID",
            "Assignee SOEID",
            "Reporter",
            "Planned Start",
            "Planned End",
            "Parent ID",
            "Epic Link",
            "Evidence Path",
            "Timestamp",
        ]
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(header)


ensure_storage()


def save_screenshot(data_url: str) -> str:
    """Save a base64 screenshot to disk and return the relative path (relative to BASE_DIR)."""
    try:
        header, encoded = data_url.split(",", 1)
    except ValueError:
        raise ValueError("Invalid screenshot payload")

    filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}.png"
    path = EVIDENCE_DIR / filename
    image_bytes = base64.b64decode(encoded)
    with open(path, "wb") as f:
        f.write(image_bytes)
    logger.info("Saved evidence to %s", path)
    return str(path.relative_to(BASE_DIR))


def _next_unique_id() -> int:
    """Determine next numeric Unique ID by reading existing CSV. Starts at 1."""
    try:
        with open(CSV_FILE, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            max_id = 0
            for row in reader:
                try:
                    uid = int(row.get("Unique ID", "0") or 0)
                    if uid > max_id:
                        max_id = uid
                except ValueError:
                    continue
            return max_id + 1
    except FileNotFoundError:
        return 1


def append_feedback(
    summary: str,
    issue_type: str = "Task",
    description: Optional[str] = None,
    portfolio: Optional[str] = None,
    reporter_soeid: Optional[str] = None,
    assignee_soeid: Optional[str] = None,
    reporter: Optional[str] = None,
    planned_start: Optional[str] = None,
    planned_end: Optional[str] = None,
    parent_id: Optional[str] = None,
    epic_link: Optional[str] = None,
    evidence_path: Optional[str] = None,
):
    unique_id = _next_unique_id()
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    row = [
        unique_id,
        summary or "",
        issue_type or "",
        description or "",
        portfolio or "",
        reporter_soeid or "",
        assignee_soeid or "",
        reporter or "",
        planned_start or "",
        planned_end or "",
        parent_id or "",
        epic_link or "",
        evidence_path or "",
        timestamp,
    ]
    with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(row)
    logger.info("Appended feedback %s", unique_id)
    return unique_id, timestamp


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/submit-feedback", methods=["POST", "OPTIONS"])
def submit_feedback():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(force=True, silent=True) or {}
    # Map incoming payload to our CSV-backed append_feedback function
    summary = payload.get("summary", "").strip() or payload.get("description", "").strip()
    issue_type = payload.get("issue_type", "Task")
    description = payload.get("description", "").strip()
    portfolio = payload.get("portfolio")
    reporter_soeid = payload.get("reporter_soeid")
    assignee_soeid = payload.get("assignee_soeid")
    reporter = payload.get("reporter")
    planned_start = payload.get("planned_start")
    planned_end = payload.get("planned_end")
    parent_id = payload.get("parent_id")
    epic_link = payload.get("epic_link")
    url = payload.get("url", "").strip()
    user_agent = payload.get("userAgent", "Unknown")
    screenshot_data = payload.get("screenshot")

    if not description and not summary:
        logger.warning("Description or summary missing from payload")
        return jsonify({"status": "error", "message": "Description or summary is required"}), 400

    evidence_path = ""
    if screenshot_data:
        try:
            evidence_path = save_screenshot(screenshot_data)
        except Exception as exc:  # broad to ensure request still stored
            logger.error("Failed to save screenshot: %s", exc)
            return (
                jsonify({"status": "error", "message": "Invalid screenshot data"}),
                400,
            )

    try:
        ticket_id, timestamp = append_feedback(
            summary=summary,
            issue_type=issue_type,
            description=description,
            portfolio=portfolio,
            reporter_soeid=reporter_soeid,
            assignee_soeid=assignee_soeid,
            reporter=reporter,
            planned_start=planned_start,
            planned_end=planned_end,
            parent_id=parent_id,
            epic_link=epic_link,
            evidence_path=evidence_path,
        )
    except Exception as exc:
        logger.exception("Unable to append feedback: %s", exc)
        return jsonify({"status": "error", "message": "Failed to store feedback"}), 500

    return jsonify({"status": "success", "ticket_id": ticket_id, "timestamp": timestamp})


if __name__ == "__main__":
    ensure_storage()
    app.run(host="127.0.0.1", port=5000, debug=True)
