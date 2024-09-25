import { useState } from "react";
import Papa from "papaparse";
import "./App.css";

const EmailGenerator = () => {
  const [emails, setEmails] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [htmlTemplate, setHtmlTemplate] = useState(""); // To store user HTML input
  const [emailSubject, setEmailSubject] = useState(""); // To store the subject
  const [sampleContent, setSampleContent] = useState(""); // Store sample content for display
  const [activeTab, setActiveTab] = useState("todo"); // "todo" or "done" tab

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        setCsvData(results.data);
      },
    });
  };

  // Function to handle HTML template input
  const handleTemplateChange = (event) => {
    setHtmlTemplate(event.target.value);
  };

  // Function to handle the subject input
  const handleSubjectChange = (event) => {
    setEmailSubject(event.target.value);
  };

  // Function to generate emails based on custom template
  const generateEmails = () => {
    if (!csvData || !htmlTemplate) return;

    const emailTemplates = csvData.map((entry) => {
      const fullName = entry.Name;
      const firstName = fullName.split(" ")[0]; // Extract first name
      const email = entry.Email; // Extract email

      // Replace placeholders with dynamic content
      let customizedTemplate = htmlTemplate;
      customizedTemplate = customizedTemplate.replace(
        "${firstName}",
        firstName
      );

      return { email, firstName, content: customizedTemplate, done: false };
    });

    // Set sample content for display (replace firstName in template with a generic name)
    if (emailTemplates.length > 0) {
      const sampleFirstName = "John"; // Sample name for preview
      let sampleEmail = htmlTemplate.replace("${firstName}", sampleFirstName);
      setSampleContent(sampleEmail);
    }

    setEmails(emailTemplates);
  };

  // Function to create a mailto link for each email template
  const sendEmail = (recipient, firstName) => {
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(`Hello, ${firstName}!\n\n`)}`;
    window.location.href = mailtoLink; // Open the mailto link in the default email client
  };

  // Function to move email to the end of the list and mark it as done
  const moveToEnd = (index) => {
    const updatedEmails = [...emails];
    const emailToMove = updatedEmails.splice(index, 1)[0]; // Remove email from current position
    emailToMove.done = true; // Mark it as "done"
    updatedEmails.push(emailToMove); // Add it to the end of the list
    setEmails(updatedEmails);
  };

  // Function to switch between tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <h2>Personal Email Writer</h2>
      <h4>How to use</h4>
      <ol style={{ fontSize: 11 }}>
        <li>
          Submit an HTML template into the textbox. I recommend generating the
          HTML with ChatGPT.
        </li>

        <li>
          Upload a CSV file/Excel sheet that contains at least "Name" and
          "Email" columns.
        </li>
        <li>Press generate.</li>
        <li>
          Copy the content and press the send button to open your email client
          with the subject, recipient and introduction pre-filled.
        </li>
        <li>
          Move the email to done.{" "}
          <b>Warning: the todo/done list is not saved to a database. </b>
        </li>
      </ol>

      {/* Input for email subject */}
      <div>
        <label>Email Subject:</label>
        <input
          type="text"
          placeholder="Enter the email subject"
          value={emailSubject}
          onChange={handleSubjectChange}
          style={{ marginBottom: "20px", width: "100%" }}
        />
      </div>

      {/* Input for the HTML template */}
      <textarea
        placeholder="Enter your HTML template here"
        value={htmlTemplate}
        onChange={handleTemplateChange}
        style={{
          width: "100%",
          height: "200px",
          marginBottom: "20px",
          fontSize: 12,
          fontFamily: "Helvetica",
        }}
      ></textarea>

      {/* CSV file upload */}
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <button onClick={generateEmails}>Generate Emails</button>

      {/* Display the sample email template */}
      {sampleContent && (
        <div>
          <h2>Email Template</h2>
          <div
            style={{ fontSize: 12, fontFamily: "Helvetica" }}
            dangerouslySetInnerHTML={{ __html: sampleContent }}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => switchTab("todo")}
          style={{
            padding: "10px",
            backgroundColor: activeTab === "todo" ? "#b1b5fc" : "#95a5a6",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Todo Emails
        </button>
        <button
          onClick={() => switchTab("done")}
          style={{
            padding: "10px",
            backgroundColor: activeTab === "done" ? "#a1f7d3" : "#95a5a6",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Done Emails
        </button>
      </div>

      {/* Render Todo Emails */}
      {activeTab === "todo" &&
        emails.filter((email) => !email.done).length > 0 && (
          <div>
            <h2>Todo Emails</h2>
            {emails
              .filter((emailData) => !emailData.done)
              .map((emailData, index) => (
                <div key={index}>
                  <p>
                    <strong>
                      {emailData.firstName} ({emailData.email})
                    </strong>
                  </p>

                  {/* Send Button */}
                  <button
                    onClick={() =>
                      sendEmail(emailData.email, emailData.firstName)
                    }
                    style={{
                      padding: "5px",
                      backgroundColor: "#b1b5fc",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Send Email to {emailData.email}
                  </button>

                  {/* Move to End Button */}
                  {!emailData.done && (
                    <button
                      onClick={() => moveToEnd(index)}
                      style={{
                        marginLeft: "10px",
                        padding: "5px",
                        backgroundColor: "#a1f7d3",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Move to Done
                    </button>
                  )}

                  <hr />
                </div>
              ))}
          </div>
        )}

      {/* Render Done Emails */}
      {activeTab === "done" &&
        emails.filter((email) => email.done).length > 0 && (
          <div>
            <h2>Done Emails</h2>
            {emails
              .filter((emailData) => emailData.done)
              .map((emailData, index) => (
                <div key={index}>
                  <p>
                    <strong>
                      {emailData.firstName} ({emailData.email})
                    </strong>{" "}
                    <span style={{ color: "green" }}> - Done</span>
                  </p>
                  <hr />
                </div>
              ))}
          </div>
        )}

      {/* Display message when no emails are available */}
      {activeTab === "todo" &&
        emails.filter((email) => !email.done).length === 0 && (
          <div>
            <h2>No Emails Left To Do</h2>
          </div>
        )}

      {activeTab === "done" &&
        emails.filter((email) => email.done).length === 0 && (
          <div>
            <h2>No Done Emails</h2>
          </div>
        )}
    </div>
  );
};

function App() {
  return (
    <>
      <i style={{ fontSize: 10 }}>
        This is an internal productivity tool. It's not designed for people.
      </i>
      <EmailGenerator />
    </>
  );
}

export default App;
