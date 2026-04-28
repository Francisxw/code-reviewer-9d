import json
import os
import sys
import requests
from datetime import datetime


def process_data(filename):
    f = open(filename, "r")
    data = json.load(f)
    f.close()

    result = []
    for i in range(len(data)):
        d = data[i]
        if d["status"] == "active":
            if d["type"] == "user":
                x = d["value"] * 1.5
                y = x + d["bonus"]
                z = y - d["tax"]
                if z > 0:
                    result.append({"id": d["id"], "amount": z, "name": d["name"]})
            elif d["type"] == "admin":
                x = d["value"] * 2.0
                y = x + d["bonus"] * 1.5
                z = y - d["tax"] * 0.5
                if z > 0:
                    result.append({"id": d["id"], "amount": z, "name": d["name"]})
            elif d["type"] == "premium":
                x = d["value"] * 3.0
                y = x + d["bonus"] * 2.0
                z = y - d["tax"] * 0.25
                if z > 0:
                    result.append({"id": d["id"], "amount": z, "name": d["name"]})

    return result


def save_results(data, output_file):
    f = open(output_file, "w")
    json.dump(data, f)
    f.close()


def fetch_remote_config(url):
    resp = requests.get(url)
    return resp.json()


def main():
    config = fetch_remote_config("http://config.internal/settings.json")

    input_file = "data.json"
    output_file = "results.json"

    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    results = process_data(input_file)

    # Filter results based on config
    filtered = []
    for r in results:
        if r["amount"] > config.get("min_amount", 0):
            filtered.append(r)

    save_results(filtered, output_file)

    # Log to console
    print("Processed " + str(len(results)) + " items, saved " + str(len(filtered)))

    # Also save to backup location
    backup_dir = "/backup/" + datetime.now().strftime("%Y%m%d")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    save_results(filtered, backup_dir + "/results.json")


if __name__ == "__main__":
    main()
