import base64
import logging
import secrets
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request
from openpyxl import Workbook, load_workbook

BASE_DIR = Path(__file__).resolve().parent
SCREENSHOT_DIR = BASE_DIR / "screenshots"
TICKETS_FILE = BASE_DIR / "tickets.xlsx"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("citi_ghost_feedback")

app = Flask(__name__)


def ensure_storage():
    """Ensure screenshots directory and workbook exist before serving requests."""
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    if not TICKETS_FILE.exists():
        logger.info("tickets.xlsx not found. Creating a new workbook.")
        wb = Workbook()
        sheet = wb.active
        sheet.title = "Tickets"
        sheet.append(
            [
                "Ticket ID",
                "Role",
                "URL",
                "Description",
                "Screenshot Path",
                "User Agent",
                "Timestamp",
            ]
        )
        wb.save(TICKETS_FILE)


ensure_storage()


def load_sheet():
    wb = load_workbook(TICKETS_FILE)
    return wb, wb.active


def save_screenshot(data_url: str) -> str:
    """Save a base64 screenshot to disk and return the relative path."""
    try:
        header, encoded = data_url.split(",", 1)
    except ValueError:
        raise ValueError("Invalid screenshot payload")

    filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}.png"
    path = SCREENSHOT_DIR / filename
    image_bytes = base64.b64decode(encoded)
    with open(path, "wb") as f:
        f.write(image_bytes)
    logger.info("Saved screenshot to %s", path)
    return str(path.relative_to(BASE_DIR))


def append_ticket(role, url, description, screenshot_path, user_agent):
    wb, sheet = load_sheet()
    ticket_id = sheet.max_row  # header is row 1, so next row index == ticket id
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    sheet.append(
        [
            ticket_id,
            role,
            url,
            description,
            screenshot_path or "",
            user_agent,
            timestamp,
        ]
    )
    wb.save(TICKETS_FILE)
    logger.info("Stored ticket %s", ticket_id)
    return ticket_id, timestamp


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
    role = payload.get("role", "").strip() or "Client"
    description = payload.get("description", "").strip()
    url = payload.get("url", "").strip()
    user_agent = payload.get("userAgent", "Unknown")
    screenshot_data = payload.get("screenshot")

    if not description:
        logger.warning("Description missing from payload")
        return jsonify({"status": "error", "message": "Description is required"}), 400

    screenshot_path = ""
    if screenshot_data:
        try:
            screenshot_path = save_screenshot(screenshot_data)
        except Exception as exc:  # broad to ensure request still stored
            logger.error("Failed to save screenshot: %s", exc)
            return (
                jsonify({"status": "error", "message": "Invalid screenshot data"}),
                400,
            )

    try:
        ticket_id, timestamp = append_ticket(
            role=role,
            url=url or request.headers.get("Referer", ""),
            description=description,
            screenshot_path=screenshot_path,
            user_agent=user_agent,
        )
    except Exception as exc:
        logger.exception("Unable to append ticket: %s", exc)
        return jsonify({"status": "error", "message": "Failed to store feedback"}), 500

    return jsonify({"status": "success", "ticket_id": ticket_id, "timestamp": timestamp})


if __name__ == "__main__":
    ensure_storage()
    app.run(host="127.0.0.1", port=5000, debug=True)
