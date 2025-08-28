import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

export interface Transaction {
  _id: string;
  type: 'opening' | 'income' | 'expense';
  amount: number;
  description: string;
  adminId: string;
  createdAt: string;
  extraDetails?: any;
}

export interface TransactionBalance {
  _id: string;
  currentBalance: number;
  adminId: string;
}

export interface TransactionsWithBalanceResponse {
  currentBalance: number;
  openingBalance: number;
  transactions: Transaction[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async setOpeningBalance(data: any): Promise<TransactionBalance> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_SET_OPENING_BALANCE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to set opening balance', 'warning');
        throw new Error(response.message || 'Failed to set opening balance');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async addIncome(data: any): Promise<{ transaction: Transaction; currentBalance: number }> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_ADD_INCOME,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to add income', 'warning');
        throw new Error(response.message || 'Failed to add income');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async addExpense(data: any): Promise<{ transaction: Transaction; currentBalance: number }> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_ADD_EXPENSE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to add expense', 'warning');
        throw new Error(response.message || 'Failed to add expense');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async getTransactions(data: any): Promise<Transaction[]> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_GET_ALL,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'No transactions found', 'warning');
        throw new Error(response.message || 'No transactions found');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async getBalance(data: any): Promise<TransactionBalance> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_GET_BALANCE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Balance not found', 'warning');
        throw new Error(response.message || 'Balance not found');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }

  async fetchTransactionsWithBalance(data: any): Promise<TransactionsWithBalanceResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TRANSACTION_FETCH_WITH_BALANCE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch transactions with balance', 'warning');
        throw new Error(response.message || 'Failed to fetch transactions with balance');
      }
    } catch (err: any) {
      swalHelper.showToast(err.message || 'Something went wrong!', 'error');
      throw err;
    }
  }
}