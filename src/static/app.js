document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-table-body");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const signupButton = signupForm.querySelector("button[type='submit']");
  const createClassForm = document.getElementById("create-class-form");
  const classMessageDiv = document.getElementById("class-message");
  const createClassButton = createClassForm.querySelector("button[type='submit']");

  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.classList.remove("hidden");
    setTimeout(() => element.classList.add("hidden"), 5000);
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error("Unable to load activities");
      const activities = await response.json();
      const entries = Object.entries(activities).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB, undefined, { sensitivity: "base" })
      );

      activitiesList.replaceChildren();
      activitySelect.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());

      entries.forEach(([name, details]) => {
        const participants = (Array.isArray(details.participants) ? details.participants : [])
          .slice()
          .sort((emailA, emailB) => emailA.localeCompare(emailB, undefined, { sensitivity: "base" }));
        const capacity = Number(details.max_participants) || 0;
        const seatsLeft = Math.max(0, capacity - participants.length);
        const row = document.createElement("tr");

        const classCell = document.createElement("td");
        const classInfo = document.createElement("div");
        classInfo.className = "class-info";
        const className = document.createElement("strong");
        className.textContent = name;
        const schedule = document.createElement("span");
        schedule.textContent = details.schedule || "Schedule not specified";
        classInfo.append(className, schedule);
        classCell.appendChild(classInfo);

        const rosterCell = document.createElement("td");
        if (participants.length === 0) {
          const empty = document.createElement("span");
          empty.className = "empty-roster";
          empty.textContent = "No students enrolled";
          rosterCell.appendChild(empty);
        } else {
          const roster = document.createElement("ol");
          roster.className = "student-roster";
          participants.forEach((participant) => {
            const item = document.createElement("li");
            item.textContent = participant;
            roster.appendChild(item);
          });
          rosterCell.appendChild(roster);
        }

        const seatsCell = document.createElement("td");
        const capacityBadge = document.createElement("span");
        capacityBadge.className = `capacity-badge ${seatsLeft === 0 ? "full" : seatsLeft <= 3 ? "low" : "available"}`;
        capacityBadge.textContent = `${seatsLeft}/${capacity}`;
        capacityBadge.setAttribute("aria-label", `${seatsLeft} seats left out of ${capacity}`);
        seatsCell.appendChild(capacityBadge);

        row.append(classCell, rosterCell, seatsCell);
        activitiesList.appendChild(row);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = seatsLeft === 0 ? `${name} (Full)` : name;
        option.disabled = seatsLeft === 0;
        activitySelect.appendChild(option);
      });

      if (entries.length === 0) {
        activitiesList.innerHTML = '<tr><td colspan="3" class="table-state">No classes available.</td></tr>';
      }
    } catch (error) {
      activitiesList.innerHTML = '<tr><td colspan="3" class="table-state error-text">Could not load class rosters. Please refresh to try again.</td></tr>';
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = activitySelect.value;
    if (!activity) return;

    signupButton.disabled = true;
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Unable to enroll this student.");

      showMessage(messageDiv, result.message || "Student enrolled successfully.", "success");
      signupForm.reset();
      await fetchActivities();
    } catch (error) {
      showMessage(messageDiv, error.message || "Failed to enroll student. Please try again.", "error");
      console.error("Error enrolling student:", error);
    } finally {
      signupButton.disabled = false;
    }
  });

  createClassForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createClassButton.disabled = true;

    const params = new URLSearchParams({
      activity_name: document.getElementById("class-name").value.trim(),
      description: document.getElementById("class-description").value.trim(),
      schedule: document.getElementById("class-schedule").value.trim(),
      max_participants: document.getElementById("class-capacity").value,
    });

    try {
      const response = await fetch(`/activities?${params.toString()}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Unable to create class.");

      showMessage(classMessageDiv, result.message || "Class created successfully.", "success");
      createClassForm.reset();
      await fetchActivities();
    } catch (error) {
      showMessage(classMessageDiv, error.message || "Failed to create class. Please try again.", "error");
      console.error("Error creating class:", error);
    } finally {
      createClassButton.disabled = false;
    }
  });

  fetchActivities();
});
