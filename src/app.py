"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Practice basketball skills and compete in team games",
        "schedule": "Tuesdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": []
    },
    "Track and Field": {
        "description": "Train for running, jumping, and throwing events",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 25,
        "participants": []
    },
    "Art Club": {
        "description": "Explore drawing, painting, and other visual art projects",
        "schedule": "Mondays, 3:30 PM - 4:30 PM",
        "max_participants": 18,
        "participants": []
    },
    "Drama Club": {
        "description": "Develop acting skills and prepare for school performances",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": []
    },
    "Debate Club": {
        "description": "Research topics and practice building persuasive arguments",
        "schedule": "Tuesdays, 3:30 PM - 4:30 PM",
        "max_participants": 16,
        "participants": []
    },
    "Science Club": {
        "description": "Explore scientific concepts through experiments and projects",
        "schedule": "Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 16,
        "participants": []
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities")
def create_activity(activity_name: str, description: str, schedule: str, max_participants: int):
    """Create a new extracurricular activity."""
    activity_name = activity_name.strip()
    if not activity_name:
        raise HTTPException(status_code=400, detail="Class name is required")
    if any(existing_name.casefold() == activity_name.casefold() for existing_name in activities):
        raise HTTPException(status_code=409, detail="A class with this name already exists")
    if not description.strip():
        raise HTTPException(status_code=400, detail="Description is required")
    if not schedule.strip():
        raise HTTPException(status_code=400, detail="Schedule is required")
    if max_participants < 1:
        raise HTTPException(status_code=400, detail="Maximum students must be at least 1")

    activities[activity_name] = {
        "description": description.strip(),
        "schedule": schedule.strip(),
        "max_participants": max_participants,
        "participants": []
    }
    return {"message": f"Created class {activity_name}"}


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    #Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student already signed up for this activity")

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.delete("/activities/{activity_name}/signup")
def unregister_from_activity(activity_name: str, email: str):
    """Unregister a student from an activity"""
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]
    if email not in activity["participants"]:
        raise HTTPException(status_code=404, detail="Student is not signed up for this activity")

    activity["participants"].remove(email)
    return {"message": f"Unregistered {email} from {activity_name}"}
