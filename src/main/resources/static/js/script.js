document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       HOME SEARCH
    ========================================= */

    const searchButton = document.getElementById("homeSearchBtn");
    const jobSearch = document.getElementById("homeJobSearch");
    const district = document.getElementById("homeDistrict");

    if (searchButton) {

        searchButton.addEventListener("click", function () {

            const searchText = jobSearch
                ? jobSearch.value.trim()
                : "";

            const selectedDistrict = district
                ? district.value
                : "";

            let url = "jobs.html";

            const params = new URLSearchParams();

            if (searchText !== "") {
                params.append("search", searchText);
            }

            if (selectedDistrict !== "") {
                params.append("district", selectedDistrict);
            }

            if (params.toString() !== "") {
                url += "?" + params.toString();
            }

            window.location.href = url;
        });
    }


    /* =========================================
       LOAD FEATURED JOBS
    ========================================= */

    const quickInfo = document.querySelector(".quick-info");

    if (quickInfo) {

        fetch("http://localhost:8081/api/jobs")
            .then(response => {

                if (!response.ok) {
                    throw new Error("Unable to load jobs");
                }

                return response.json();
            })
            .then(jobs => {

                createFeaturedJobs(jobs);

            })
            .catch(error => {

                console.error(
                    "Featured jobs error:",
                    error
                );

                createFeaturedJobs([]);
            });
    }


    /* =========================================
       CREATE FEATURED JOBS
    ========================================= */

    function createFeaturedJobs(jobs) {

        const oldSection =
            document.getElementById("featuredJobsSection");

        if (oldSection) {
            oldSection.remove();
        }


        const section =
            document.createElement("section");

        section.id =
            "featuredJobsSection";

        section.className =
            "featured-jobs-section";


        section.innerHTML = `

            <div class="featured-heading">

                <div>

                    <p class="tag">
                        JOB OPPORTUNITIES
                    </p>

                    <h2>
                        Featured Jobs
                    </h2>

                    <p>
                        Explore available jobs from companies
                        in Tirunelveli and Tenkasi.
                    </p>

                </div>


                <a
                    href="jobs.html"
                    class="view-all-jobs">

                    View All Jobs →

                </a>

            </div>


            <div
                class="featured-job-grid"
                id="featuredJobGrid">

            </div>
        `;


        quickInfo.insertAdjacentElement(
            "afterend",
            section
        );


        const grid =
            document.getElementById(
                "featuredJobGrid"
            );


        /* =========================================
           NO JOBS
        ========================================= */

        if (!Array.isArray(jobs) || jobs.length === 0) {

            grid.innerHTML = `

                <div class="featured-empty">

                    <div class="empty-icon">
                        🔎
                    </div>

                    <h3>
                        No jobs available
                    </h3>

                    <p>
                        New job opportunities will appear
                        here when they are added.
                    </p>

                </div>
            `;

            addHomePageStyles();

            return;
        }


        /* =========================================
           REMOVE DUPLICATE JOBS
        ========================================= */

        const uniqueJobs = [];

        const jobKeys = new Set();


        jobs.forEach(job => {

            const title =
                (
                    job.job_title ||
                    job.jobTitle ||
                    ""
                )
                .trim()
                .toLowerCase();


            const company =
                (
                    job.company_name ||
                    job.companyName ||
                    ""
                )
                .trim()
                .toLowerCase();


            const location =
                (
                    job.location ||
                    job.district ||
                    ""
                )
                .trim()
                .toLowerCase();


            const key =
                title +
                "|" +
                company +
                "|" +
                location;


            if (!jobKeys.has(key)) {

                jobKeys.add(key);

                uniqueJobs.push(job);
            }

        });


        /* =========================================
           SHOW MAXIMUM 4 JOBS
        ========================================= */

        const featuredJobs =
            uniqueJobs.slice(0, 4);


        featuredJobs.forEach(job => {

            const companyName =
                job.company_name ||
                job.companyName ||
                "Company";


            const jobTitle =
                job.job_title ||
                job.jobTitle ||
                "Job Opportunity";


            const jobDistrict =
                job.district ||
                "Local";


            const jobType =
                job.job_type ||
                job.jobType ||
                "Job";


            const location =
                job.location ||
                jobDistrict;


            const jobId =
                job.job_id ||
                job.jobId ||
                "";


            /* =========================================
               FORMAT SALARY
            ========================================= */

            const salary =
                formatSalary(job.salary);


            const card =
                document.createElement("div");


            card.className =
                "featured-job-card";


            card.innerHTML = `

                <div class="featured-card-top">

                    <div class="company-icon">

                        ${getInitial(companyName)}

                    </div>


                    <div>

                        <p class="featured-company">

                            ${escapeHTML(companyName)}

                        </p>


                        <h3>

                            ${escapeHTML(jobTitle)}

                        </h3>

                    </div>

                </div>


                <div class="featured-job-info">

                    <span>

                        📍
                        ${escapeHTML(location)}

                    </span>


                    <span>

                        💼
                        ${escapeHTML(jobType)}

                    </span>

                </div>


                <div class="featured-salary">

                    ${escapeHTML(salary)}

                </div>


                <button
                    type="button"
                    class="featured-details-btn">

                    View Details

                    <span>
                        →
                    </span>

                </button>

            `;


            /* =========================================
               VIEW DETAILS
            ========================================= */

            const button =
                card.querySelector(
                    ".featured-details-btn"
                );


            button.addEventListener(
                "click",
                function () {

                    if (jobId) {

                        window.location.href =
                            "jobs.html?jobId=" +
                            encodeURIComponent(jobId);

                    } else {

                        window.location.href =
                            "jobs.html";
                    }

                }
            );


            grid.appendChild(card);

        });


        addHomePageStyles();
    }


    /* =========================================
       FORMAT SALARY
    ========================================= */

    function formatSalary(value) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return "Salary not specified";
        }


        const text =
            String(value).trim();


        /*
         * Example:
         * 20000 → ₹20,000
         * 50000 → ₹50,000
         */

        if (/^\d+$/.test(text)) {

            return "₹" +
                Number(text)
                    .toLocaleString("en-IN");
        }


        /*
         * If database already contains
         * salary text such as:
         * ₹20,000 / month
         * 2 - 4 LPA
         */

        return text;
    }


    /* =========================================
       LOAD TOP COMPANIES
    ========================================= */

    fetch("http://localhost:8081/api/companies")
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Unable to load companies"
                );
            }

            return response.json();
        })
        .then(companies => {

            createTopCompanies(companies);

        })
        .catch(error => {

            console.error(
                "Companies loading error:",
                error
            );

        });


    /* =========================================
       CREATE TOP COMPANIES
    ========================================= */

    function createTopCompanies(companies) {

        const resumeSection =
            document.querySelector(
                ".resume-section"
            );


        if (!resumeSection) {
            return;
        }


        const oldSection =
            document.getElementById(
                "topCompaniesSection"
            );


        if (oldSection) {
            oldSection.remove();
        }


        const section =
            document.createElement("section");


        section.id =
            "topCompaniesSection";


        section.className =
            "top-companies-section";


        section.innerHTML = `

            <div class="companies-heading">

                <div>

                    <p class="tag">
                        TRUSTED COMPANIES
                    </p>

                    <h2>
                        Top Companies
                    </h2>

                    <p>
                        Explore companies offering
                        local opportunities.
                    </p>

                </div>


                <a
                    href="companies.html"
                    class="view-all-companies">

                    View All Companies →

                </a>

            </div>


            <div
                class="top-companies-grid"
                id="topCompaniesGrid">

            </div>
        `;


        resumeSection.insertAdjacentElement(
            "afterend",
            section
        );


        const grid =
            document.getElementById(
                "topCompaniesGrid"
            );


        /* =========================================
           NO COMPANIES
        ========================================= */

        if (
            !Array.isArray(companies) ||
            companies.length === 0
        ) {

            grid.innerHTML = `

                <div class="companies-empty">

                    <p>
                        No companies available yet.
                    </p>

                </div>

            `;

            addHomePageStyles();

            return;
        }


        /* =========================================
           REMOVE DUPLICATE COMPANIES
        ========================================= */

        const uniqueCompanies = [];

        const companyKeys = new Set();


        companies.forEach(company => {

            const companyName =
                (
                    company.company_name ||
                    company.companyName ||
                    ""
                )
                .trim();


            const key =
                companyName.toLowerCase();


            if (
                companyName &&
                !companyKeys.has(key)
            ) {

                companyKeys.add(key);

                uniqueCompanies.push(
                    company
                );
            }

        });


        /* =========================================
           SHOW MAXIMUM 6 COMPANIES
        ========================================= */

        const topCompanies =
            uniqueCompanies.slice(0, 6);


        topCompanies.forEach(company => {

            const companyId =
                company.company_id ||
                company.companyId ||
                "";


            const companyName =
                company.company_name ||
                company.companyName ||
                "Company";


            const companyDistrict =
                company.district ||
                "";


            const card =
                document.createElement("div");


            card.className =
                "top-company-card";


            card.innerHTML = `

                <div class="top-company-icon">

                    ${getInitial(companyName)}

                </div>


                <div class="top-company-info">

                    <h3>

                        ${escapeHTML(
                            companyName
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            companyDistrict
                        )}

                    </p>

                </div>


                <button
                    type="button"
                    class="company-jobs-btn">

                    View Jobs →

                </button>

            `;


            /* =========================================
               VIEW COMPANY JOBS
            ========================================= */

            const button =
                card.querySelector(
                    ".company-jobs-btn"
                );


            button.addEventListener(
                "click",
                function () {

                    if (companyId) {

                        window.location.href =
                            "jobs.html?companyId=" +
                            encodeURIComponent(
                                companyId
                            );

                    } else {

                        window.location.href =
                            "companies.html";

                    }

                }
            );


            grid.appendChild(card);

        });


        addHomePageStyles();
    }


    /* =========================================
       COMPANY INITIAL
    ========================================= */

    function getInitial(name) {

        if (!name) {
            return "J";
        }


        return String(name)
            .trim()
            .charAt(0)
            .toUpperCase();
    }


    /* =========================================
       HTML SAFETY
    ========================================= */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       HOME PAGE DYNAMIC STYLES
    ========================================= */

    function addHomePageStyles() {

        if (
            document.getElementById(
                "homeDynamicStyles"
            )
        ) {

            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "homeDynamicStyles";


        style.textContent = `

            /* =================================
               FEATURED JOBS
            ================================= */

            .featured-jobs-section {

                width: 100%;
                max-width: 1200px;

                margin: 0 auto;

                padding:
                    55px 30px;

                box-sizing: border-box;
            }


            .featured-heading,
            .companies-heading {

                display: flex;

                align-items: flex-end;

                justify-content: space-between;

                gap: 30px;

                margin-bottom: 25px;
            }


            .featured-heading h2,
            .companies-heading h2 {

                margin: 0 0 8px;

                font-family:
                    "Outfit",
                    sans-serif;

                font-size: 32px;

                line-height: 1.2;

                color:
                    var(--dark);
            }


            .featured-heading p:not(.tag),
            .companies-heading p:not(.tag) {

                margin: 0;

                color:
                    var(--muted);

                font-size: 13px;
            }


            .view-all-jobs,
            .view-all-companies {

                display: inline-flex;

                align-items: center;

                text-decoration: none;

                color:
                    var(--blue);

                border:
                    1px solid #dce3ff;

                background:
                    #ffffff;

                padding:
                    10px 15px;

                border-radius:
                    9px;

                font-size:
                    12px;

                font-weight:
                    700;

                white-space:
                    nowrap;

                transition:
                    0.2s ease;
            }


            .view-all-jobs:hover,
            .view-all-companies:hover {

                background:
                    var(--light);

                border-color:
                    var(--blue);
            }


            .featured-job-grid {

                display: grid;

                grid-template-columns:
                    repeat(
                        4,
                        minmax(0, 1fr)
                    );

                gap: 18px;
            }


            .featured-job-card {

                min-width: 0;

                background:
                    #ffffff;

                border:
                    1px solid var(--border);

                border-radius:
                    15px;

                padding:
                    18px;

                box-sizing:
                    border-box;

                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            }


            .featured-job-card:hover {

                transform:
                    translateY(-3px);

                box-shadow:
                    0 12px 30px
                    rgba(
                        18,
                        25,
                        55,
                        0.08
                    );
            }


            .featured-card-top {

                display: flex;

                align-items:
                    flex-start;

                gap: 11px;

                min-height:
                    58px;

                margin-bottom:
                    15px;
            }


            .company-icon,
            .top-company-icon {

                width:
                    42px;

                height:
                    42px;

                flex:
                    0 0 42px;

                border-radius:
                    10px;

                display: flex;

                align-items:
                    center;

                justify-content:
                    center;

                background:
                    #eef2ff;

                color:
                    var(--blue);

                font-size:
                    16px;

                font-weight:
                    800;
            }


            .featured-company {

                margin:
                    1px 0 4px;

                color:
                    var(--muted);

                font-size:
                    10px;

                font-weight:
                    600;

                white-space:
                    nowrap;

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                max-width:
                    155px;
            }


            .featured-job-card h3 {

                margin:
                    0;

                color:
                    var(--dark);

                font-family:
                    "Outfit",
                    sans-serif;

                font-size:
                    15px;

                line-height:
                    1.3;

                display:
                    -webkit-box;

                -webkit-line-clamp:
                    2;

                -webkit-box-orient:
                    vertical;

                overflow:
                    hidden;
            }


            .featured-job-info {

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    7px;

                padding-bottom:
                    13px;

                border-bottom:
                    1px solid
                    var(--border);
            }


            .featured-job-info span {

                color:
                    var(--muted);

                font-size:
                    10px;

                line-height:
                    1.3;
            }


            .featured-salary {

                margin-top:
                    13px;

                color:
                    var(--text);

                font-size:
                    12px;

                font-weight:
                    700;

                min-height:
                    16px;
            }


            .featured-details-btn {

                width:
                    100%;

                margin-top:
                    14px;

                padding:
                    10px;

                border:
                    1px solid
                    #dce3ff;

                border-radius:
                    8px;

                background:
                    #f8f9ff;

                color:
                    var(--blue);

                font-family:
                    inherit;

                font-size:
                    11px;

                font-weight:
                    700;

                cursor:
                    pointer;

                transition:
                    0.2s ease;
            }


            .featured-details-btn:hover {

                background:
                    var(--blue);

                color:
                    #ffffff;

                border-color:
                    var(--blue);
            }


            /* =================================
               TOP COMPANIES
            ================================= */

            .top-companies-section {

                width:
                    100%;

                max-width:
                    1200px;

                margin:
                    0 auto;

                padding:
                    20px 30px 55px;

                box-sizing:
                    border-box;
            }


            .top-companies-grid {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap:
                    15px;
            }


            .top-company-card {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                min-width:
                    0;

                background:
                    #ffffff;

                border:
                    1px solid
                    var(--border);

                border-radius:
                    13px;

                padding:
                    14px;

                box-sizing:
                    border-box;

                transition:
                    0.2s ease;
            }


            .top-company-card:hover {

                transform:
                    translateY(-2px);

                box-shadow:
                    0 8px 22px
                    rgba(
                        18,
                        25,
                        55,
                        0.06
                    );
            }


            .top-company-info {

                flex:
                    1;

                min-width:
                    0;
            }


            .top-company-info h3 {

                margin:
                    0 0 3px;

                color:
                    var(--dark);

                font-family:
                    "Outfit",
                    sans-serif;

                font-size:
                    13px;

                white-space:
                    nowrap;

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;
            }


            .top-company-info p {

                margin:
                    0;

                color:
                    var(--muted);

                font-size:
                    10px;
            }


            .company-jobs-btn {

                border:
                    none;

                background:
                    transparent;

                color:
                    var(--blue);

                font-family:
                    inherit;

                font-size:
                    10px;

                font-weight:
                    700;

                cursor:
                    pointer;

                white-space:
                    nowrap;
            }


            .company-jobs-btn:hover {

                text-decoration:
                    underline;
            }


            /* =================================
               EMPTY STATES
            ================================= */

            .featured-empty,
            .companies-empty {

                grid-column:
                    1 / -1;

                text-align:
                    center;

                padding:
                    38px 20px;

                border:
                    1px solid
                    var(--border);

                border-radius:
                    15px;

                background:
                    #ffffff;

                color:
                    var(--muted);
            }


            .featured-empty h3 {

                margin:
                    8px 0;

                color:
                    var(--dark);
            }


            .featured-empty p {

                margin:
                    0;

                font-size:
                    12px;
            }


            .empty-icon {

                font-size:
                    25px;
            }


            /* =================================
               TABLET
            ================================= */

            @media (max-width: 1000px) {

                .featured-job-grid {

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }


                .top-companies-grid {

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }
            }


            /* =================================
               MOBILE
            ================================= */

            @media (max-width: 600px) {

                .featured-jobs-section,
                .top-companies-section {

                    padding-left:
                        20px;

                    padding-right:
                        20px;
                }


                .featured-heading,
                .companies-heading {

                    flex-direction:
                        column;

                    align-items:
                        flex-start;
                }


                .featured-heading h2,
                .companies-heading h2 {

                    font-size:
                        28px;
                }


                .featured-job-grid,
                .top-companies-grid {

                    grid-template-columns:
                        1fr;
                }


                .view-all-jobs,
                .view-all-companies {

                    margin-top:
                        5px;
                }
            }

        `;


        document.head.appendChild(style);
    }

});