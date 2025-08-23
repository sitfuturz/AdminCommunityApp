import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  isActive: boolean;
  createdAt: string;
  adminId: string;
}

export interface DocumentResponse {
  docs: Document[];
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
export class DocumentService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getDocuments(data: any){
    try {
      console.log("data", data);
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.DOCUMENT_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log("response", response);
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No documents found', 'warning');
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }

  // async toggleDocumentStatus(id: string, data: { isActive: boolean }): Promise<any> {
  //   try {
  //     this.getHeaders();
  //     const response = await this.apiManager.request(
  //       {
  //         url: apiEndpoints.DOCUMENT_TOGGLE_STATUS,
  //         method: 'POST',
  //       },
  //       { id, ...data },
  //       this.headers
  //     );
  //     if (response.status === 200 && response.data) {
  //       return response.data;
  //     } else {
  //       swalHelper.showToast(response.message || 'Failed to toggle document status', 'warning');
  //       return null;
  //     }
  //   } catch (err) {
  //     swalHelper.showToast('Something went wrong!', 'error');
  //     throw err;
  //   }
  // }
}