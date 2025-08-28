import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CasteService, CasteResponse } from 'src/app/services/caste.service';

@Component({
  selector: 'app-caste',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './caste.component.html',
  styleUrl: './caste.component.scss'
})
export class CasteComponent {
  castes: CasteResponse | null = null;
  loading: boolean = false;
  searchQuery: string = '';
  showCasteModal: boolean = false;
  selectedCaste: any = null;
  casteForm: FormGroup;

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private casteService: CasteService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.casteForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchCastes();
    });
  }

  ngOnInit(): void {
    this.fetchCastes();
  }

  async fetchCastes(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.casteService.getCastes(this.payload);
      console.log('Fetched castes:', response);
      this.castes = response || null;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching castes:', error);
      swalHelper.showToast('Failed to fetch castes', 'error');
      this.castes = null;
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
    this.fetchCastes();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchCastes();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  openAddModal(): void {
    this.selectedCaste = null;
    this.casteForm.reset({ name: '' });
    this.showCasteModal = true;
  }

  openEditModal(caste: any): void {
    this.selectedCaste = caste;
    this.casteForm.setValue({ name: caste.name });
    this.showCasteModal = true;
  }

  closeCasteModal(): void {
    this.showCasteModal = false;
    this.selectedCaste = null;
    this.casteForm.reset({ name: '' });
  }

  async saveCaste(): Promise<void> {
    if (this.casteForm.invalid) {
      swalHelper.showToast('Please enter a valid caste name!', 'warning');
      return;
    }

    try {
      if (this.selectedCaste) {
        // Update
        await this.casteService.updateCaste({
          _id: this.selectedCaste._id,
          name: this.casteForm.value.name
        });
        swalHelper.showToast('Caste updated successfully', 'success');
      } else {
        // Add
        await this.casteService.addCaste({ name: this.casteForm.value.name });
        swalHelper.showToast('Caste added successfully', 'success');
      }
      this.closeCasteModal();
      this.fetchCastes();
    } catch (error) {
      console.error('Error saving caste:', error);
      swalHelper.showToast('Failed to save caste', 'error');
    }
  }

  async deleteCaste(caste: any): Promise<void> {
    try {
      await swalHelper.confirmation(
        'Delete Caste',
        'Are you sure you want to delete this caste?',
        'warning');
      await this.casteService.deleteCaste({ _id: caste._id });
      swalHelper.showToast('Caste deleted successfully', 'success');
      this.fetchCastes();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting caste:', error);
        swalHelper.showToast('Failed to delete caste', 'error');
      }
    }
  }
}