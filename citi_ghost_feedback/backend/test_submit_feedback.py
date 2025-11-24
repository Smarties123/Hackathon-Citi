import os
import csv
import time
import unittest
from pathlib import Path

# Ensure backend package path
HERE = Path(__file__).resolve().parent
import sys
sys.path.insert(0, str(HERE))

import app as backend_app

class SubmitFeedbackTest(unittest.TestCase):
    def setUp(self):
        # Use the Flask test client
        self.client = backend_app.app.test_client()
        # Paths from app
        self.csv_path = backend_app.CSV_FILE
        self.evidence_dir = backend_app.EVIDENCE_DIR

    def test_submit_feedback_with_screenshot(self):
        # small 1x1 PNG base64
        small_png = (
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1"
            "HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
        )

        payload = {
            "summary": "Automated test submission",
            "issue_type": "Bug",
            "description": "This is a test created by an automated script.",
            "portfolio": "TestPortfolio",
            "reporter_soeid": "tester01",
            "assignee_soeid": "dev01",
            "reporter": "Automated Tester",
            "planned_start": "2025-11-24",
            "planned_end": "2025-11-30",
            "parent_id": "",
            "epic_link": "",
            "url": "http://localhost/sample",
            "userAgent": "unit-test-agent",
            "screenshot": small_png,
        }

        # POST to endpoint
        resp = self.client.post("/submit-feedback", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIsInstance(data, dict)
        self.assertEqual(data.get("status"), "success")
        ticket_id = data.get("ticket_id")
        self.assertTrue(ticket_id is not None)

        # Allow tiny delay for filesystem
        time.sleep(0.1)

        # Check CSV contains the ticket id
        found = False
        with open(self.csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            last_row = None
            for row in reader:
                last_row = row
                try:
                    if int(row.get("Unique ID", "0") or 0) == int(ticket_id):
                        found = True
                        break
                except ValueError:
                    continue
        self.assertTrue(found, msg=f"Ticket id {ticket_id} not found in CSV")

        # If evidence path present in last_row, check file exists
        if last_row:
            evidence = last_row.get("Evidence Path")
            if evidence:
                evidence_path = (HERE / evidence).resolve()
                self.assertTrue(evidence_path.exists(), msg=f"Evidence file {evidence_path} does not exist")


if __name__ == "__main__":
    unittest.main()
