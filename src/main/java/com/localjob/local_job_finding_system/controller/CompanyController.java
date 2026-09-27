package com.localjob.local_job_finding_system.controller;

import com.localjob.local_job_finding_system.entity.Company;
import com.localjob.local_job_finding_system.repository.CompanyRepository;
import com.localjob.local_job_finding_system.repository.JobRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    public CompanyController(
            CompanyRepository companyRepository,
            JobRepository jobRepository
    ) {
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public List<Company> getAllCompanies() {

        List<Company> companies = companyRepository.findAll();

        List<Company> companiesWithJobs = companies.stream()
                .filter(company ->
                        jobRepository.findAll()
                                .stream()
                                .anyMatch(job ->
                                        company.getCompany_id()
                                                .equals(job.getCompany_id())
                                )
                )
                .toList();

        return companiesWithJobs;
    }

    @PostMapping
    public Company addCompany(@RequestBody Company company) {

        String email = company.getEmail() == null
                ? ""
                : company.getEmail().trim();

        String companyName = company.getCompany_name() == null
                ? ""
                : company.getCompany_name().trim();

        // First preference: find the company using its email.
        if (!email.isEmpty()) {

            return companyRepository.findFirstByEmailIgnoreCase(email)
                    .orElseGet(() ->
                            findByNameOrCreate(company, companyName)
                    );
        }

        // If email is empty, find it using the company name.
        return findByNameOrCreate(company, companyName);
    }

    private Company findByNameOrCreate(
            Company company,
            String companyName
    ) {

        if (!companyName.isEmpty()) {

            return companyRepository
                    .findFirstByCompanyNameIgnoreCase(companyName)
                    .orElseGet(() ->
                            companyRepository.save(company)
                    );
        }

        return companyRepository.save(company);
    }
}