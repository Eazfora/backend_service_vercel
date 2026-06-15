/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Param,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/dashboard')
// @UseGuards(JwtAuthGuard)
export class DashboardController {
  prisma: any;
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Query('refresh') refresh?: string) {
    // Ubah string 'true' dari URL menjadi boolean true
    const isRefresh = refresh === 'true';

    // Teruskan sinyalnya ke service yang tadi kita buat
    return this.dashboardService.getOverview(isRefresh);
  }

  @Post('retrain-ai')
  async retrainAi() {
    // 🔥 Panggil fungsi dari dashboardService, bukan mlService
    return this.dashboardService.retrainChurnModel();
  }

  // ENDPOINT BARU: GET http://localhost:3000/api/dashboard/products
  @Get('products')
  async getAllProducts() {
    const products = await this.dashboardService.getAllProducts();
    return {
      message: 'Daftar produk berhasil diambil',
      data: products,
    };
  }

  // Endpoint untuk memasukkan data baru (POST http://localhost:3000/api/dashboard/transactions)
  @Post('transactions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTransaction(@Body() body: CreateTransactionDto) {
    const result = await this.dashboardService.createTransaction(body);
    return {
      message: 'Transaksi berhasil disimpan ke database',
      data: result,
    };
  }

  @Post('products')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProduct(@Body() body: CreateProductDto) {
    const result = await this.dashboardService.createProduct(body);
    return {
      message: 'Produk baru berhasil ditambahkan',
      data: result,
    };
  }

  // ENDPOINT: MENDAPATKAN PREDIKSI CHURN 1 PELANGGAN
  @Get('customer-insights/:customerId')
  async getCustomerInsight(@Param('customerId') customerId: string) {
    // KITA UBAH LOGIKANYA:
    // Minta DashboardService untuk merakit profil Telco pelanggan ini
    // dan mengirimkannya ke FastAPI.
    const predictionResult =
      await this.dashboardService.getSingleChurnPrediction(customerId);

    return {
      message: 'Prediksi risiko pelanggan berhasil diambil',
      data: predictionResult,
    };
  }

  @Patch('update-stock/:productId')
  async updateStock(
    @Param('productId') productId: string,
    @Body('addedQuantity') addedQuantity: number,
  ) {
    return this.dashboardService.updateStock(productId, Number(addedQuantity));
  }

  // ENDPOINT BARU: GET http://localhost:3000/api/dashboard/forecast-chart
  @Get('forecast-chart')
  async getForecastChart(
    @Query('category') category?: string,
    @Query('startDate') startDate?: string, // <--- TANGKAP TANGGAL AWAL
    @Query('endDate') endDate?: string, // <--- TANGKAP TANGGAL AKHIR
    @Query('region') region?: string,
  ) {
    return await this.dashboardService.getAdvancedForecast(
      category,
      startDate,
      endDate,
      region,
    );
  }

  // ENDPOINT BARU: GET http://localhost:3000/api/dashboard/categories
  // SESUDAH (Ubah menjadi seperti ini)
  @Get('categories')
  async getCategories() {
    return await this.dashboardService.getProductCategories();
  }

  @Post('retrain-model')
  async retrainModel() {
    return await this.dashboardService.retrainForecastModel();
  }

  // ENDPOINT: GET http://localhost:3000/api/dashboard/inventory
  @Get('inventory')
  async getInventoryData() {
    return await this.dashboardService.getInventoryStatus();
  }

  // ENDPOINT: MENDAPATKAN TABEL INSIGHT SEMUA PELANGGAN BERISIKO
  @Get('customer-insights')
  async getCustomerInsights() {
    const result = await this.dashboardService.getCustomerInsightsBatch();
    return {
      message: 'Tabel Wawasan Pelanggan berhasil dimuat',
      data: result,
    };
  }

  @Post('chat')
  async chatWithAI(@Body() body: { message: string }) {
    if (!body.message) {
      throw new BadRequestException('Pesan tidak boleh kosong!');
    }
    return await this.dashboardService.handleChatbotMessage(body.message);
  }
}
