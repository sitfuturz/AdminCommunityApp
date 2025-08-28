import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { TransactionService, Transaction } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent {
  transactions: Transaction[] = []; // Changed to array to match response
  filteredTransactions: Transaction[] = []; // For client-side search and pagination
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.applySearchAndPagination();
    });
  }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  async fetchTransactions(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.transactionService.getTransactions(this.payload);
      this.transactions = response || [];
      this.applySearchAndPagination();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      swalHelper.showToast('Failed to fetch transactions', 'error');
      this.transactions = [];
      this.filteredTransactions = [];
    } finally {
      this.loading = false;
    }
  }

  applySearchAndPagination(): void {
    // Apply search filter
    let filtered = this.transactions;
    if (this.payload.search) {
      const searchLower = this.payload.search.toLowerCase();
      filtered = this.transactions.filter(
        transaction => transaction.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const start = (this.payload.page - 1) * this.payload.limit;
    const end = start + this.payload.limit;
    this.filteredTransactions = filtered.slice(start, end);
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
      ? this.transactions.filter(
          transaction => transaction.description.toLowerCase().includes(searchLower)
        ).length
      : this.transactions.length;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'income':
        return 'bg-success';
      case 'expense':
        return 'bg-danger';
      case 'opening':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  formatAmount(amount: number, type: string): string {
    if (type === 'expense') {
      return `-${amount}`;
    }
    return `${amount}`;
  }

  getAmountClass(type: string): string {
    switch (type) {
      case 'income':
        return 'text-success';
      case 'expense':
        return 'text-danger';
      case 'opening':
        return 'text-primary';
      default:
        return '';
    }
  }
}