import base64
import csv
import logging
import secrets
from datetime import datetime
from pathlib import Path
from typing import Optional

from flask import Flask, jsonify, request, send_from_directory
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
EVIDENCE_DIR = BASE_DIR / "evidence"
CSV_FILE = BASE_DIR / "feedback_storage.csv"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("citi_ghost_feedback")

# Serve frontend static files from the sibling `frontend` directory.
# Using static_url_path="" mounts static files at the root (so /index.html
# and other assets are served). We still add an explicit route for '/'
# to return index.html.
app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")


@app.route("/", methods=["GET"])
def index():
    # Serve the frontend index.html at the root URL
    return app.send_static_file("index.html")


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
            "Archive Status",
            "Board Status",
        ]
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(header)
    else:
        # Ensure Archive Status and Board Status columns exist in existing CSV
        try:
            with open(CSV_FILE, "r", newline="", encoding="utf-8") as f:
                reader = csv.reader(f)
                header = next(reader, None)
                rows = list(reader)
                updated = False
                
                if header and "Archive Status" not in header:
                    header.append("Archive Status")
                    updated = True
                    for row in rows:
                        # Add "active" as default archive status for existing rows
                        row.append("active")
                    logger.info("Added Archive Status column to existing CSV")
                
                if header and "Board Status" not in header:
                    header.append("Board Status")
                    updated = True
                    for row in rows:
                        # Add "backlog" as default board status for existing rows
                        row.append("backlog")
                    logger.info("Added Board Status column to existing CSV")
                
                if updated:
                    with open(CSV_FILE, "w", newline="", encoding="utf-8") as fw:
                        writer = csv.writer(fw)
                        writer.writerow(header)
                        writer.writerows(rows)
        except Exception as exc:
            logger.warning("Could not check/update CSV header: %s", exc)


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


def save_screenshots(data_urls: list) -> str:
    """Save multiple base64 screenshots to disk and return comma-separated paths."""
    if not data_urls:
        return ""
    paths = []
    for data_url in data_urls:
        try:
            path = save_screenshot(data_url)
            paths.append(path)
        except Exception as exc:
            logger.error("Failed to save screenshot: %s", exc)
            continue
    return ",".join(paths)  # Store as comma-separated paths


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
        "active",  # Default archive status
        "backlog",  # Default board status
    ]
    with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(row)
    logger.info("Appended feedback %s", unique_id)
    return unique_id, timestamp


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/screenshots/<path:filename>")
def serve_screenshot(filename):
    """Serve screenshot files."""
    return send_from_directory(EVIDENCE_DIR, filename)


