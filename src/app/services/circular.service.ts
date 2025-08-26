import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';

@Injectable({
  providedIn: 'root'
})
export class CircularService {
private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getCirculars(data: any){
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CIRCULAR_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log("Response", response);
      if (response && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No circulars found', 'warning');
        return { docs: [], totalDocs: 0, limit: 10, page: 1, totalPages: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null };
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      throw err;
    }
  }
}
