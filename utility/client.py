import platform
import subprocess
import json
import time
import requests
import logging

 
print("[INFO] Starting System Monitoring Utility...")

 
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')

API_ENDPOINT = "http://localhost:5000/report"  # Backend API to post data

def get_disk_encryption_status():
     return False

def get_os_update_status():
     return True

def get_antivirus_status():
     return True

def get_sleep_timeout():
     return 30

def gather_system_state():
    state = {
        "machine_id": platform.node(),
        "os": platform.system(),
        "os_version": platform.version(),
        "disk_encrypted": get_disk_encryption_status(),
        "os_up_to_date": get_os_update_status(),
        "antivirus_installed": get_antivirus_status(),
        "sleep_timeout_min": get_sleep_timeout(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    return state


def main():
    last_report = None
    CHECK_INTERVAL = 30  # seconds
    while True:
        try:
            state = gather_system_state()
            if state != last_report:
                resp = requests.post(API_ENDPOINT, json=state, timeout=5)
                if resp.status_code == 200:
                    logging.info(f"Reported state: {state}")
                    last_report = state.copy()
                else:
                    logging.warning(f"Failed to report (status {resp.status_code}): {resp.text}")
            else:
                logging.debug("No change in system state; not reporting.")
        except Exception as e:
            logging.error(f"Error in monitoring loop: {e}")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
