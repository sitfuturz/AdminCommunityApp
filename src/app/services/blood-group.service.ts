import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { AppStorage } from '../core/utilities/app-storage';
import { ApiManager } from '../core/utilities/api-manager';
import { common } from '../core/constants/common';

export interface BloodGroupRequirement {
  requirementId: string;
  bloodGroup: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  user: {
    userId: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BloodGroupService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async listRequirements(data: { search?: string }) {
    try {
      console.log('data', data);
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_BLOOD_GROUP_DETAILS,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log('response', response);
      if (response && response.data) {
        return response.data; // Assuming response.data = { requirements: [...] }
      } else {
        swalHelper.showToast(response.message || 'No blood group requirements found', 'warning');
        return [];
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }
}