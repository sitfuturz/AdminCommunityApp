import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  polls: Poll[] = [];
  filteredPolls: Poll[] = [];
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  showCreateModal: boolean = false;
  createForm: FormGroup;

  showViewModal: boolean = false;
  selectedPoll: Poll | null = null;
  viewLoading: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(
    private pollService: PollService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      options: this.fb.array([], Validators.required),
      expiryDate: [this.getDefaultExpiryDate(), Validators.required]
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.applySearchAndPagination();
    });
  }

  get options(): FormArray {
    return this.createForm.get('options') as FormArray;
  }

  addOption(text: string = ''): void {
    this.options.push(this.fb.control(text, Validators.required));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  getDefaultExpiryDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16); // For datetime-local format
  }

  ngOnInit(): void {
    this.fetchPolls();
  }

  async fetchPolls(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.pollService.getAllPolls(this.payload);
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
    let filtered = this.polls;
    if (this.payload.search) {
      const searchLower = this.payload.search.toLowerCase();
      filtered = this.polls.filter(
        poll =>
          poll.title.toLowerCase().includes(searchLower) ||
          poll.description.toLowerCase().includes(searchLower)
      );
    }

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

  openCreateModal(): void {
    this.showCreateModal = true;
    // Clear options explicitly
    while (this.options.length > 0) {
      this.options.removeAt(0);
    }
    this.createForm.reset({
      title: '',
      description: '',
      options: [],
      expiryDate: this.getDefaultExpiryDate()
    });
    // Add two default empty options for convenience
    this.addOption();
    this.addOption();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  async submitCreatePoll(): Promise<void> {
    if (this.createForm.invalid) return;

    const formValue = this.createForm.value;
    const payload = {
      title: formValue.title,
      description: formValue.description,
      options: formValue.options, // Array of strings
      expiryDate: new Date(formValue.expiryDate).toISOString()
    };

    try {
      await this.pollService.createPoll(payload);
      swalHelper.showToast('Poll created successfully', 'success');
      this.closeCreateModal();
      this.fetchPolls();
    } catch (error:any) {
      console.error('Error creating poll:', error);
      swalHelper.showToast(error.message, 'error');
    }
  }

  async openViewModal(pollId: string): Promise<void> {
    this.viewLoading = true;
    this.showViewModal = true;
    try {
      const response = await this.pollService.getSinglePoll({ _id: pollId });
      this.selectedPoll = Array.isArray(response) ? response[0] : response;
    } catch (error) {
      console.error('Error fetching poll details:', error);
      swalHelper.showToast('Failed to fetch poll details', 'error');
      this.closeViewModal();
    } finally {
      this.viewLoading = false;
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedPoll = null;
  }
}