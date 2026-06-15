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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const create_product_dto_1 = require("./dto/create-product.dto");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getOverview(refresh) {
        const isRefresh = refresh === 'true';
        return this.dashboardService.getOverview(isRefresh);
    }
    async retrainAi() {
        return this.dashboardService.retrainChurnModel();
    }
    async getAllProducts() {
        const products = await this.dashboardService.getAllProducts();
        return {
            message: 'Daftar produk berhasil diambil',
            data: products,
        };
    }
    async createTransaction(body) {
        const result = await this.dashboardService.createTransaction(body);
        return {
            message: 'Transaksi berhasil disimpan ke database',
            data: result,
        };
    }
    async createProduct(body) {
        const result = await this.dashboardService.createProduct(body);
        return {
            message: 'Produk baru berhasil ditambahkan',
            data: result,
        };
    }
    async getCustomerInsight(customerId) {
        const predictionResult = await this.dashboardService.getSingleChurnPrediction(customerId);
        return {
            message: 'Prediksi risiko pelanggan berhasil diambil',
            data: predictionResult,
        };
    }
    async updateStock(productId, addedQuantity) {
        return this.dashboardService.updateStock(productId, Number(addedQuantity));
    }
    async getForecastChart(category, startDate, endDate, region) {
        return await this.dashboardService.getAdvancedForecast(category, startDate, endDate, region);
    }
    async getCategories() {
        return await this.dashboardService.getProductCategories();
    }
    async retrainModel() {
        return await this.dashboardService.retrainForecastModel();
    }
    async getInventoryData() {
        return await this.dashboardService.getInventoryStatus();
    }
    async getCustomerInsights() {
        const result = await this.dashboardService.getCustomerInsightsBatch();
        return {
            message: 'Tabel Wawasan Pelanggan berhasil dimuat',
            data: result,
        };
    }
    async chatWithAI(body) {
        if (!body.message) {
            throw new common_1.BadRequestException('Pesan tidak boleh kosong!');
        }
        return await this.dashboardService.handleChatbotMessage(body.message);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Post)('retrain-ai'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "retrainAi", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('customer-insights/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCustomerInsight", null);
__decorate([
    (0, common_1.Patch)('update-stock/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)('addedQuantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Get)('forecast-chart'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getForecastChart", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('retrain-model'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "retrainModel", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getInventoryData", null);
__decorate([
    (0, common_1.Get)('customer-insights'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCustomerInsights", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "chatWithAI", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('api/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map