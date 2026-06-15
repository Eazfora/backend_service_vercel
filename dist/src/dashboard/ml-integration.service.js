"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MlIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let MlIntegrationService = MlIntegrationService_1 = class MlIntegrationService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(MlIntegrationService_1.name);
        this.ML_ENGINE_URL = 'http://localhost:8000';
    }
    async getSalesForecast(currentQuantity, historicalData) {
        try {
            const payload = {
                Target_Month: 'Next_Month',
                Current_Quantity: currentQuantity,
                Historical_Data: historicalData,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.ML_ENGINE_URL}/forecast-sales`, payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`[AI Forecast Error]: ${error === null || error === void 0 ? void 0 : error.message}`);
            throw new common_1.HttpException('Layanan AI Prakiraan Pendapatan sedang tidak tersedia.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getChurnPredictions(customerData) {
        try {
            const payload = {
                customers: customerData,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.ML_ENGINE_URL}/predict-churn-batch`, payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`[AI Churn Error]: ${error === null || error === void 0 ? void 0 : error.message}`);
            throw new common_1.HttpException('Layanan AI Wawasan Pelanggan sedang tidak tersedia.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async retrainChurnModel(dataPelanggan = []) {
        try {
            const payload = {
                customers: dataPelanggan,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.ML_ENGINE_URL}/retrain-churn`, payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`[AI Retrain Churn Error]: ${error === null || error === void 0 ? void 0 : error.message}`);
            throw new common_1.HttpException('Gagal melakukan retrain model churn pada ML engine.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MlIntegrationService = MlIntegrationService;
exports.MlIntegrationService = MlIntegrationService = MlIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MlIntegrationService);
//# sourceMappingURL=ml-integration.service.js.map