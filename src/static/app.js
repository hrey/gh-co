document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-table-body");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error("Unable to load activities");
      const activities = await response.json();

      activitiesList.replaceChildren();
      activitySelect.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());

      Object.entries(activities).forEach(([name, details]) => {
        const row = document.createElement("tr");
        const spotsLeft = details.max_participants - details.participants.length;
        const seatClass = spotsLeft <= 0 ? "seat-full" : spotsLeft <= 3 ? "seat-warning" : "seat-available";

        const classCell = document.createElement("td");
        const classMeta = document.createElement("div");
        classMeta.className = "class-meta";
        const className = document.createElement("strong");
        className.textContent = name;
        const schedule = document.createElement("span");
        schedule.textContent = details.schedule;
        classMeta.append(className, schedule);
        classCell.appendChild(classMeta);

        const countCell = document.createElement("td");
        countCell.className = "count-cell";
        countCell.textContent = details.participants.length;

        const studentsCell = document.createElement("td");
        if (details.participants.length) {
          const studentList = document.createElement("ul");
          studentList.className = "student-list";
          details.participants.forEach((participant) => {
            const item = document.createElement("li");
            item.textContent = participant;
            studentList.appendChild(item);
          });
          studentsCell.appendChild(studentList);
        } else {
          const emptyList = document.createElement("span");
          emptyList.className = "empty-list";
          emptyList.textContent = "No students enrolled";
          studentsCell.appendChild(emptyList);
        }

        const seatsCell = document.createElement("td");
        const seatPill = document.createElement("span");
        seatPill.className = `seat-pill ${seatClass}`;
        seatPill.textContent = spotsLeft;
        seatsCell.appendChild(seatPill);

        row.append(classCell, countCell, studentsCell, seatsCell);
        activitiesList.appendChild(row);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      if (!Object.keys(activities).length) {
        activitiesList.innerHTML = '<tr><td colspan="4">No classes available.</td></tr>';
      }
    } catch (error) {
      activitiesList.innerHTML = '<tr><td colspan="4">Failed to load activities. Please try again later.</td></tr>';
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = activitySelect.value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success message";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error message";
      }
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error message";
      console.error("Error signing up:", error);
    }

    messageDiv.classList.remove("hidden");
    setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  });

  fetchActivities();
});
