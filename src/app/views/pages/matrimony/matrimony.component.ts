import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { MatrimonyService } from 'src/app/services/matrimony.service';
import { environment } from 'src/env/env.local';
declare var bootstrap: any;
declare var $: any;

interface MatrimonyProfile {
  _id: string;
  userId: string;
  name: string;
  gender: string;
  dateOfBirth: Date;
  height: string;
  religion: string;
  mobileNo: string;
  caste: string;
  subCaste: string;
  motherTongue: string;
  education: string;
  educationDetails: string;
  annualIncome: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  maritalStatus: string;
  familyDetails: {
    familyType: string;
    familyStatus: string;
    fatherOccupation: string;
    motherOccupation: string;
  };
  diet: string;
  bio: string;
  userProfileImages: string[];
  workDetails: string;
  workAs: string;
  occupation: string;
  isDeleted: boolean;
  isActive: boolean;
  profileFor: string;
  partnerPreferences: any;
  extraDetails: any;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MatrimonyProfileResponse {
  docs: MatrimonyProfile[];
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
  selector: 'app-matrimony',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,ReactiveFormsModule,FormsModule,NgSelectModule],
  templateUrl: './matrimony.component.html',
  styleUrl: './matrimony.component.scss'
})
export class MatrimonyComponent {
     profiles: MatrimonyProfileResponse = {
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
  selectedProfile: MatrimonyProfile | null = null;
  profileModal: any;
  profileDetailModal: any;
  formSubmitted: boolean = false;
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10,
    isActive: null
  };

  status=[
    {id:true,label:'Active'},
    {id:false,label:'Inactive'}
  ]

  constructor(
    private matrimonyService: MatrimonyService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchProfiles();
    });
  }

  ngOnInit(): void {
    this.fetchProfiles();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('profileModal');
      if (modalElement) {
        this.profileModal = new bootstrap.Modal(modalElement);
      }
      
      const detailModalElement = document.getElementById('profileDetailModal');
      if (detailModalElement) {
        this.profileDetailModal = new bootstrap.Modal(detailModalElement);
      }
    }, 300);
  }

  async fetchProfiles(): Promise<void> {
    this.loading = true;
    
    try {
      
      const response = await this.matrimonyService.getAllData(this.payload);
      this.profiles = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching profiles:', error);
      swalHelper.showToast('Failed to fetch profiles', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchProfileById(profileId: string): Promise<void> {
    try {
      this.loading = true;
      const response = await this.matrimonyService.getProfileData({ _id: profileId });
      this.selectedProfile = response;
      this.showProfileDetailModal();
    } catch (error) {
      console.error('Error fetching profile details:', error);
      swalHelper.showToast('Failed to fetch profile details', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deactivateProfile(profile: any): Promise<void> {
    try {
      const confirmed = await swalHelper.confirmation(
        'Deactivate Profile',
        'Are you sure you want to deactivate this profile?',
        'warning'
      );
      
      if (confirmed) {
        this.loading = true;
        const response = await this.matrimonyService.deactiveProfile({ _id: profile._id,isActive:!profile.isActive });
        
        if (response) {
          swalHelper.showToast('Profile deactivated successfully', 'success');
          this.fetchProfiles();
        } else {
          swalHelper.showToast('Failed to deactivate profile', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error deactivating profile:', error);
      swalHelper.showToast(error?.response?.data?.message || 'Failed to deactivate profile', 'error');
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
    this.fetchProfiles();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchProfiles();
  }

  openProfileDetail(profileId: string): void {
    this.fetchProfileById(profileId);
  }

  showProfileDetailModal(): void {
    this.cdr.detectChanges();
    
    if (this.profileDetailModal) {
      this.profileDetailModal.show();
    } else {
      try {
        const modalElement = document.getElementById('profileDetailModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.profileDetailModal = modalInstance;
          modalInstance.show();
        } else {
          $('#profileDetailModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#profileDetailModal').modal('show');
      }
    }
  }

  closeModal(): void {
    if (this.profileDetailModal) {
      this.profileDetailModal.hide();
    } else {
      $('#profileDetailModal').modal('hide');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  calculateAge(dateOfBirth: Date): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const baseUrl = environment.imageUrl;
    return imagePath.startsWith('http') ? imagePath : baseUrl + imagePath;
  }

  getGenderBadgeClass(gender: string): string {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'bg-primary';
      case 'female':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getMaritalStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'single':
      case 'never married':
        return 'bg-success';
      case 'divorced':
        return 'bg-warning';
      case 'widowed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getProfileImage(profile: MatrimonyProfile): string {
    if (profile.userProfileImages && profile.userProfileImages.length > 0) {
      return this.getImageUrl(profile.userProfileImages[0]);
    }
    return '';
  }

  hasProfileImage(profile: MatrimonyProfile): boolean {
    return profile.userProfileImages && profile.userProfileImages.length > 0;
  }
}
