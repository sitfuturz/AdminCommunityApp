import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { SurveyService, SurveyResponse } from 'src/app/services/survey.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent {
  surveys: SurveyResponse | null = null;
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private surveyService: SurveyService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchSurveys();
    });
  }

  ngOnInit(): void {
    this.fetchSurveys();
  }

  async fetchSurveys(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.surveyService.getSurveys(this.payload);
      this.surveys = response || null; // Ensure surveys is not undefined
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching surveys:', error);
      swalHelper.showToast('Failed to fetch surveys', 'error');
      this.surveys = null; // Reset surveys on error
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchSurveys();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSurveys();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(expiryDate: string, isActive: boolean): string {
  if (!isActive) return 'bg-danger';
  const now = new Date();
  const expiry = new Date(expiryDate);
  return expiry > now ? 'bg-success' : 'bg-danger';
}

  formatExpiryStatus(expiryDate: string, isActive: boolean): string {
    if (!isActive) return 'Inactive';
    const now = new Date();
    const expiry = new Date(expiryDate);
    return expiry > now ? 'Active' : 'Expired';
  }
}