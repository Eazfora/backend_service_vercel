import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MlIntegrationService {
  private readonly logger = new Logger(MlIntegrationService.name);

  // URL Server Python (FastAPI)
  private readonly ML_ENGINE_URL = 'https://capstone-ai-vercel.vercel.app';

  constructor(private readonly httpService: HttpService) {}

  // ==========================================
  // JEMBATAN 1: AI FORECASTING
  // ==========================================
  async getSalesForecast(currentQuantity: number, historicalData: any[]) {
    try {
      const payload = {
        Target_Month: 'Next_Month',
        Current_Quantity: currentQuantity,
        Historical_Data: historicalData,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.ML_ENGINE_URL}/forecast-sales`, payload),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`[AI Forecast Error]: ${error?.message}`);
      throw new HttpException(
        'Layanan AI Prakiraan Pendapatan sedang tidak tersedia.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ==========================================
  // JEMBATAN 2: AI CHURN PREDICTION
  // ==========================================
  async getChurnPredictions(customerData: any[]) {
    try {
      const payload = {
        customers: customerData,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.ML_ENGINE_URL}/predict-churn-batch`,
          payload,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`[AI Churn Error]: ${error?.message}`);
      throw new HttpException(
        'Layanan AI Wawasan Pelanggan sedang tidak tersedia.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ==========================================
  // JEMBATAN 3: LATIH ULANG MODEL CHURN (CRON JOB)
  // ==========================================
  async retrainChurnModel(dataPelanggan: any[] = []) {
    try {
      // Mengirimkan payload dengan key 'customers' agar sesuai dengan FastAPI Python
      const payload = {
        customers: dataPelanggan,
      };

      const response: any = await firstValueFrom(
        this.httpService.post(`${this.ML_ENGINE_URL}/retrain-churn`, payload),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`[AI Retrain Churn Error]: ${error?.message}`);
      throw new HttpException(
        'Gagal melakukan retrain model churn pada ML engine.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
