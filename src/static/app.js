<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mergington High School Activities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <h1>Mergington High School</h1>
      <h2>Club Enrollment Overview</h2>
    </header>

    <main class="dashboard">
      <section id="activities-container" class="table-panel">
        <h3>Class Enrollment</h3>
        <div class="table-wrapper">
          <table id="activities-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Students</th>
                <th>Student Names</th>
                <th>Seats Left</th>
              </tr>
            </thead>
            <tbody id="activities-table-body">
              <tr>
                <td colspan="4">Loading activities...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="signup-container" class="form-panel">
        <h3>Enroll a Student</h3>
        <form id="signup-form">
          <div class="form-group">
            <label for="email">Student Email:</label>
            <input type="email" id="email" required placeholder="your-email@mergington.edu" />
          </div>
          <div class="form-group">
            <label for="activity">Select Class:</label>
            <select id="activity" required>
              <option value="">-- Select a class --</option>
              <!-- Activity options will be loaded here -->
            </select>
          </div>
          <button type="submit">Enroll</button>
        </form>
        <div id="message" class="hidden"></div>
      </section>
    </main>

    <footer>
      <p>&copy; 2023 Mergington High School</p>
    </footer>

    <script src="app.js"></script>
  </body>
</html>
