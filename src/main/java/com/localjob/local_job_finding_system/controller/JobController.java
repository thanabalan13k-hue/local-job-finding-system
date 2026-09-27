package com.localjob.local_job_finding_system.controller;

import com.localjob.local_job_finding_system.entity.Job;
import com.localjob.local_job_finding_system.repository.CompanyRepository;
import com.localjob.local_job_finding_system.repository.JobRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobController(
            JobRepository jobRepository,
            CompanyRepository companyRepository
    ) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    @GetMapping
    public List<Job> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        for (Job job : jobs) {

            if (job.getCompany_id() != null) {

                companyRepository.findById(job.getCompany_id())
                        .ifPresent(company ->
                                job.setCompany_name(
                                        company.getCompany_name()
                                )
                        );
            }
        }

        return jobs;
    }

    @PostMapping
    public Job addJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }

    @PutMapping("/{id}")
    public Job updateJob(
            @PathVariable Integer id,
            @RequestBody Job job
    ) {

        if (!jobRepository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            );
        }

        job.setJob_id(id);

        return jobRepository.save(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Integer id
    ) {

        if (!jobRepository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            );
        }

        Job job = jobRepository.findById(id)
                .orElseThrow();

        Integer companyId = job.getCompany_id();

        // Delete the job
        jobRepository.deleteById(id);

        // Check whether the company has any other jobs
        if (companyId != null) {

            boolean companyHasOtherJobs =
                    jobRepository.findAll()
                            .stream()
                            .anyMatch(existingJob ->
                                    companyId.equals(
                                            existingJob.getCompany_id()
                                    )
                            );

            // Delete company if no jobs are left
            if (!companyHasOtherJobs) {

                companyRepository.deleteById(companyId);
            }
        }

        return ResponseEntity.noContent().build();
    }
}