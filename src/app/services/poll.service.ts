import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface Poll {
  _id: string;
  title: string;
  description: string;
  adminId: string;
  totalVotes: number;
  options: {
    text: string;
    voteCount: number;
    percentage: number;
    votes: { userId: string; name: string }[];
  }[];
  isActive: boolean;
  expiryDate: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllPolls(data: any): Promise<Poll[]> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.POLL_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No polls found', 'warning');
        throw new Error(response.message || 'No polls found');
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }

   async createPoll(data: any): Promise<Poll[]> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.POLL_CREATE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No polls Created', 'warning');
        throw new Error(response.message || 'No polls Created');
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }

   async getSinglePoll(data: any): Promise<Poll[]> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.POLL_GET,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No polls found', 'warning');
        throw new Error(response.message || 'No polls found');
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }



}
