import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { SurveyService, SurveyResponse, Survey } from 'src/app/services/survey.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent {
  surveys: SurveyResponse | null = null;
  loading: boolean = false;
  searchQuery: string = '';
  showCreateModal: boolean = false;
  createForm: FormGroup;
  showViewModal: boolean = false;
  selectedSurvey: Survey | null = null;
  viewLoading: boolean = false;

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(
    private surveyService: SurveyService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      questions: this.fb.array([], Validators.required),
      expiryDate: [this.getDefaultExpiryDate(), Validators.required],
      isActive: [true]
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchSurveys();
    });
  }

  get questions(): FormArray {
    return this.createForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      questionText: ['', Validators.required],
      type: ['choice', Validators.required],
      isMultiple: [false],
      options: this.fb.array([])
    });
    this.questions.push(questionGroup);
    this.addOption(this.questions.length - 1);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.removeAt(optionIndex);
  }

  onQuestionTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const options = this.getOptions(questionIndex);
    if (question.get('type')?.value === 'text') {
      while (options.length > 0) {
        options.removeAt(0);
      }
    } else if (options.length === 0) {
      this.addOption(questionIndex);
    }
  }

  getDefaultExpiryDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.fetchSurveys();
  }

  async fetchSurveys(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.surveyService.getSurveys(this.payload);
      this.surveys = response || null;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching surveys:', error);
      swalHelper.showToast('Failed to fetch surveys', 'error');
      this.surveys = null;
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
    this.fetchSurveys();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSurveys();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(expiryDate: string, isActive: boolean): string {
    if (!isActive) return 'bg-danger';
    const now = new Date();
    const expiry = new Date(expiryDate);
    return expiry > now ? 'bg-success' : 'bg-danger';
  }

  formatExpiryStatus(expiryDate: string, isActive: boolean): string {
    if (!isActive) return 'Inactive';
    const now = new Date();
    const expiry = new Date(expiryDate);
    return expiry > now ? 'Active' : 'Expired';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    while (this.questions.length > 0) {
      this.questions.removeAt(0);
    }
    this.createForm.reset({
      title: '',
      description: '',
      questions: [],
      expiryDate: this.getDefaultExpiryDate(),
      isActive: true
    });
    this.addQuestion();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  async submitCreateSurvey(): Promise<void> {
    if (this.createForm.invalid) return;

    const formValue = this.createForm.value;
    const payload = {
      title: formValue.title,
      description: formValue.description,
      questions: formValue.questions.map((q: any) => ({
        questionText: q.questionText,
        type: q.type,
        isMultiple: q.isMultiple,
        options: q.type !== 'text' ? q.options : [] // Send options as array of strings
      })),
      expiryDate: new Date(formValue.expiryDate).toISOString(),
      isActive: formValue.isActive
    };

    try {
      const createdSurvey = await this.surveyService.createSurvey(payload);
      swalHelper.showToast('Survey created successfully', 'success');
      this.closeCreateModal();
      this.fetchSurveys();
    } catch (error) {
      console.error('Error creating survey:', error);
      swalHelper.showToast('Failed to create survey', 'error');
    }
  }

  async openViewModal(surveyId: string): Promise<void> {
    this.viewLoading = true;
    this.showViewModal = true;
    try {
      const response = await this.surveyService.getSingleSurvey({ _id: surveyId });
      this.selectedSurvey = response;
    } catch (error) {
      console.error('Error fetching survey details:', error);
      swalHelper.showToast('Failed to fetch survey details', 'error');
      this.closeViewModal();
    } finally {
      this.viewLoading = false;
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedSurvey = null;
  }
}