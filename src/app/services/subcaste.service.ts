import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface SubCaste {
  _id: string;
  caste_id: string;
  name: string;
  createdAt: string;
}

export interface SubCasteResponse {
  docs: SubCaste[];
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
export class SubCasteService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getSubCastes(data: any): Promise<SubCasteResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.SUBCASTE_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No sub-castes found', 'warning');
        throw new Error(response.message || 'No sub-castes found');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async addSubCaste(data: any): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.SUBCASTE_ADD,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 201) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to add sub-caste', 'error');
        throw new Error(response.message || 'Failed to add sub-caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async updateSubCaste(data: any): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.SUBCASTE_UPDATE}/${data._id}`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update sub-caste', 'error');
        throw new Error(response.message || 'Failed to update sub-caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async deleteSubCaste(data: any): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.SUBCASTE_DELETE}/${data._id}`,
          method: 'POST',
        },
        {},
        this.headers
      );
      if (response.status === 200) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to delete sub-caste', 'error');
        throw new Error(response.message || 'Failed to delete sub-caste');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }
}