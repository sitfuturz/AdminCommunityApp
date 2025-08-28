import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CasteService, CasteResponse } from 'src/app/services/caste.service';
import { SubCasteService, SubCasteResponse } from 'src/app/services/subcaste.service';

@Component({
  selector: 'app-subcaste',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './subcaste.component.html',
  styleUrl: './subcaste.component.scss'
})
export class SubcasteComponent {
  subcastes: SubCasteResponse | null = null;
  castes: CasteResponse | null = null;
  loading: boolean = false;
  casteLoading: boolean = false;
  searchQuery: string = '';
  showSubcasteModal: boolean = false;
  selectedSubcaste: any = null;
  subcasteForm: FormGroup;

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private subcasteService: SubCasteService,
    private casteService: CasteService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.subcasteForm = this.fb.group({
      caste_id: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchSubcastes();
    });
  }
  

  ngOnInit(): void {
    this.fetchSubcastes();
    this.fetchCastes();
  }

  async fetchSubcastes(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.subcasteService.getSubCastes(this.payload);
      this.subcastes = response || null;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching sub-castes:', error);
      swalHelper.showToast('Failed to fetch sub-castes', 'error');
      this.subcastes = null;
    } finally {
      this.loading = false;
    }
  }

  async fetchCastes(): Promise<void> {
    this.casteLoading = true;
    try {
      const response = await this.casteService.getCastes({ page: 1, limit: 100, search: '' });
      this.castes = response || null;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching castes:', error);
      swalHelper.showToast('Failed to fetch castes', 'error');
      this.castes = null;
    } finally {
      this.casteLoading = false;
    }
  }

getCasteName(subcaste: any): string {
  if (!subcaste || !subcaste.caste_id || !subcaste.caste_id.name) return 'N/A';
  return subcaste.caste_id.name;
}



  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchSubcastes();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSubcastes();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  openAddModal(): void {
    this.selectedSubcaste = null;
    this.subcasteForm.reset({ caste_id: '', name: '' });
    this.showSubcasteModal = true;
  }

  openEditModal(subcaste: any): void {
    this.selectedSubcaste = subcaste;
    this.subcasteForm.setValue({ caste_id: subcaste.caste_id, name: subcaste.name });
    this.showSubcasteModal = true;
  }

  closeSubcasteModal(): void {
    this.showSubcasteModal = false;
    this.selectedSubcaste = null;
    this.subcasteForm.reset({ caste_id: '', name: '' });
  }

  async saveSubcaste(): Promise<void> {
    if (this.subcasteForm.invalid) {
      swalHelper.showToast('Please fill all required fields!', 'warning');
      return;
    }

    try {
      if (this.selectedSubcaste) {
        // Update
        await this.subcasteService.updateSubCaste({
          _id: this.selectedSubcaste._id,
          caste_id: this.subcasteForm.value.caste_id,
          name: this.subcasteForm.value.name
        });
        swalHelper.showToast('Sub-caste updated successfully', 'success');
      } else {
        // Add
        await this.subcasteService.addSubCaste({
          caste_id: this.subcasteForm.value.caste_id,
          name: this.subcasteForm.value.name
        });
        swalHelper.showToast('Sub-caste added successfully', 'success');
      }
      this.closeSubcasteModal();
      this.fetchSubcastes();
    } catch (error) {
      console.error('Error saving sub-caste:', error);
      swalHelper.showToast('Failed to save sub-caste', 'error');
    }
  }

  async deleteSubcaste(subcaste: any): Promise<void> {
    try {
      await swalHelper.confirmation(
        'Delete SubCaste',
        'Are you sure you want to delete this caste?',
        'warning');
      await this.subcasteService.deleteSubCaste({ _id: subcaste._id });
      swalHelper.showToast('Sub-caste deleted successfully', 'success');
      this.fetchSubcastes();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting sub-caste:', error);
        swalHelper.showToast('Failed to delete sub-caste', 'error');
      }
    }
  }
}