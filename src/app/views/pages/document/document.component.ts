import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { DocumentService } from 'src/app/services/document.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/env/env.local';
@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {
  documents: any;
  loading: boolean = false;
  searchQuery: string = '';

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchDocuments();
    });
  }

  ngOnInit(): void {
    this.fetchDocuments();
  }

  async fetchDocuments(): Promise<void> {
    this.loading = true;
    console.log("Payload", this.payload);
    try {
      const response = await this.documentService.getDocuments(this.payload);
      console.log("Response", response);
      this.documents = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching documents:', error);
      swalHelper.showToast('Failed to fetch documents', 'error');
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
    this.fetchDocuments();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchDocuments();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-danger';
  }

  showDocumentPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  previewFileName: string = '';

  previewDocument(document: any): void {
    if (document.fileUrl) {
      this.previewFileName = `${document.title || 'Document'}.pdf`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.imageUrl + document.fileUrl);
      this.showDocumentPreview = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
    } else {
      swalHelper.showToast('No document available for preview', 'warning');
    }
  }

  closeDocumentPreview(): void {
    this.showDocumentPreview = false;
    this.previewUrl = null;
    this.previewFileName = '';
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }
}
