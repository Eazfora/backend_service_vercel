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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let InsightsService = class InsightsService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.pythonApiBaseUrl =
            this.configService.get('PYTHON_API_URL') ||
                'http://localhost:8000';
    }
    async getChurnPrediction(recency, frequency, monetary) {
        const url = `${this.pythonApiBaseUrl}/predict-churn`;
        const payload = {
            Recency: recency,
            Frequency: frequency,
            Monetary: monetary,
        };
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
            return response.data;
        }
        catch (error) {
            console.error('Gagal menghubungi Model Churn Python:', error.message);
            throw new common_1.InternalServerErrorException('Layanan Prediksi Churn AI sedang tidak tersedia');
        }
    }
    async getSalesForecast(bulanKedepan) {
        const url = `${this.pythonApiBaseUrl}/sales-forecast`;
        const payload = {
            Bulan_Kedepan: bulanKedepan,
        };
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
            return response.data;
        }
        catch (error) {
            console.error('Gagal menghubungi Model Forecast Python:', error.message);
            throw new common_1.InternalServerErrorException('Layanan AI Forecasting sedang tidak tersedia');
        }
    }
};
exports.InsightsService = InsightsService;
exports.InsightsService = InsightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], InsightsService);
//# sourceMappingURL=insights.service.js.map