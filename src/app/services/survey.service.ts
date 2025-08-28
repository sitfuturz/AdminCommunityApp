import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface Survey {
  _id: string;
  title: string;
  description: string;
  adminId: string;
  totalResponses: number;
  questions: {
    questionText: string;
    type: 'choice' | 'text' | 'mixed';
    isMultiple: boolean;
    options: { text: string; count: number; percentage: number }[];
  }[];
  isActive: boolean;
  expiryDate: string;
  createdAt: string;
}

export interface SurveyResponse {
  docs: Survey[];
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

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getSurveys(data: any): Promise<SurveyResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.SURVEY_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No surveys found', 'warning');
        throw new Error(response.message || 'No surveys found');
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }
}