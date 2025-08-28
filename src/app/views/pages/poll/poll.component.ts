import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { PollService, Poll } from 'src/app/services/poll.service';

@Component({
  selector: 'app-poll',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './poll.component.html',
  styleUrl: './poll.component.scss'
})
export class PollComponent {
  polls: Poll[] = []; // Changed to array to match response
  filteredPolls: Poll[] = []; // For client-side search and pagination
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private pollService: PollService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.applySearchAndPagination();
    });
  }

  ngOnInit(): void {
    this.fetchPolls();
  }

  async fetchPolls(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.pollService.getPolls(this.payload);
      this.polls = response || [];
      this.applySearchAndPagination();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching polls:', error);
      swalHelper.showToast('Failed to fetch polls', 'error');
      this.polls = [];
      this.filteredPolls = [];
    } finally {
      this.loading = false;
    }
  }

  applySearchAndPagination(): void {
    // Apply search filter
    let filtered = this.polls;
    if (this.payload.search) {
      const searchLower = this.payload.search.toLowerCase();
      filtered = this.polls.filter(
        poll =>
          poll.title.toLowerCase().includes(searchLower) ||
          poll.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const start = (this.payload.page - 1) * this.payload.limit;
    const end = start + this.payload.limit;
    this.filteredPolls = filtered.slice(start, end);
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  onChange(): void {
    this.payload.page = 1;
    this.applySearchAndPagination();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.applySearchAndPagination();
  }

  get totalDocs(): number {
    // Calculate total docs for pagination based on filtered results
    const searchLower = this.payload.search.toLowerCase();
    return this.payload.search
      ? this.polls.filter(
          poll =>
            poll.title.toLowerCase().includes(searchLower) ||
            poll.description.toLowerCase().includes(searchLower)
        ).length
      : this.polls.length;
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