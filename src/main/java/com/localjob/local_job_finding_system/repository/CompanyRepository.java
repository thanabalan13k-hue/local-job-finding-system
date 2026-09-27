package com.localjob.local_job_finding_system.repository;

import com.localjob.local_job_finding_system.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Integer> {

    Optional<Company> findFirstByEmailIgnoreCase(String email);

    @Query("SELECT c FROM Company c " +
           "WHERE LOWER(c.company_name) = LOWER(:companyName)")
    Optional<Company> findFirstByCompanyNameIgnoreCase(
            @Param("companyName") String companyName
    );
}