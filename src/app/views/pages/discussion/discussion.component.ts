import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { DiscussionService } from 'src/app/services/discussion.service';
declare let bootstrap: any;
interface DiscussionPost {
  _id: string;
  title: string;
  description: string;
  adminId: string;
  totalComments: number;
  isActive: boolean;
  comments: {
    _id: string;
    postId: string;
    userId: string;
    name: string;
    comment: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface DiscussionResponse {
  docs: DiscussionPost[];
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
  selector: 'app-discussion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.scss'
})
export class DiscussionComponent implements OnInit {
  posts: any

  loading: boolean = false;
  status: { id: boolean | undefined; label: string }[] = [
    { id: undefined, label: 'All Statuses' },
    { id: true, label: 'Active' },
    { id: false, label: 'Inactive' }
  ];

  payload = {
    search: '',
    page: 1,
    limit: 10,
    isActive: undefined as boolean | undefined
  };

  private searchSubject = new Subject<string>();

  constructor(
    private discussionService: DiscussionService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchPosts();
    });
  }

  ngOnInit(): void {
    this.fetchPosts();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap collapse for each row
    this.cdr.detectChanges();
    const rows = document.querySelectorAll('.table tbody tr[data-post-id]');
    rows.forEach(row => {
      row.addEventListener('click', (event: Event) => {
        const target = event.target as Element;
        if (!target.closest('.dropdown')) {
          const postId = row.getAttribute('data-post-id');
          const collapse = document.getElementById(`collapse-${postId}`);
          if (collapse) {
            const bsCollapse = new bootstrap.Collapse(collapse, { toggle: true });
          }
        }
      }, { passive: true }); // Optional: Improves performance for scroll events
    });
  }

  toggleComments(postId: string, event: MouseEvent): void {
    // This method is now handled in ngAfterViewInit
  }

  async fetchPosts(): Promise<void> {
    this.loading = true;
    console.log('Fetching posts with payload:', this.payload);
    try {
      const response = await this.discussionService.getAllDiscussionPosts(this.payload);
      if (response) {
        console.log('Fetched posts:', response);
        this.posts = response;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching posts:', error);
      swalHelper.showToast('Failed to fetch discussion posts', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deactivatePost(postId: string, event: MouseEvent): Promise<void> {
    event.stopPropagation(); // Prevent collapse toggle on action click
    try {
      const confirmed = await swalHelper.confirmation(
        'Deactivate Post',
        'Are you sure you want to deactivate this post?',
        'warning'
      );

      if (confirmed) {
        this.loading = true;
        const response = await this.discussionService.deactivateDiscussionPost({ _id: postId, isActive: false });

        if (response) {
          swalHelper.showToast('Post deactivated successfully', 'success');
          this.fetchPosts();
        } else {
          swalHelper.showToast('Failed to deactivate post', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error deactivating post:', error);
      swalHelper.showToast(error?.response?.data?.message || 'Failed to deactivate post', 'error');
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.searchSubject.next(this.payload.search);
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchPosts();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchPosts();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  selectedPost: any;
  openCommentsModal(post: DiscussionPost, event: MouseEvent): void {
    event.stopPropagation(); // Prevent row click event
    this.selectedPost = post;
    const modalElement = document.getElementById('commentsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
    this.cdr.detectChanges();
  }
}
