import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { LeadService } from 'src/app/services/lead.service';

export interface Lead {
  _id: string;
  product: string;
  
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  userId: {
    name: string;
    profilePic: string;
    chapter_name: string;
  };
}

export interface LeadResponse {
  docs: Lead[];
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
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss'
})
export class LeadsComponent {
  leads: LeadResponse = {
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
  searchQuery: string = '';
  adminUserId: string = ''; // Store admin's userId for updateLeadStatus

  payload = {
    page: 1,
    limit: 10,
    status: ''
  };

  private searchSubject = new Subject<string>();

  constructor(
    private leadService: LeadService,
    private cdr: ChangeDetectorRef,
    private storage: AppStorage
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchLeads();
    });
  }

  ngOnInit(): void {
    this.adminUserId = this.storage.get(common.ADMIN_DATA) || ''; // Ensure common.userId is defined
    this.fetchLeads();
  }

  async fetchLeads(): Promise<void> {
    this.loading = true;
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        status: this.payload.status || undefined
      };
      const response = await this.leadService.getAllLeads(requestData);
      console.log("Leads Response:", response);
      this.leads = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching leads:', error);
      swalHelper.showToast('Failed to fetch leads', 'error');
    } finally {
      this.loading = false;
    }
  }

  async updateLeadStatus(lead: Lead, status: 'pending' | 'accepted' | 'rejected'): Promise<void> {
    if (!this.adminUserId) {
      swalHelper.showToast('Admin not authenticated', 'error');
      return;
    }
    try {
      const requestData = {
        userId: this.adminUserId,
        askId: lead._id, // Adjust if askId is different
        leadId: lead._id,
        status
      };
      await this.leadService.updateLeadStatus(requestData);
      swalHelper.showToast('Lead status updated successfully', 'success');
      this.fetchLeads(); // Refresh leads after status update
    } catch (error) {
      console.error('Error updating lead status:', error);
      swalHelper.showToast('Failed to update lead status', 'error');
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.status = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchLeads();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchLeads();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
}