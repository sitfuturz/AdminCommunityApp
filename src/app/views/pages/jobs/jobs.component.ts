import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { JobService } from 'src/app/services/job.service';
import { environment } from 'src/env/env.local';
declare var bootstrap: any;
declare var $: any;

interface Job {
  _id: string;
  userId: string;
  title: string;
  industry: string;
  description: string;
  jobDescription: string;
  status: string;
  isActive: boolean;
  isDeleted: boolean;
  extraDetails: any;
  createdAt: string;
  updatedAt: string;
}

interface JobResponse {
  docs: Job[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent {
    jobs: JobResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };

  loading: boolean = false;
  status: { id: boolean | undefined; label: string }[] = [
    { id: undefined, label: 'All Statuses' },
    { id: true, label: 'Active' },
    { id: false, label: 'Inactive' }
  ];

  payload = {
    search: '',
    page: 1,
    limit: 10,
    isActive: undefined as boolean | undefined
  };

  private searchSubject = new Subject<string>();
  showJobDescriptionPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  previewFileName: string = '';

  constructor(
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchJobs();
    });
  }

  ngOnInit(): void {
    this.fetchJobs();
  }

  async fetchJobs(): Promise<void> {
    this.loading = true;
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search,
        isActive: this.payload.isActive
      };
      const response = await this.jobService.getAllJobs(requestData);
      this.jobs = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      swalHelper.showToast('Failed to fetch jobs', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deactivateJob(job: any): Promise<void> {
    try {
      const confirmed = await swalHelper.confirmation(
        'Update Job Status',
        'Are you really want to Update Status of this job?',
        'warning'
      );
      if (confirmed) {
        this.loading = true;
        const response = await this.jobService.deactivateJob({ _id: job._id, isActive: !job.isActive });
        if (response) {
          swalHelper.showToast('Job status updated successfully', 'success');
          this.fetchJobs();
        } else {
          swalHelper.showToast('Failed to Update Status', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error deactivating job:', error);
      swalHelper.showToast(error?.response?.data?.message || 'Failed to Update Status', 'error');
    } finally {
      this.loading = false;
    }
  }

  previewJobDescription(job: any): void {
    if (job.jobDescription) {
      this.previewFileName = `${job.title || 'Job'}_Description.pdf`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.imageUrl + job.jobDescription);
      this.showJobDescriptionPreview = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
    } else {
      swalHelper.showToast('No job description available for preview', 'warning');
    }
  }

  closeJobDescriptionPreview(): void {
    this.showJobDescriptionPreview = false;
    this.previewUrl = null;
    this.previewFileName = '';
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.payload.page = 1;
    this.searchSubject.next(this.payload.search);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchJobs();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchJobs();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(status: boolean): string {
    switch (status) {
      case true:
        return 'bg-success';
      case false:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
