document.addEventListener("DOMContentLoaded", function () {

    const candidateName =
        document.getElementById("candidateName");

    const qualification =
        document.getElementById("qualification");

    const skills =
        document.getElementById("skills");

    const preferredDistrict =
        document.getElementById("preferredDistrict");

    const findButton =
        document.getElementById("findSuitableJobs");

    const message =
        document.getElementById("resumeMessage");


    // Find suitable jobs
    findButton.addEventListener("click", async function () {

        const name =
            candidateName.value.trim();

        const selectedQualification =
            qualification.value.trim().toLowerCase();

        const enteredSkills =
            skills.value.trim();

        const selectedDistrict =
            preferredDistrict.value.trim().toLowerCase();


        // Name validation
        if (name === "") {

            showMessage(
                "Please enter your name.",
                "error"
            );

            return;
        }


        // Qualification validation
        if (selectedQualification === "") {

            showMessage(
                "Please select your qualification.",
                "error"
            );

            return;
        }


        // Skills validation
        if (enteredSkills === "") {

            showMessage(
                "Please enter at least one skill.",
                "error"
            );

            return;
        }


        findButton.disabled = true;
        findButton.textContent =
            "Finding Suitable Jobs...";


        try {

            // Get all jobs
            const response = await fetch(
                "http://localhost:8081/api/jobs"
            );


            if (!response.ok) {

                throw new Error(
                    "Unable to load jobs"
                );

            }


            const jobs =
                await response.json();


            // Convert entered skills into list
            const skillList =
                enteredSkills
                    .toLowerCase()
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(skill => skill !== "");


            // Find matching jobs
            const matchedJobs =
                jobs.filter(function (job) {

                    const jobDistrict =
                        (job.district || "")
                            .trim()
                            .toLowerCase();


                    const jobQualification =
                        (job.qualification || "")
                            .trim()
                            .toLowerCase();


                    const jobSkills =
                        (job.skills || "")
                            .trim()
                            .toLowerCase();


                    const jobText = [

                        job.job_title ||
                        job.jobTitle ||
                        "",

                        job.job_description ||
                        job.jobDescription ||
                        "",

                        job.qualification ||
                        "",

                        job.skills ||
                        "",

                        job.company_name ||
                        job.companyName ||
                        "",

                        job.location ||
                        ""

                    ]
                    .join(" ")
                    .toLowerCase();


                    /*
                     * Qualification is the
                     * primary matching criterion.
                     */

                    const qualificationMatches =
                        jobQualification ===
                            selectedQualification ||

                        jobQualification.includes(
                            selectedQualification
                        ) ||

                        selectedQualification.includes(
                            jobQualification
                        );


                    /*
                     * At least one skill
                     * should match.
                     */

                    const skillsMatch =
                        skillList.some(function (skill) {

                            return (
                                jobSkills.includes(skill) ||
                                jobText.includes(skill)
                            );

                        });


                    /*
                     * District is optional.
                     * Empty means both districts.
                     */

                    const districtMatches =
                        selectedDistrict === "" ||
                        jobDistrict === selectedDistrict;


                    return (
                        qualificationMatches &&
                        skillsMatch &&
                        districtMatches
                    );

                });


            // No matching jobs
            if (matchedJobs.length === 0) {

                showMessage(
                    "No suitable jobs found. Try another skill, qualification, or district.",
                    "error"
                );

                return;
            }


            // Get matching job IDs
            const matchedJobIds =
                matchedJobs.map(function (job) {

                    return (
                        job.job_id ||
                        job.jobId
                    );

                });


            /*
             * Save matched jobs
             */
            sessionStorage.setItem(
                "resumeMatchedJobIds",
                JSON.stringify(matchedJobIds)
            );


            /*
             * Save candidate name
             */
            sessionStorage.setItem(
                "resumeCandidateName",
                name
            );


            /*
             * Save selected qualification
             * for the Jobs page heading.
             */
            sessionStorage.setItem(
                "resumeSelectedQualification",
                qualification.value
            );


            // Success message
            showMessage(
                matchedJobs.length +
                " suitable job(s) found. Opening results...",
                "success"
            );


            // Open Jobs page
            setTimeout(function () {

                window.location.href =
                    "jobs.html?resumeMatch=true";

            }, 500);


        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to find suitable jobs. Please ensure Spring Boot is running.",
                "error"
            );

        } finally {

            findButton.disabled = false;

            findButton.textContent =
                "Find Suitable Jobs →";

        }

    });


    // Message function
    function showMessage(text, type) {

        message.textContent = text;

        message.className =
            "resume-message " + type;

        message.style.display = "block";

    }

});