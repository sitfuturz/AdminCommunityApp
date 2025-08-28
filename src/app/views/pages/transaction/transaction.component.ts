import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { TransactionService, Transaction, TransactionBalance, TransactionsWithBalanceResponse } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  balance: TransactionBalance | null = null;
  transactionsWithBalance: TransactionsWithBalanceResponse | null = null;
  loading: boolean = false;
  searchQuery: string = '';
  showOpeningBalanceModal: boolean = false;
  showIncomeModal: boolean = false;
  showExpenseModal: boolean = false;
  openingBalanceForm: FormGroup;
  incomeForm: FormGroup;
  expenseForm: FormGroup;

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.openingBalanceForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    this.incomeForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.expenseForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.applySearchAndPagination();
    });
  }

  ngOnInit(): void {
    this.fetchTransactionsWithBalance();
    this.fetchBalance();
  }

  async fetchTransactionsWithBalance(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.transactionService.fetchTransactionsWithBalance({});
      this.transactionsWithBalance = response || null;
      this.transactions = response?.transactions || [];
      this.applySearchAndPagination();
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error fetching transactions with balance:', error);
      swalHelper.showToast(error.message || 'Failed to fetch transactions', 'error');
      this.transactions = [];
      this.filteredTransactions = [];
    } finally {
      this.loading = false;
    }
  }

  async fetchBalance(): Promise<void> {
    try {
      const response = await this.transactionService.getBalance({});
      this.balance = response || null;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      swalHelper.showToast(error.message || 'Balance not found', 'error');
      this.balance = null;
    }
  }

  applySearchAndPagination(): void {
    let filtered = this.transactions;
    if (this.payload.search) {
      const searchLower = this.payload.search.toLowerCase();
      filtered = this.transactions.filter(
        transaction => transaction.description.toLowerCase().includes(searchLower)
      );
    }

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
      return `-${amount.toFixed(2)}`;
    }
    return amount.toFixed(2);
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

  openOpeningBalanceModal(): void {
    this.showOpeningBalanceModal = true;
    this.openingBalanceForm.reset({ amount: 0, description: '' });
  }

  closeOpeningBalanceModal(): void {
    this.showOpeningBalanceModal = false;
  }

  async submitOpeningBalance(): Promise<void> {
    if (this.openingBalanceForm.invalid) {
      swalHelper.showToast('Please enter a valid amount!', 'warning');
      return;
    }

    try {
      const response = await this.transactionService.setOpeningBalance(this.openingBalanceForm.value);
      this.balance = response;
      swalHelper.showToast('Opening balance set successfully', 'success');
      this.closeOpeningBalanceModal();
      this.fetchTransactionsWithBalance();
    } catch (error: any) {
      console.error('Error setting opening balance:', error);
      const errorMessage = error.message || (error.errors ? error.errors.join(', ') : 'Failed to set opening balance');
      swalHelper.showToast(errorMessage, 'error');
    }
  }

  openIncomeModal(): void {
    this.showIncomeModal = true;
    this.incomeForm.reset({ amount: 0, description: '' });
  }

  closeIncomeModal(): void {
    this.showIncomeModal = false;
  }

  async submitIncome(): Promise<void> {
    if (this.incomeForm.invalid) {
      swalHelper.showToast('Please fill all required fields!', 'warning');
      return;
    }

    try {
      const response = await this.transactionService.addIncome(this.incomeForm.value);
      this.balance = { ...this.balance!, currentBalance: response.currentBalance };
      swalHelper.showToast('Income added successfully', 'success');
      this.closeIncomeModal();
      this.fetchTransactionsWithBalance();
    } catch (error: any) {
      console.error('Error adding income:', error);
      const errorMessage = error.message || (error.errors ? error.errors.join(', ') : 'Failed to add income');
      swalHelper.showToast(errorMessage, 'error');
    }
  }

  openExpenseModal(): void {
    this.showExpenseModal = true;
    this.expenseForm.reset({ amount: 0, description: '' });
  }

  closeExpenseModal(): void {
    this.showExpenseModal = false;
  }

  async submitExpense(): Promise<void> {
    if (this.expenseForm.invalid) {
      swalHelper.showToast('Please fill all required fields!', 'warning');
      return;
    }

    try {
      const response = await this.transactionService.addExpense(this.expenseForm.value);
      this.balance = { ...this.balance!, currentBalance: response.currentBalance };
      swalHelper.showToast('Expense added successfully', 'success');
      this.closeExpenseModal();
      this.fetchTransactionsWithBalance();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      const errorMessage = error.message || (error.errors ? error.errors.join(', ') : 'Failed to add expense');
      swalHelper.showToast(errorMessage, 'error');
    }
  }
}