@app.route("/get-feedback", methods=["GET", "OPTIONS"])
def get_feedback():
    """Retrieve all feedback tickets from the CSV file."""
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        ensure_storage()  # Ensure CSV exists and has correct structure
        tickets = []

        with open(CSV_FILE, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ticket_id = row.get("Unique ID", "").strip()
                if ticket_id:
                    # Get archive status, default to "active" if not present
                    archive_status = row.get("Archive Status", "active").strip() or "active"
                    board_status = row.get("Board Status", "backlog").strip() or "backlog"
                    
                    # Map CSV columns to API response format
                    # Note: role is not in CSV, so we'll use a default or derive from reporter
                    role = "Client"  # Default role since it's not stored in CSV
                    
                    # Handle multiple evidence paths (comma-separated)
                    evidence_path = row.get("Evidence Path", "").strip()
                    screenshot_paths = [p.strip() for p in evidence_path.split(",") if p.strip()] if evidence_path else []
                    
                    tickets.append({
                        "ticket_id": int(ticket_id) if ticket_id.isdigit() else ticket_id,
                        "role": role,
                        "url": "",  # Not stored in CSV
                        "description": row.get("Description", "").strip(),
                        "summary": row.get("Summary", "").strip(),
                        "screenshot_path": screenshot_paths[0] if screenshot_paths else "",  # First screenshot for backward compatibility
                        "screenshot_paths": screenshot_paths,  # All screenshots
                        "user_agent": "",  # Not stored in CSV
                        "timestamp": row.get("Timestamp", "").strip(),
                        "issue_type": row.get("Issue Type", "").strip(),
                        "priority": "",  # Not stored in CSV
                        "category": "",  # Not stored in CSV
                        "portfolio": row.get("Portfolio", "").strip(),
                        "reporter_soeid": row.get("Reporter SOEID", "").strip(),
                        "assignee_soeid": row.get("Assignee SOEID", "").strip(),
                        "reporter": row.get("Reporter", "").strip(),
                        "planned_start": row.get("Planned Start", "").strip(),
                        "planned_end": row.get("Planned End", "").strip(),
                        "parent_id": row.get("Parent ID", "").strip(),
                        "epic_link": row.get("Epic Link", "").strip(),
                        "archive_status": archive_status,
                        "board_status": board_status,
                    })

        # Reverse to show newest first
        tickets.reverse()
        return jsonify({"status": "success", "tickets": tickets, "count": len(tickets)})
    except Exception as exc:
        logger.exception("Unable to load tickets: %s", exc)
        return jsonify({"status": "error", "message": "Failed to load feedback"}), 500


@app.route("/update-ticket-status", methods=["PUT", "OPTIONS"])
def update_ticket_status():
    """Update the board status of a ticket."""
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        payload = request.get_json(force=True, silent=True) or {}
        ticket_id = payload.get("ticket_id")
        board_status = payload.get("board_status", "backlog").strip()

        if not ticket_id:
            response = jsonify({"status": "error", "message": "ticket_id is required"})
            return apply_cors(response), 400

        # Read all rows
        rows = []
        header = None
        with open(CSV_FILE, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            header = reader.fieldnames
            rows = list(reader)

        # Find and update the ticket
        updated = False
        for row in rows:
            if str(row.get("Unique ID", "")) == str(ticket_id):
                row["Board Status"] = board_status
                updated = True
                break

        if not updated:
            response = jsonify({"status": "error", "message": f"Ticket {ticket_id} not found"})
            return apply_cors(response), 404

        # Write back to CSV
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)

        logger.info("Updated ticket %s board status to %s", ticket_id, board_status)
        response = jsonify({"status": "success", "ticket_id": ticket_id, "board_status": board_status})
        return apply_cors(response)

    except Exception as exc:
        logger.exception("Failed to update ticket status: %s", exc)
        response = jsonify({"status": "error", "message": "Failed to update ticket status"})
        return apply_cors(response), 500


@app.route("/submit-feedback", methods=["POST", "OPTIONS"])
def submit_feedback():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(force=True, silent=True) or {}
    # Map incoming payload to our CSV-backed append_feedback function
    summary = payload.get("summary", "").strip() or payload.get("description", "").strip()
    issue_type = payload.get("issue_type", "Task").strip()
    description = payload.get("description", "").strip()
    portfolio = payload.get("portfolio", "").strip() or None
    reporter_soeid = payload.get("reporter_soeid", "").strip() or None
    assignee_soeid = payload.get("assignee_soeid", "").strip() or None
    reporter = payload.get("reporter", "").strip() or None
    planned_start = payload.get("planned_start", "").strip() or None
    planned_end = payload.get("planned_end", "").strip() or None
    parent_id = payload.get("parent_id", "").strip() or None
    epic_link = payload.get("epic_link", "").strip() or None
    url = payload.get("url", "").strip()
    user_agent = payload.get("userAgent", "Unknown")
    screenshot_data = payload.get("screenshot")  # Can be single string or array
    screenshots_data = payload.get("screenshots", [])  # Array of screenshots

    if not description and not summary:
        logger.warning("Description or summary missing from payload")
        return jsonify({"status": "error", "message": "Description or summary is required"}), 400

    evidence_path = ""
    # Handle both single screenshot (backward compatibility) and multiple screenshots
    all_screenshots = []
    if screenshot_data:
        all_screenshots.append(screenshot_data)
    if screenshots_data and isinstance(screenshots_data, list):
        all_screenshots.extend(screenshots_data)
    
    if all_screenshots:
        try:
            evidence_path = save_screenshots(all_screenshots)
            if not evidence_path:
                logger.warning("No screenshots were successfully saved")
        except Exception as exc:  # broad to ensure request still stored
            logger.error("Failed to save screenshots: %s", exc)
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


@app.route("/update-archive-status", methods=["PUT", "OPTIONS"])
def update_archive_status():
    """Update the archive status of a feedback ticket."""
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(force=True, silent=True) or {}
    ticket_id = payload.get("ticket_id")
    archive_status = payload.get("status", "archived")  # archived, resolved, closed, active

    if not ticket_id:
        return jsonify({"status": "error", "message": "Ticket ID is required"}), 400

    try:
        ensure_storage()  # Ensure CSV exists and has correct structure
        
        # Read all rows
        rows = []
        header = None
        found = False
        
        with open(CSV_FILE, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            header = reader.fieldnames
            for row in reader:
                if str(row.get("Unique ID", "")).strip() == str(ticket_id):
                    row["Archive Status"] = archive_status
                    found = True
                rows.append(row)

        if not found:
            return jsonify({"status": "error", "message": "Ticket not found"}), 404

        # Write back to CSV
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)

        logger.info("Updated ticket %s archive status to %s", ticket_id, archive_status)
        return jsonify({"status": "success", "ticket_id": ticket_id, "archive_status": archive_status})
    except Exception as exc:
        logger.exception("Unable to update ticket archive status: %s", exc)
        return jsonify({"status": "error", "message": "Failed to update archive status"}), 500


if __name__ == "__main__":
    ensure_storage()
    app.run(host="127.0.0.1", port=5000, debug=True)
