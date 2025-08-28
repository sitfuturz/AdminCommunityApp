import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { LeadResponse } from '../views/pages/leads/leads.component';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllLeads(data: { page: number; limit: number; status?: string }): Promise<LeadResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.LEADS_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log("Response", response);
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No leads found', 'warning');
        return {
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
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }

  async updateLeadStatus(data: { userId: string; askId: string; leadId: string; status: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.LEADS_UPDATE_STATUS,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log("Update Status Response", response);
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update lead status', 'warning');
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }
}