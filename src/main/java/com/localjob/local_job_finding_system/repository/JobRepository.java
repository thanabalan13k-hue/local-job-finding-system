package com.localjob.local_job_finding_system.repository;

import com.localjob.local_job_finding_system.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Integer> {
}