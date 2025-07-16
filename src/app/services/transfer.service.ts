import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  GetTransfersResponse,
  CreateTransferRequest,
  CreateTransferResponse,
  UpdateTransferRequest,
  UpdateTransferResponse,
  GetTransferDetailResponse,
} from '../dto/transfer.dto';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  constructor(private apiService: ApiService) {}

  getAllTransfers(): Observable<GetTransfersResponse> {
    return this.apiService.get<GetTransfersResponse>(
      environment.routes.transfer.getAll
    );
  }

  getTransferDetails(
    transferId: number
  ): Observable<GetTransferDetailResponse> {
    const endpoint = environment.routes.transfer.getById.replace(
      '{id}',
      transferId.toString()
    );
    return this.apiService.get<GetTransferDetailResponse>(endpoint);
  }

  createTransfer(
    request: CreateTransferRequest
  ): Observable<CreateTransferResponse> {
    return this.apiService.post<CreateTransferResponse>(
      environment.routes.transfer.create,
      request
    );
  }

  updateTransferStatus(
    transferId: number,
    request: UpdateTransferRequest
  ): Observable<UpdateTransferResponse> {
    const endpoint = environment.routes.transfer.update.replace(
      '{id}',
      transferId.toString()
    );
    return this.apiService.put<UpdateTransferResponse>(endpoint, request);
  }

  approveTransfer(transferId: number): Observable<UpdateTransferResponse> {
    return this.updateTransferStatus(transferId, { status: 'APPROVED' });
  }

  rejectTransfer(transferId: number): Observable<UpdateTransferResponse> {
    return this.updateTransferStatus(transferId, { status: 'REJECTED' });
  }
}
