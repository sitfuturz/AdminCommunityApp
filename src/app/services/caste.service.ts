import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface Caste {
  _id: string;
  name: string;
  createdAt: string;
}

export interface CasteResponse {
  docs: Caste[];
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
export class CasteService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getCastes(data: any): Promise<CasteResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CASTE_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No castes found', 'warning');
        throw new Error(response.message || 'No castes found');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async addCaste(data: { name: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CASTE_ADD,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 201) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to add caste', 'error');
        throw new Error(response.message || 'Failed to add caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async updateCaste(id: string, data: { name: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.CASTE_UPDATE}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      if (response.status === 200) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update caste', 'error');
        throw new Error(response.message || 'Failed to update caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async deleteCaste(id: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.CASTE_DELETE}/${id}`,
          method: 'DELETE',
        },
        {},
        this.headers
      );
      if (response.status === 200) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to delete caste', 'error');
        throw new Error(response.message || 'Failed to delete caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }
}