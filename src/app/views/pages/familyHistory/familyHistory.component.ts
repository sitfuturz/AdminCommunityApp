import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamilyHistoryService, FamilyHistoryResponse, UserTreeData, TreeData } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-family-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [FamilyHistoryService],
  templateUrl: './familyHistory.component.html',
  styleUrls: ['./familyHistory.component.css'],
})
export class FamilyHistoryComponent implements OnInit, AfterViewInit {
  familyHistory: FamilyHistoryResponse = {
    users: [],
    pagination: {
      totalDocs: 0,
      totalPages: 1,
      page: 1,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false
    }
  };
  
  loading: boolean = false;
  searchQuery: string = '';
  expandedUsers: Set<string> = new Set();
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private familyHistoryService: FamilyHistoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchFamilyHistory();
    });
  }

  ngOnInit(): void {
    this.fetchFamilyHistory();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  async fetchFamilyHistory(): Promise<void> {
    this.loading = true;
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.familyHistoryService.getAllFamilyTrees(requestData);
      
      if (response && response.data) {
        this.familyHistory = response.data;
        
        // Validate and normalize response
        if (!this.familyHistory.users || !Array.isArray(this.familyHistory.users)) {
          this.familyHistory.users = [];
        }
        
        if (!this.familyHistory.pagination) {
          this.familyHistory.pagination = {
            totalDocs: 0,
            totalPages: 1,
            page: 1,
            limit: this.payload.limit,
            hasNextPage: false,
            hasPrevPage: false
          };
        }
        
        // Synchronize payload.page with backend response
        this.payload.page = this.familyHistory.pagination.page;
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching family history:', error);
      swalHelper.showToast('Failed to fetch family history', 'error');
      
      // Reset to empty state
      this.familyHistory = {
        users: [],
        pagination: {
          totalDocs: 0,
          totalPages: 1,
          page: 1,
          limit: this.payload.limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
      this.payload.page = 1;
      this.cdr.detectChanges();
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
    this.fetchFamilyHistory();
  }

  onPageChange(page: number): void {
    if (page !== this.payload.page) {
      this.payload.page = page;
      this.fetchFamilyHistory();
    }
  }

  toggleUserExpansion(userId: string): void {
    if (this.expandedUsers.has(userId)) {
      this.expandedUsers.delete(userId);
    } else {
      this.expandedUsers.add(userId);
    }
  }

  isUserExpanded(userId: string): boolean {
    return this.expandedUsers.has(userId);
  }

  getUserTreesCount(user: UserTreeData): number {
    return user.trees ? user.trees.length : 0;
  }

  formatPhoneNumber(phone: string): string {
    if (!phone || phone.trim() === '') return 'Not provided';
    return phone;
  }

  formatEmail(email: string): string {
    if (!email || email.trim() === '') return 'Not provided';
    return email;
  }

  formatRelation(relation: string): string {
    if (!relation || relation.trim() === '') return 'Unknown';
    return relation.charAt(0).toUpperCase() + relation.slice(1).toLowerCase();
  }

  formatName(name: string): string {
    if (!name || name.trim() === '') return 'Unnamed';
    return name;
  }

  getInitials(name: string): string {
    if (!name || name.trim() === '') return 'UN';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#6c757d';
    
    const colors = [
      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', 
      '#e74a3b', '#858796', '#5a5c69', '#6f42c1',
      '#e83e8c', '#fd7e14', '#20c997', '#17a2b8'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}