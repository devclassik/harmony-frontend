import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  CreatePromotionRequest,
  CreatePromotionResponse,
  UpdatePromotionStatusRequest,
  UpdatePromotionResponse,
  GetPromotionsResponse,
  GetPromotionDetailResponse,
} from '../dto/promotion.dto';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  constructor(private apiService: ApiService) {}

  getAllPromotions(): Observable<GetPromotionsResponse> {
    return this.apiService.get<GetPromotionsResponse>(
      environment.routes.promotion.getAll
    );
  }

  getPromotionDetails(
    promotionId: number
  ): Observable<GetPromotionDetailResponse> {
    const endpoint = environment.routes.promotion.getById.replace(
      '{id}',
      promotionId.toString()
    );
    return this.apiService.get<GetPromotionDetailResponse>(endpoint);
  }

  createPromotion(
    request: CreatePromotionRequest
  ): Observable<CreatePromotionResponse> {
    return this.apiService.post<CreatePromotionResponse>(
      environment.routes.promotion.create,
      request
    );
  }

  updatePromotionStatus(
    promotionId: number,
    request: UpdatePromotionStatusRequest
  ): Observable<UpdatePromotionResponse> {
    const endpoint = environment.routes.promotion.update.replace(
      '{id}',
      promotionId.toString()
    );
    return this.apiService.put<UpdatePromotionResponse>(endpoint, request);
  }

  approvePromotion(promotionId: number): Observable<UpdatePromotionResponse> {
    return this.updatePromotionStatus(promotionId, { status: 'APPROVED' });
  }

  rejectPromotion(promotionId: number): Observable<UpdatePromotionResponse> {
    return this.updatePromotionStatus(promotionId, { status: 'REJECTED' });
  }
}
