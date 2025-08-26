import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';
import { SecondhandProductService, Product, ProductResponse, User } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-secondhand-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [SecondhandProductService],
  templateUrl: './secondHand.component.html',
  styleUrls: ['./secondHand.component.css'],
})
export class SecondhandProductComponent implements OnInit, AfterViewInit {
  products: ProductResponse = {
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
  selectedProductForPreview: Product | null = null;
  productPreviewModal: any;
  imageurl = environment.imageUrl;
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  // Track user access status (assuming users are blocked if they can't access marketplace)
  userAccessStatus: Map<string, boolean> = new Map();

  constructor(
    private secondhandProductService: SecondhandProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchProducts();
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const productPreviewModalElement = document.getElementById('productPreviewModal');
      if (productPreviewModalElement) {
        this.productPreviewModal = new bootstrap.Modal(productPreviewModalElement);
      }
      this.cdr.detectChanges();
    }, 300);
  }

  async fetchProducts(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.secondhandProductService.getAllProducts(this.payload);
      this.products = response.data || response;
      
      // Validate and normalize products response
      if (!this.products.docs || !Array.isArray(this.products.docs)) {
        this.products.docs = [];
      }
      if (!this.products.totalDocs || isNaN(this.products.totalDocs)) {
        this.products.totalDocs = 0;
      }
      if (!this.products.totalPages || isNaN(this.products.totalPages)) {
        this.products.totalPages = 1;
      }
      if (!this.products.page || isNaN(this.products.page)) {
        this.products.page = 1;
      }
      
      // Synchronize payload.page with backend response
      this.payload.page = this.products.page;
      
      // Initialize user access status (assuming all users have access initially)
      this.products.docs.forEach(product => {
        if (product.userId && product.userId._id) {
          if (!this.userAccessStatus.has(product.userId._id)) {
            this.userAccessStatus.set(product.userId._id, true); // Default to access granted
          }
        }
      });
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching products:', error);
      swalHelper.showToast('Failed to fetch products', 'error');
      this.products = {
        docs: [],
        totalDocs: 0,
        limit: this.payload.limit,
        page: this.payload.page,
        totalPages: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
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
    this.fetchProducts();
  }

  onPageChange(page: number): void {
    if (page !== this.payload.page) {
      this.payload.page = page;
      this.fetchProducts();
    }
  }

  openProductPreview(product: Product): void {
    this.selectedProductForPreview = product;
    this.showProductPreviewModal();
  }

  showProductPreviewModal(): void {
    this.cdr.detectChanges();
    
    if (this.productPreviewModal) {
      this.productPreviewModal.show();
    } else {
      try {
        const modalElement = document.getElementById('productPreviewModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.productPreviewModal = modalInstance;
          modalInstance.show();
        } else {
          $('#productPreviewModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing product preview modal:', error);
        $('#productPreviewModal').modal('show');
      }
    }
  }

  async toggleProductStatus(product: Product): Promise<void> {
    try {
      this.loading = true;
      
      const action = product.isActive ? 'remove' : 'restore';
      
      const result = await swalHelper.confirmation(
        `${action === 'remove' ? 'Remove' : 'Restore'} Product`,
        `Are you sure you want to ${action} this product?`,
        'warning'
      );
      
      if (result.isConfirmed) {
        const requestData = { _id: product._id };
        const response = await this.secondhandProductService.toggleProduct(requestData);
        
        if (response && response.success) {
          product.isActive = !product.isActive;
          swalHelper.showToast(`Product ${action}d successfully`, 'success');
        } else {
          swalHelper.showToast(response.message || `Failed to ${action} product`, 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      swalHelper.showToast('Failed to update product status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async toggleUserAccess(user: User): Promise<void> {
    if (!user || !user._id) {
      swalHelper.showToast('User information not available', 'error');
      return;
    }

    try {
      this.loading = true;
      
      const currentAccess = this.userAccessStatus.get(user._id) ?? true;
      const action = currentAccess ? 'block' : 'unblock';
      
      const result = await swalHelper.confirmation(
        `${action === 'block' ? 'Block' : 'Unblock'} User`,
        `Are you sure you want to ${action} ${user.name}'s marketplace access?`,
        'warning'
      );
      
      if (result.isConfirmed) {
        const requestData = { _id: user._id };
        const response = await this.secondhandProductService.toggleUserMarketplaceAccess(requestData);
        
        if (response && response.success) {
          this.userAccessStatus.set(user._id, !currentAccess);
          swalHelper.showToast(response.message || `User ${action}ed successfully`, 'success');
        } else {
          swalHelper.showToast(response.message || `Failed to ${action} user`, 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling user access:', error);
      swalHelper.showToast('Failed to update user access', 'error');
    } finally {
      this.loading = false;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'sold':
        return 'bg-primary';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getUserAccessButtonClass(user: User | undefined): string {
    if (!user || !user._id) return 'btn-outline-secondary';
    
    const hasAccess = this.userAccessStatus.get(user._id) ?? true;
    return hasAccess ? 'btn-outline-danger' : 'btn-outline-success';
  }

  getUserAccessIcon(user: User | undefined): string {
    if (!user || !user._id) return 'bi bi-person-slash';
    
    const hasAccess = this.userAccessStatus.get(user._id) ?? true;
    return hasAccess ? 'bi bi-person-slash' : 'bi bi-person-check';
  }

  getUserAccessText(user: User | undefined): string {
    if (!user || !user._id) return 'N/A';
    
    const hasAccess = this.userAccessStatus.get(user._id) ?? true;
    return hasAccess ? 'Block User' : 'Unblock User';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const baseUrl = this.imageurl;
    return imagePath.startsWith('http') ? imagePath : baseUrl + imagePath;
  }
}