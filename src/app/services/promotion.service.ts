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

  /**
   * Get all promotion requests
   * @returns Observable<GetPromotionsResponse>
   */
  getAllPromotions(): Observable<GetPromotionsResponse> {
    return this.apiService.get<GetPromotionsResponse>(
      environment.routes.promotion.getAll
    );
  }

  /**
   * Get detailed promotion information by ID
   * @param promotionId - The promotion ID
   * @returns Observable<GetPromotionDetailResponse>
   */
  getPromotionDetails(
    promotionId: number
  ): Observable<GetPromotionDetailResponse> {
    const endpoint = environment.routes.promotion.getById.replace(
      '{id}',
      promotionId.toString()
    );
    return this.apiService.get<GetPromotionDetailResponse>(endpoint);
  }

  /**
   * Create a new promotion request
   * @param request - The promotion request data
   * @returns Observable<CreatePromotionResponse>
   */
  createPromotion(
    request: CreatePromotionRequest
  ): Observable<CreatePromotionResponse> {
    return this.apiService.post<CreatePromotionResponse>(
      environment.routes.promotion.create,
      request
    );
  }

  /**
   * Update promotion status
   * @param promotionId - The promotion ID
   * @param request - The status update request
   * @returns Observable<UpdatePromotionResponse>
   */
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

  /**
   * Approve a promotion request
   * @param promotionId - The promotion ID
   * @returns Observable<UpdatePromotionResponse>
   */
  approvePromotion(promotionId: number): Observable<UpdatePromotionResponse> {
    return this.updatePromotionStatus(promotionId, { status: 'APPROVED' });
  }

  /**
   * Reject a promotion request
   * @param promotionId - The promotion ID
   * @returns Observable<UpdatePromotionResponse>
   */
  rejectPromotion(promotionId: number): Observable<UpdatePromotionResponse> {
    return this.updatePromotionStatus(promotionId, { status: 'REJECTED' });
  }
}
