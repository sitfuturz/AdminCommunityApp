import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CircularService } from 'src/app/services/circular.service';
import { environment } from 'src/env/env.local';

export interface Circular {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  isActive: boolean;
  createdAt: string;
  adminId: string;
}

export interface CircularResponse {
  docs: Circular[];
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
  selector: 'app-circular',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './circular.component.html',
  styleUrl: './circular.component.scss'
})
export class CircularComponent {
  circulars: any;
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private circularService: CircularService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchCirculars();
    });
  }

  ngOnInit(): void {
    this.fetchCirculars();
  }

  async fetchCirculars(): Promise<void> {
    this.loading = true;

    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };

      const response = await this.circularService.getCirculars(requestData);
      this.circulars = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching circulars:', error);
      swalHelper.showToast('Failed to fetch circulars', 'error');
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
    this.fetchCirculars();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchCirculars();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-danger';
  }

  showCircularPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  previewFileName: string = '';
  previewCircular(circular: Circular): void {
    if (circular.fileUrl) {
      this.previewFileName = `${circular.title || 'Circular'}.pdf`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.imageUrl + circular.fileUrl);
      this.showCircularPreview = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
    } else {
      swalHelper.showToast('No circular file available for preview', 'warning');
    }
  }

  closeCircularPreview(): void {
    this.showCircularPreview = false;
    this.previewUrl = null;
    this.previewFileName = '';
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }
}
