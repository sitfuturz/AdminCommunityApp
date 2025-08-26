import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { BloodGroupService } from 'src/app/services/blood-group.service';

@Component({
  selector: 'app-blood-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './blood-group.component.html',
  styleUrl: './blood-group.component.scss'
})
export class BloodGroupComponent {
  requirements: any; // Explicitly define as an array
  loading: boolean = false;
  payload: any = {
    limit: 10,
    page: 1,
    search: ''
  };
  totalItems: number = 0;
  private searchSubject = new Subject<string>();
  showRequirementDetails: boolean = false;
  selectedRequirement: any;

  constructor(
    private bloodGroupService: BloodGroupService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchRequirements();
    });
  }

  ngOnInit(): void {
    this.fetchRequirements();
  }

  async fetchRequirements(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.bloodGroupService.listRequirements(this.payload);
      console.log(response); // For debugging
      this.requirements = response.docs; // Assign the docs array to requirements
      this.totalItems = response.totalDocs; // Set totalItems for pagination
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching blood group requirements:', error);
      swalHelper.showToast('Failed to fetch requirements', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  viewRequirementDetails(requirement: any): void {
    this.selectedRequirement = requirement;
    this.showRequirementDetails = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeRequirementDetails(): void {
    this.showRequirementDetails = false;
    this.selectedRequirement = null;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.payload.page = 1;
    this.searchSubject.next(this.payload.search);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchRequirements();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchRequirements();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getUrgencyBadgeClass(urgency: string): string {
    switch (urgency) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}
