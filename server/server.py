from flask import Flask, request, jsonify
from datetime import datetime
from webscrape import Webscrape

app = Flask(__name__)

@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    # Get query parameters
    building = request.args.get("building", "")
    start_str = request.args.get("start")
    end_str = request.args.get("end")

    if not (start_str and end_str):
        return jsonify({"error": "Missing start or end query parameter"}), 400

    try:
        # Parse ISO format "YYYY-MM-DDTHH:MM" into Python datetime objects
        start_dt = datetime.strptime(start_str, "%Y-%m-%dT%H:%M")
        end_dt = datetime.strptime(end_str, "%Y-%m-%dT%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid datetime format. Expected YYYY-MM-DDTHH:MM"}), 400

    # Use the new simplified method: instantiate and call get_rooms()
    # Here we pass the times as given. Adjust if you want to use the parsed dates.
    scraper = Webscrape(
        start_time=start_dt.strftime("%H:%M"),
        end_time=end_dt.strftime("%H:%M"),
        start_date=start_dt.strftime("%Y-%m-%d"),
        end_date=end_dt.strftime("%Y-%m-%d")
    )
    # Get all rooms found from all libraries
    rooms = scraper.get_rooms()

    # If a building filter is provided, filter the results
    if building:
        rooms = [room for room in rooms if building.lower() in room.get('group', '').lower()]

    return jsonify(rooms), 200



@app.route('/api/scrape', methods=['POST'])
def start_scrape():
    try:
        data = request.get_json() or {}
        start_time = data.get('start_time', '09:00')
        end_time   = data.get('end_time', '10:00')
        start_date = data.get('start_date', '2025-03-14')
        end_date   = data.get('end_date', '2025-03-14')

        # Instantiate the scraper
        scraper = Webscrape(start_time, end_time, start_date, end_date)
        # Start the scraping process
        scraper.process_request()

        return jsonify({"message": "Scrape completed!"}), 200
    except Exception as e:
        print("SCRAPE ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
