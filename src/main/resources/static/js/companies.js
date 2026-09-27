document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("companySearch");
    const districtSelect = document.getElementById("companyDistrict");
    const searchButton = document.getElementById("companySearchButton");

    const companiesGrid = document.getElementById("companiesGrid");
    const companyCount = document.getElementById("companyCount");
    const noCompanies = document.getElementById("noCompanies");

    let allCompanies = [];

    fetch("http://localhost:8081/api/companies")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load companies");
            }
            return response.json();
        })
        .then(companies => {
            allCompanies = companies;
            displayCompanies(allCompanies);
        })
        .catch(error => {
            console.error("Error loading companies:", error);
            allCompanies = [];
            displayCompanies([]);
        });

    function displayCompanies(companies) {
        companiesGrid.innerHTML = "";

        companyCount.textContent =
            companies.length +
            (companies.length === 1 ? " company" : " companies");

        if (companies.length === 0) {
            noCompanies.style.display = "block";
            return;
        }

        noCompanies.style.display = "none";

        companies.forEach(function (company) {
            const companyId = company.company_id || company.companyId;
            const companyName =
                company.company_name ||
                company.companyName ||
                "Company";

            const district = company.district || "District not specified";
            const website = company.website || "";
            const address = company.address || "Address not specified";

            const card = document.createElement("div");
            card.className = "company-card";

            card.innerHTML = `
                <div class="company-top">
                    <div class="company-logo">
                        ${companyName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3>${companyName}</h3>
                        <div class="company-district">📍 ${district}</div>
                    </div>
                </div>

                <p class="company-description">${address}</p>

                <div class="company-actions">
                    <a
                        href="jobs.html?companyId=${companyId}"
                        class="company-button view-jobs"
                    >
                        View Jobs
                    </a>

                    ${
                        website
                            ? `<a
                                href="${website}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="company-button official-site"
                            >
                                Official Website
                            </a>`
                            : ""
                    }
                </div>
            `;

            companiesGrid.appendChild(card);
        });
    }

    function filterCompanies() {
        const searchText = searchInput.value.trim().toLowerCase();
        const selectedDistrict = districtSelect.value.trim().toLowerCase();

        const filteredCompanies = allCompanies.filter(function (company) {
            const companyName =
                (company.company_name || company.companyName || "")
                    .toLowerCase();

            const district =
                (company.district || "").toLowerCase();

            return (
                (searchText === "" || companyName.includes(searchText)) &&
                (selectedDistrict === "" || district === selectedDistrict)
            );
        });

        displayCompanies(filteredCompanies);
    }

    if (searchButton) {
        searchButton.addEventListener("click", filterCompanies);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                filterCompanies();
            }
        });
    }

    if (districtSelect) {
        districtSelect.addEventListener("change", filterCompanies);
    }
});