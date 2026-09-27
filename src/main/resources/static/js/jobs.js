document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("jobSearch");
    const districtFilter = document.getElementById("districtFilter");
    const jobTypeFilter = document.getElementById("jobTypeFilter");
    const searchButton = document.getElementById("jobSearchBtn");

    const jobList = document.getElementById("jobList");
    const resultsCount = document.getElementById("resultsCount");
    const noJobs = document.getElementById("noJobs");

    const jobModal = document.getElementById("jobModal");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalJobTitle = document.getElementById("modalJobTitle");
    const modalCompanyName = document.getElementById("modalCompanyName");
    const modalJobType = document.getElementById("modalJobType");
    const modalDistrict = document.getElementById("modalDistrict");
    const modalLocation = document.getElementById("modalLocation");
    const modalSalary = document.getElementById("modalSalary");
    const modalQualification = document.getElementById("modalQualification");
    const modalDescription = document.getElementById("modalDescription");
    const modalSkills = document.getElementById("modalSkills");
    const modalApplyBtn = document.getElementById("modalApplyBtn");

    let allJobs = [];


    // URL parameters
    const params =
        new URLSearchParams(window.location.search);

    const companyIdFromUrl =
        params.get("companyId");

    const resumeMatchFromUrl =
        params.get("resumeMatch") === "true";


    // Resume matched job IDs
    let resumeMatchedJobIds = [];

    if (resumeMatchFromUrl) {

        try {

            const storedMatches =
                sessionStorage.getItem(
                    "resumeMatchedJobIds"
                );

            if (storedMatches) {

                const parsedMatches =
                    JSON.parse(storedMatches);

                if (Array.isArray(parsedMatches)) {

                    resumeMatchedJobIds =
                        parsedMatches.map(id =>
                            String(id)
                        );

                }

            }

        } catch (error) {

            console.error(
                "Unable to read resume matches:",
                error
            );

            resumeMatchedJobIds = [];
        }
    }


    // --------------------------------
    // Resume qualification heading
    // --------------------------------

    if (resumeMatchFromUrl) {

        const selectedQualification =
            sessionStorage.getItem(
                "resumeSelectedQualification"
            );

        updateResumeHeading(
            selectedQualification
        );
    }


    function updateResumeHeading(qualification) {

        if (!qualification) {
            return;
        }

        /*
         * Try common heading IDs/classes.
         */
        const heading =
            document.querySelector(".results-heading") ||
            document.querySelector("#resultsHeading") ||
            document.querySelector(".jobs-header h2");

        if (!heading) {
            return;
        }

        heading.textContent =
            "Jobs for " +
            qualification +
            " Candidates";
    }


    // --------------------------------
    // Load jobs
    // --------------------------------

    fetch("http://localhost:8081/api/jobs")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load jobs"
                );
            }

            return response.json();
        })

        .then(jobs => {

            allJobs =
                Array.isArray(jobs)
                    ? jobs
                    : [];

            const searchValue =
                params.get("search");

            const districtValue =
                params.get("district");


            // Set search values from URL
            if (searchValue && searchInput) {
                searchInput.value =
                    searchValue;
            }

            if (districtValue && districtFilter) {
                districtFilter.value =
                    districtValue;
            }


            // Apply filters
            if (
                searchValue ||
                districtValue ||
                companyIdFromUrl ||
                resumeMatchFromUrl
            ) {

                filterJobs();

            } else {

                displayJobs(allJobs);

            }

        })

        .catch(error => {

            console.error(error);

            jobList.innerHTML = "";

            resultsCount.textContent =
                "0 jobs";

            noJobs.style.display =
                "block";

        });


    // --------------------------------
    // Display jobs
    // --------------------------------

    function displayJobs(jobs) {

        jobList.innerHTML = "";

        resultsCount.textContent =
            jobs.length +
            (jobs.length === 1
                ? " job"
                : " jobs");


        if (jobs.length === 0) {

            noJobs.style.display =
                "block";

            return;
        }


        noJobs.style.display =
            "none";


        jobs.forEach(function (job) {

            const companyName =
                job.company_name ||
                job.companyName ||
                "Company";


            const jobTitle =
                job.job_title ||
                job.jobTitle ||
                "Job";


            const jobType =
                job.job_type ||
                job.jobType ||
                "";


            const district =
                job.district ||
                "";


            const location =
                job.location ||
                district;


            const qualification =
                job.qualification ||
                "Not specified";


            const salary =
                job.salary ||
                "Not specified";


            const skills =
                (job.skills || "")
                    .split(",")
                    .map(skill =>
                        skill.trim()
                    )
                    .filter(skill =>
                        skill !== ""
                    );


            const skillsHtml =
                skills.length > 0

                    ? skills
                        .map(skill =>
                            `<span>${escapeHTML(skill)}</span>`
                        )
                        .join("")

                    : `<span>${escapeHTML(jobTitle)}</span>`;


            const firstLetter =
                companyName
                    .charAt(0)
                    .toUpperCase();


            const card =
                document.createElement("article");


            card.className =
                "local-job-card";


            card.innerHTML = `

                <div class="job-card-header">

                    <div class="company-badge">
                        ${escapeHTML(firstLetter)}
                    </div>

                    <span class="job-type-badge">
                        ${escapeHTML(jobType)}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(jobTitle)}
                </h3>


                <p class="company-title">
                    ${escapeHTML(companyName)}
                </p>


                <div class="job-details-list">

                    <div class="job-detail-item">
                        📍 <strong>
                            ${escapeHTML(district)}
                        </strong>
                    </div>

                    <div class="job-detail-item">
                        🏢 Location:
                        ${escapeHTML(location)}
                    </div>

                    <div class="job-detail-item">
                        🎓 Qualification:
                        ${escapeHTML(qualification)}
                    </div>

                    <div class="job-detail-item">
                        💰 Salary:
                        ${escapeHTML(salary)}
                    </div>

                </div>


                <div class="job-skills">
                    ${skillsHtml}
                </div>


                <button
                    class="view-job-btn"
                    type="button"
                >
                    View Job Details →
                </button>

            `;


            const viewButton =
                card.querySelector(
                    ".view-job-btn"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    showJobDetails(job);

                }
            );


            jobList.appendChild(card);

        });
    }


    // --------------------------------
    // Filter jobs
    // --------------------------------

    function filterJobs() {

        const searchText =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedDistrict =
            districtFilter
                ? districtFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedJobType =
            jobTypeFilter
                ? jobTypeFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        const filteredJobs =
            allJobs.filter(function (job) {

                const title =
                    (
                        job.job_title ||
                        job.jobTitle ||
                        ""
                    ).toLowerCase();


                const company =
                    (
                        job.company_name ||
                        job.companyName ||
                        ""
                    ).toLowerCase();


                const description =
                    (
                        job.job_description ||
                        job.jobDescription ||
                        ""
                    ).toLowerCase();


                const qualification =
                    (
                        job.qualification ||
                        ""
                    ).toLowerCase();


                const skills =
                    (
                        job.skills ||
                        ""
                    ).toLowerCase();


                const district =
                    (
                        job.district ||
                        ""
                    ).toLowerCase();


                const jobType =
                    (
                        job.job_type ||
                        job.jobType ||
                        ""
                    ).toLowerCase();


                const jobCompanyId =
                    job.company_id ||
                    job.companyId;


                const jobId =
                    job.job_id ||
                    job.jobId;


                // Normal search
                const matchesSearch =
                    searchText === "" ||
                    title.includes(searchText) ||
                    company.includes(searchText) ||
                    description.includes(searchText) ||
                    qualification.includes(searchText) ||
                    skills.includes(searchText);


                // District filter
                const matchesDistrict =
                    selectedDistrict === "" ||
                    selectedDistrict === "all" ||
                    district === selectedDistrict;


                // Job type filter
                const matchesJobType =
                    selectedJobType === "" ||
                    selectedJobType === "all" ||
                    jobType === selectedJobType;


                // Company filter
                const matchesCompany =
                    !companyIdFromUrl ||
                    String(jobCompanyId) ===
                    String(companyIdFromUrl);


                // Resume match filter
                const matchesResume =
                    !resumeMatchFromUrl ||
                    resumeMatchedJobIds.includes(
                        String(jobId)
                    );


                return (
                    matchesSearch &&
                    matchesDistrict &&
                    matchesJobType &&
                    matchesCompany &&
                    matchesResume
                );

            });


        displayJobs(filteredJobs);
    }


    // --------------------------------
    // Search button
    // --------------------------------

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            filterJobs
        );

    }


    // --------------------------------
    // Enter key search
    // --------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    filterJobs();

                }

            }
        );

    }


    // --------------------------------
    // District filter
    // --------------------------------

    if (districtFilter) {

        districtFilter.addEventListener(
            "change",
            filterJobs
        );

    }


    // --------------------------------
    // Job type filter
    // --------------------------------

    if (jobTypeFilter) {

        jobTypeFilter.addEventListener(
            "change",
            filterJobs
        );

    }


    // --------------------------------
    // Show job details
    // --------------------------------

    function showJobDetails(job) {

        const title =
            job.job_title ||
            job.jobTitle ||
            "Job";


        const company =
            job.company_name ||
            job.companyName ||
            "Company";


        const description =
            job.job_description ||
            job.jobDescription ||
            "No description available.";


        const qualification =
            job.qualification ||
            "Not specified";


        const jobType =
            job.job_type ||
            job.jobType ||
            "Not specified";


        const district =
            job.district ||
            "Not specified";


        const location =
            job.location ||
            district;


        const salary =
            job.salary ||
            "Not specified";


        const applyLink =
            job.apply_link ||
            job.applyLink ||
            "";


        modalJobTitle.textContent =
            title;


        modalCompanyName.textContent =
            company;


        modalJobType.textContent =
            jobType;


        modalDistrict.textContent =
            district;


        modalLocation.textContent =
            location;


        modalSalary.textContent =
            salary;


        modalQualification.textContent =
            qualification;


        modalDescription.textContent =
            description;


        // Skills
        const skills =
            (job.skills || "")
                .split(",")
                .map(skill =>
                    skill.trim()
                )
                .filter(skill =>
                    skill !== ""
                );


        modalSkills.innerHTML =
            skills.length > 0

                ? skills
                    .map(skill =>
                        `<span>${escapeHTML(skill)}</span>`
                    )
                    .join("")

                : "<span>Not specified</span>";


        // Apply button
        if (applyLink) {

            modalApplyBtn.href =
                applyLink;

            modalApplyBtn.target =
                "_blank";

            modalApplyBtn.rel =
                "noopener noreferrer";

            modalApplyBtn.classList.remove(
                "hidden"
            );

        } else {

            modalApplyBtn.removeAttribute(
                "href"
            );

            modalApplyBtn.classList.add(
                "hidden"
            );

        }


        jobModal.classList.add(
            "show"
        );
    }


    // --------------------------------
    // Close modal
    // --------------------------------

    function closeJobModal() {

        jobModal.classList.remove(
            "show"
        );

    }


    modalCloseBtn.addEventListener(
        "click",
        closeJobModal
    );


    jobModal.addEventListener(
        "click",
        function (event) {

            if (event.target === jobModal) {

                closeJobModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeJobModal();

            }

        }
    );


    // --------------------------------
    // HTML safety
    // --------------------------------

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value == null
                ? ""
                : String(value);

        return div.innerHTML;
    }

});