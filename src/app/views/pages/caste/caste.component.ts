import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  selectedCaste: any = null;
  casteName: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private casteService: CasteService,
    private cdr: ChangeDetectorRef
  ) {
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
    this.casteName = '';
    // Open Bootstrap modal (assume #casteModal is the ID)
    const modal = document.getElementById('casteModal');
    if (modal) {
      (modal as any).modal('show');
    }
  }

  openEditModal(caste: any): void {
    this.selectedCaste = caste;
    this.casteName = caste.name;
    const modal = document.getElementById('casteModal');
    if (modal) {
      (modal as any).modal('show');
    }
  }

  async saveCaste(): Promise<void> {
    try {
      if (this.selectedCaste) {
        // Update
        await this.casteService.updateCaste(this.selectedCaste._id, { name: this.casteName });
        swalHelper.showToast('Caste updated successfully', 'success');
      } else {
        // Add
        await this.casteService.addCaste({ name: this.casteName });
        swalHelper.showToast('Caste added successfully', 'success');
      }
      const modal = document.getElementById('casteModal');
      if (modal) {
        (modal as any).modal('hide');
      }
      this.fetchCastes(); // Refresh list
    } catch (error) {
      swalHelper.showToast('Failed to save caste', 'error');
    }
  }

  async deleteCaste(id: string): Promise<void> {
    try {
      // await swalHelper.showConfirm('Are you sure you want to delete this caste?', 'warning');
      await this.casteService.deleteCaste(id);
      swalHelper.showToast('Caste deleted successfully', 'success');
      this.fetchCastes(); // Refresh list
    } catch (error) {
      if (error !== 'cancel') {
        swalHelper.showToast('Failed to delete caste', 'error');
      }
    }
  }
}