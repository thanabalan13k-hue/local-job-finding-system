console.log("post-job.js loaded");

const form = document.getElementById("postJobForm");
const message = document.getElementById("postMessage");
const postButton = document.getElementById("postJobButton");

let isSubmitting = false;

postButton.addEventListener("click", async function () {

    if (isSubmitting) {
        return;
    }

    // Company details
    const companyName =
        document.getElementById("companyName").value.trim();

    const companyEmail =
        document.getElementById("companyEmail").value.trim();

    const companyPhone =
        document.getElementById("companyPhone").value.trim();

    const companyWebsite =
        document.getElementById("companyWebsite").value.trim();

    // Job details
    const jobTitle =
        document.getElementById("jobTitle").value.trim();

    const jobType =
        document.getElementById("jobType").value;

    const district =
        document.getElementById("district").value;

    const location =
        document.getElementById("location").value.trim();

    const qualification =
        document.getElementById("qualification").value.trim();

    const skillsInput =
        document.getElementById("skills") ||
        document.getElementById("requiredSkills");

    const requiredSkills =
        skillsInput ? skillsInput.value.trim() : "";

    const salary =
        document.getElementById("salary").value.trim();

    const jobDescription =
        document.getElementById("jobDescription").value.trim();

    // Application details
    const applyLink =
        document.getElementById("applyLink").value.trim();

    message.style.display = "block";

    // ONLY THESE FIELDS ARE REQUIRED
    if (
        !companyName ||
        !companyEmail ||
        !jobTitle ||
        !jobType ||
        !district ||
        !location ||
        !jobDescription
    ) {
        message.textContent = "Please fill all required fields.";
        message.className = "post-message error";
        return;
    }

    const originalButtonText = postButton.textContent;

    isSubmitting = true;
    postButton.disabled = true;
    postButton.textContent = "Posting...";

    try {

        // Save company
        const companyResponse = await fetch(
            "http://localhost:8081/api/companies",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company_name: companyName,
                    email: companyEmail,
                    phone: companyPhone,
                    website: companyWebsite,
                    district: district,
                    address: location
                })
            }
        );

        if (!companyResponse.ok) {
            throw new Error("Company could not be saved");
        }

        const company = await companyResponse.json();

        // Save job
        const jobResponse = await fetch(
            "http://localhost:8081/api/jobs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company_id: company.company_id,
                    job_title: jobTitle,
                    job_description: jobDescription,
                    qualification: qualification,
                    skills: requiredSkills,
                    job_type: jobType,
                    district: district,
                    salary: salary,
                    location: location,
                    apply_link: applyLink
                })
            }
        );

        if (!jobResponse.ok) {
            throw new Error("Job could not be saved");
        }

        message.textContent = "Job posted successfully!";
        message.className = "post-message success";

        form.reset();

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to post job. Please try again.";

        message.className = "post-message error";

    } finally {

        isSubmitting = false;
        postButton.disabled = false;
        postButton.textContent = originalButtonText;
    }
});