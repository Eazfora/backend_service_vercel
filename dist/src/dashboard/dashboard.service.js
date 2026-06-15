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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const ml_integration_service_1 = require("./ml-integration.service");
let DashboardService = class DashboardService {
    constructor(prisma, mlIntegrationService) {
        this.prisma = prisma;
        this.mlIntegrationService = mlIntegrationService;
    }
    async createProduct(data) {
        try {
            return await this.prisma.product.create({
                data: {
                    name: data.name,
                    sku: data.sku,
                    price: data.price,
                    stock: data.stock,
                    category: data.category,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Gagal membuat produk baru', error);
        }
    }
    calculateTrend(current, previous) {
        if (previous === 0)
            return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    }
    async createTransaction(data) {
        const inputDate = new Date(data.invoiceDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (inputDate > today) {
            throw new common_1.BadRequestException('Tanggal transaksi tidak boleh melebihi hari ini!');
        }
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: data.productId },
            });
            if (!product)
                throw new common_1.NotFoundException('Produk tidak ditemukan di database.');
            if (product.stock < data.quantity)
                throw new common_1.BadRequestException(`Stok tidak mencukupi! Sisa stok hanya ${product.stock}.`);
            const [newTransaction, updatedProduct] = await this.prisma.$transaction([
                this.prisma.transaction.create({
                    data: {
                        invoiceDate: new Date(data.invoiceDate),
                        customerId: data.customerId,
                        quantity: data.quantity,
                        unitPrice: data.unitPrice,
                        totalSales: data.totalSales,
                        status: data.status,
                        productId: data.productId,
                        region: data.region,
                    },
                }),
                this.prisma.product.update({
                    where: { id: data.productId },
                    data: { stock: { decrement: data.quantity } },
                }),
            ]);
            if (updatedProduct.stock <= 10) {
                const existingAlert = await this.prisma.alert.findFirst({
                    where: {
                        title: { contains: updatedProduct.name },
                        status: 'ACTIVE',
                    },
                });
                if (!existingAlert) {
                    await this.prisma.alert.create({
                        data: {
                            title: `Stok Kritis: ${updatedProduct.name}`,
                            description: `Sisa stok hanya ${updatedProduct.stock} pcs. Segera lakukan restock!`,
                            severity: 'WARNING',
                            type: 'WARNING',
                            status: 'ACTIVE',
                        },
                    });
                }
            }
            this.updateForecastInBackground().catch((err) => {
                console.error('⚠️ Gagal update AI di background:', err.message);
            });
            return newTransaction;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Gagal memproses transaksi ke database');
        }
    }
    async updateForecastInBackground() {
        console.log('🔄 [Event-Driven] Transaksi baru terdeteksi! Meminta AI menghitung ulang di background...');
        try {
            await this.getOverview(true);
            await this.calculateAndSaveCustomerInsights();
            console.log('✅ [Event-Driven] Prediksi AI berhasil diperbarui ke database!');
        }
        catch (error) {
            console.error('❌ [Event-Driven] AI gagal memperbarui data:', error);
        }
    }
    async getAllProducts() {
        return await this.prisma.product.findMany({
            select: { id: true, name: true, sku: true, price: true, stock: true },
            orderBy: { name: 'asc' },
        });
    }
    async getAllCustomers() {
        return await this.prisma.user.findMany({
            where: { role: 'USER' },
            select: { id: true, name: true, email: true },
            orderBy: { name: 'asc' },
        });
    }
    async getOverview(forceRefresh = false) {
        var _a, _b, _c, _d, _e, _f;
        try {
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const totalRevenueResult = await this.prisma.transaction.aggregate({
                _sum: { totalSales: true },
                where: { status: 'Completed' },
            });
            const totalRevenue = (_a = totalRevenueResult._sum.totalSales) !== null && _a !== void 0 ? _a : 0;
            const revThisMonth = await this.prisma.transaction.aggregate({
                _sum: { totalSales: true },
                where: { status: 'Completed', invoiceDate: { gte: startOfThisMonth } },
            });
            const revLastMonth = await this.prisma.transaction.aggregate({
                _sum: { totalSales: true },
                where: {
                    status: 'Completed',
                    invoiceDate: { gte: startOfLastMonth, lt: startOfThisMonth },
                },
            });
            const revenueTrend = this.calculateTrend((_b = revThisMonth._sum.totalSales) !== null && _b !== void 0 ? _b : 0, (_c = revLastMonth._sum.totalSales) !== null && _c !== void 0 ? _c : 0);
            const customers = await this.prisma.transaction.findMany({
                distinct: ['customerId'],
                select: { customerId: true },
            });
            const totalCustomers = customers.length;
            const custThisMonth = await this.prisma.transaction.findMany({
                distinct: ['customerId'],
                where: { invoiceDate: { gte: startOfThisMonth } },
            });
            const custLastMonth = await this.prisma.transaction.findMany({
                distinct: ['customerId'],
                where: { invoiceDate: { gte: startOfLastMonth, lt: startOfThisMonth } },
            });
            const customersTrend = this.calculateTrend(custThisMonth.length, custLastMonth.length);
            const activeAlerts = await this.prisma.alert.count({
                where: { status: 'ACTIVE' },
            });
            const alertsThisMonth = await this.prisma.alert.count({
                where: { status: 'ACTIVE', createdAt: { gte: startOfThisMonth } },
            });
            const alertsLastMonth = await this.prisma.alert.count({
                where: {
                    status: 'ACTIVE',
                    createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
                },
            });
            const alertsTrend = this.calculateTrend(alertsThisMonth, alertsLastMonth);
            const recentTransactions = await this.prisma.transaction.findMany({
                take: 8,
                orderBy: { invoiceDate: 'desc' },
                include: { product: { select: { name: true, sku: true } } },
            });
            const allTransactions = await this.prisma.transaction.findMany({
                where: { status: 'Completed' },
                select: { invoiceDate: true, totalSales: true },
                orderBy: { invoiceDate: 'asc' },
            });
            const monthlyMap = new Map();
            for (const tx of allTransactions) {
                const d = new Date(tx.invoiceDate);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthlyMap.set(key, ((_d = monthlyMap.get(key)) !== null && _d !== void 0 ? _d : 0) + tx.totalSales);
            }
            const engagementData = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
                const activeTx = await this.prisma.transaction.findMany({
                    where: {
                        invoiceDate: { gte: d, lt: nextMonth },
                        status: 'Completed',
                    },
                    distinct: ['customerId'],
                    select: { customerId: true },
                });
                let newUsersCount = 0;
                try {
                    newUsersCount = await this.prisma.user.count({
                        where: {
                            role: 'USER',
                            createdAt: { gte: d, lt: nextMonth },
                        },
                    });
                }
                catch (e) {
                    newUsersCount = 0;
                }
                engagementData.push({
                    name: monthName,
                    active: activeTx.length,
                    new: newUsersCount,
                });
            }
            let predictedGrowth = '0.0%';
            let predictedTrend = '0.0%';
            let projectedNextMonth = 0;
            try {
                const currentSales = (_e = revThisMonth._sum.totalSales) !== null && _e !== void 0 ? _e : 0;
                const lastMonthSales = (_f = revLastMonth._sum.totalSales) !== null && _f !== void 0 ? _f : 0;
                const forecastResult = await this.getAdvancedForecast('All');
                const futureData = forecastResult.data.filter((d) => d.predicted !== null && d.actual === null);
                if (futureData.length > 0) {
                    const total7Days = futureData.reduce((sum, item) => sum + Number(item.predicted), 0);
                    const dailyAvg = total7Days / futureData.length;
                    const rawProjected = Math.round(dailyAvg * 30);
                    const maxHistoricalSales = Math.max(currentSales, lastMonthSales);
                    const absoluteMaxLimit = maxHistoricalSales > 0 ? maxHistoricalSales * 1.3 : 1500000;
                    projectedNextMonth =
                        rawProjected > absoluteMaxLimit ? absoluteMaxLimit : rawProjected;
                }
                let baseSales = lastMonthSales;
                if (baseSales === 0) {
                    const daysPassed = new Date().getDate();
                    baseSales = (currentSales / daysPassed) * 30;
                }
                if (baseSales === 0)
                    baseSales = 1;
                const rawPercentage = ((projectedNextMonth - baseSales) / baseSales) * 100;
                let finalPercentage = rawPercentage;
                if (finalPercentage > 500) {
                    finalPercentage = 500;
                }
                predictedGrowth = `${finalPercentage > 0 ? '+' : ''}${finalPercentage.toFixed(1)}%`;
                predictedTrend = finalPercentage > 0 ? 'Naik' : 'Turun';
                const nextTargetMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const targetMonthStr = `${nextTargetMonth.getFullYear()}-${String(nextTargetMonth.getMonth() + 1).padStart(2, '0')}`;
                await this.prisma.salesForecast.upsert({
                    where: { targetMonth: targetMonthStr },
                    update: {
                        predictedSales: projectedNextMonth,
                        growthPercentage: finalPercentage,
                    },
                    create: {
                        targetMonth: targetMonthStr,
                        predictedSales: projectedNextMonth,
                        growthPercentage: finalPercentage,
                    },
                });
            }
            catch (aiError) {
                console.error('⚠️ Gagal menghitung AI gabungan di Ikhtisar:', aiError.message);
            }
            const revenueByMonth = Array.from(monthlyMap.entries()).map(([month, actual]) => ({
                month,
                actual: Math.round(actual),
                predicted: null,
            }));
            if (projectedNextMonth > 0) {
                const nextTargetMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const targetMonthStr = `${nextTargetMonth.getFullYear()}-${String(nextTargetMonth.getMonth() + 1).padStart(2, '0')}`;
                revenueByMonth.push({
                    month: targetMonthStr,
                    actual: null,
                    predicted: projectedNextMonth,
                });
                if (revenueByMonth.length > 1) {
                    revenueByMonth[revenueByMonth.length - 2].predicted =
                        revenueByMonth[revenueByMonth.length - 2].actual;
                }
            }
            return {
                totalRevenue,
                activeAlerts,
                totalCustomers,
                recentTransactions,
                revenueByMonth,
                predictedGrowth,
                predictedTrend,
                revenueTrend,
                alertsTrend,
                customersTrend,
                customerEngagement: engagementData,
            };
        }
        catch (error) {
            console.error('Gagal mengambil data overview:', error);
            throw new common_1.InternalServerErrorException('Gagal memuat data dasbor');
        }
    }
    async getProductCategories() {
        try {
            const products = await this.prisma.product.findMany({
                select: { category: true },
                distinct: ['category'],
            });
            const categories = products
                .map((p) => p.category)
                .filter((category) => category !== null && category !== '');
            return {
                message: 'Daftar kategori berhasil dimuat',
                data: categories,
            };
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            throw new common_1.InternalServerErrorException('Gagal memuat daftar kategori');
        }
    }
    async updateStock(productId, addedQuantity) {
        try {
            const updatedProduct = await this.prisma.product.update({
                where: { id: productId },
                data: { stock: { increment: addedQuantity } },
            });
            if (updatedProduct.stock > 10) {
                await this.prisma.alert.updateMany({
                    where: {
                        title: { contains: updatedProduct.name },
                        status: 'ACTIVE',
                    },
                    data: {
                        status: 'RESOLVED',
                    },
                });
            }
            return {
                message: 'Stok berhasil ditambah dan sistem telah mengecek status peringatan.',
                product: updatedProduct,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Gagal memperbarui stok atau produk tidak ditemukan.');
        }
    }
    async getAdvancedForecast(category, startDate, endDate, region) {
        try {
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate
                ? new Date(startDate)
                : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const formatDateLocal = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const processSingleCategory = async (catName) => {
                const whereClause = {
                    status: 'Completed',
                    invoiceDate: { gte: start, lte: end },
                };
                if (catName) {
                    whereClause.product = { category: catName };
                }
                const transactions = await this.prisma.transaction.findMany({
                    where: whereClause,
                    include: { product: true },
                    orderBy: { invoiceDate: 'asc' },
                });
                const dailyData = new Map();
                transactions.forEach((tx) => {
                    const dateStr = formatDateLocal(tx.invoiceDate);
                    dailyData.set(dateStr, (dailyData.get(dateStr) || 0) + tx.totalSales);
                });
                const chartData = [];
                let lastActual = 0;
                const loopDate = new Date(start);
                loopDate.setHours(0, 0, 0, 0);
                const targetEndDate = new Date(end);
                targetEndDate.setHours(0, 0, 0, 0);
                while (loopDate <= targetEndDate) {
                    const dateStr = formatDateLocal(loopDate);
                    const actual = dailyData.get(dateStr) || 0;
                    chartData.push({
                        date: new Date(loopDate).toISOString(),
                        actual: actual,
                    });
                    if (loopDate.getTime() === targetEndDate.getTime()) {
                        lastActual = actual;
                    }
                    loopDate.setDate(loopDate.getDate() + 1);
                }
                const totalSalesInPeriod = chartData.reduce((sum, d) => sum + d.actual, 0);
                if (totalSalesInPeriod === 0) {
                    return {
                        chartData,
                        final7Days: [0, 0, 0, 0, 0, 0, 0],
                        pythonInsights: null,
                    };
                }
                const actualValues = chartData
                    .map((d) => d.actual)
                    .filter((v) => v > 0);
                const avgActual = actualValues.length > 0
                    ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length
                    : 0;
                const maxActual = actualValues.length > 0 ? Math.max(...actualValues) : 500000;
                const safeMaxLimit = maxActual * 1.5;
                let predictionsArray = [];
                let pythonInsights = null;
                const nextMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1);
                const targetMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
                try {
                    const pythonResponse = await axios_1.default.post('http://127.0.0.1:8000/forecast-sales', {
                        Target_Month: targetMonthStr,
                        Current_Quantity: lastActual,
                        Historical_Data: chartData.map((d) => ({
                            date: d.date,
                            sales: d.actual,
                        })),
                    });
                    if (pythonResponse.data && pythonResponse.data.status === 'success') {
                        predictionsArray = pythonResponse.data.predictions_array || [];
                        pythonInsights = pythonResponse.data;
                    }
                }
                catch (pythonError) {
                    console.error(`⚠️ Error AI untuk ${catName || 'Semua'}:`, pythonError.message);
                }
                const cappedPredictions = predictionsArray.map((pred) => {
                    let p = pred;
                    if (p > safeMaxLimit)
                        p = safeMaxLimit;
                    if (p < 0)
                        p = 0;
                    return p;
                });
                let fallbackPred = lastActual === 0 ? avgActual : lastActual;
                const final7Days = [];
                for (let i = 1; i <= 7; i++) {
                    let currentPred;
                    if (cappedPredictions && cappedPredictions.length >= i) {
                        currentPred = cappedPredictions[i - 1];
                    }
                    else {
                        const growthFactor = 1 + (Math.random() * 0.06 - 0.02);
                        fallbackPred = Math.round(fallbackPred * growthFactor);
                        currentPred = fallbackPred < 0 ? 0 : fallbackPred;
                    }
                    final7Days.push(currentPred);
                }
                return { chartData, final7Days, pythonInsights };
            };
            let globalChartData = [];
            let globalInsights = {
                anomalySpike: 18,
                anomalyCategory: 'Semua Kategori',
                confidenceScore: 85,
                correlation: { promo: 0.85, weekend: 0.72 },
            };
            if (!category || category === 'All') {
                const totalResult = await processSingleCategory(null);
                globalChartData = totalResult.chartData.map((d) => (Object.assign(Object.assign({}, d), { predicted: null })));
                const products = await this.prisma.product.findMany({
                    select: { category: true },
                    distinct: ['category'],
                });
                const categories = products
                    .map((p) => p.category)
                    .filter((c) => c !== null && c !== '');
                const aggregatedPredictions = [0, 0, 0, 0, 0, 0, 0];
                for (const cat of categories) {
                    const catResult = await processSingleCategory(cat);
                    for (let i = 0; i < 7; i++) {
                        aggregatedPredictions[i] += catResult.final7Days[i];
                    }
                }
                if (globalChartData.length > 0) {
                    globalChartData[globalChartData.length - 1].predicted =
                        globalChartData[globalChartData.length - 1].actual;
                }
                for (let i = 1; i <= 7; i++) {
                    const d = new Date(end);
                    d.setDate(end.getDate() + i);
                    globalChartData.push({
                        date: d.toISOString(),
                        actual: null,
                        predicted: Math.round(aggregatedPredictions[i - 1]),
                    });
                }
            }
            else {
                const catResult = await processSingleCategory(category);
                globalChartData = catResult.chartData.map((d) => (Object.assign(Object.assign({}, d), { predicted: null })));
                if (globalChartData.length > 0) {
                    globalChartData[globalChartData.length - 1].predicted =
                        globalChartData[globalChartData.length - 1].actual;
                }
                for (let i = 1; i <= 7; i++) {
                    const d = new Date(end);
                    d.setDate(end.getDate() + i);
                    globalChartData.push({
                        date: d.toISOString(),
                        actual: null,
                        predicted: Math.round(catResult.final7Days[i - 1]),
                    });
                }
                if (catResult.pythonInsights) {
                    globalInsights = {
                        anomalySpike: catResult.pythonInsights.anomaly_spike || 18,
                        anomalyCategory: category,
                        confidenceScore: catResult.pythonInsights.confidence_score || 85,
                        correlation: catResult.pythonInsights.correlation || {
                            promo: 0.85,
                            weekend: 0.72,
                        },
                    };
                }
            }
            return {
                message: 'Data grafik prakiraan berhasil dimuat',
                data: globalChartData,
                insights: globalInsights,
            };
        }
        catch (error) {
            console.error('Error generating forecast chart:', error);
            throw new common_1.InternalServerErrorException('Gagal memuat grafik AI');
        }
    }
    async retrainForecastModel() {
        try {
            const allTransactions = await this.prisma.transaction.findMany({
                where: { status: 'Completed' },
                select: { invoiceDate: true, totalSales: true },
                orderBy: { invoiceDate: 'asc' },
            });
            if (allTransactions.length === 0) {
                return {
                    status: 'error',
                    message: 'Tidak ada data transaksi untuk dilatih.',
                };
            }
            const dailyData = new Map();
            allTransactions.forEach((tx) => {
                const d = new Date(tx.invoiceDate);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dailyData.set(dateStr, (dailyData.get(dateStr) || 0) + Number(tx.totalSales || 0));
            });
            const formattedTransactions = [];
            const startDate = new Date(allTransactions[0].invoiceDate);
            const endDate = new Date(allTransactions[allTransactions.length - 1].invoiceDate);
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                formattedTransactions.push({
                    invoiceDate: dateStr,
                    totalSales: dailyData.get(dateStr) || 0,
                });
            }
            const response = await axios_1.default.post('http://localhost:8000/retrain', {
                transactions: formattedTransactions,
            });
            return response.data;
        }
        catch (error) {
            console.error('Gagal retrain:', error);
            throw new common_1.InternalServerErrorException('Gagal menghubungi server AI Python atau kalkulasi gagal');
        }
    }
    async handleAutomatedRetrain() {
        console.log('⏰ [CRON JOB] Memulai proses pelatihan ulang model AI (Jadwal Harian)...');
        try {
            await this.retrainForecastModel();
            console.log('✅ [CRON JOB] Model AI berhasil dilatih ulang secara otomatis!');
        }
        catch (error) {
            console.error('❌ [CRON JOB] Gagal melatih ulang model AI:', error);
        }
    }
    async getInventoryStatus() {
        try {
            const products = await this.prisma.product.findMany({
                orderBy: { stock: 'asc' },
            });
            const processedProducts = products.map((product) => {
                let status = 'Safe Stock';
                let severity = 'safe';
                let recommendation = 'No action required';
                if (product.stock < 20) {
                    status = 'Emergency Restock';
                    severity = 'critical';
                    const idealOrder = 200 - product.stock;
                    recommendation = `Order +${idealOrder} units immediately`;
                }
                else if (product.stock >= 20 && product.stock < 100) {
                    status = 'Depleting Fast';
                    severity = 'warning';
                    const idealOrder = 150 - product.stock;
                    recommendation = `Prepare +${idealOrder} units within 3 days`;
                }
                return {
                    id: product.id,
                    sku: product.sku || `PROD-${1000 + product.id}`,
                    name: product.name,
                    category: product.category || 'Uncategorized',
                    stock: product.stock,
                    price: product.price,
                    status: status,
                    severity: severity,
                    recommendation: recommendation,
                };
            });
            const activeAlerts = [];
            let alertIdCounter = 1;
            processedProducts.forEach((p) => {
                if (p.severity === 'critical') {
                    activeAlerts.push({
                        id: alertIdCounter++,
                        type: 'STOCKOUT',
                        title: 'Critical Stock Level',
                        description: `Product ${p.name} is running critically low (${p.stock} units left).`,
                        severity: 'CRITICAL',
                        status: 'ACTIVE',
                    });
                }
                else if (p.severity === 'warning') {
                    activeAlerts.push({
                        id: alertIdCounter++,
                        type: 'ANOMALY',
                        title: 'Stok Menipis',
                        description: `Product ${p.name} berkurang mendekati batas aman.`,
                        severity: 'HIGH',
                        status: 'ACTIVE',
                    });
                }
            });
            return {
                products: processedProducts,
                alerts: activeAlerts,
            };
        }
        catch (error) {
            console.error('Gagal memuat data inventaris:', error);
            throw new common_1.InternalServerErrorException('Gagal memproses manajemen inventaris');
        }
    }
    async getSingleChurnPrediction(customerId) {
        const mockCustomerData = {
            customerId: customerId,
            tenure: 12,
            OnlineSecurity: 'No',
            OnlineBackup: 'No',
            DeviceProtection: 'Yes',
            TechSupport: 'No',
            StreamingTV: 'Yes',
            StreamingMovies: 'No',
            Contract: 'Month-to-month',
            PaperlessBilling: 'Yes',
            PaymentMethod: 'Electronic check',
        };
        const aiResult = await this.mlIntegrationService.getChurnPredictions([
            mockCustomerData,
        ]);
        return aiResult.predictions[0];
    }
    async getCustomerInsightsBatch() {
        try {
            const savedInsights = await this.prisma.customerInsight.findMany({
                orderBy: { churnProbability: 'desc' },
            });
            const totalAnalyzed = savedInsights.length;
            const trendData = [];
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'Mei',
                'Jun',
                'Jul',
                'Ags',
                'Sep',
                'Okt',
                'Nov',
                'Des',
            ];
            const currentDate = new Date();
            const currentMonthIdx = currentDate.getMonth();
            if (totalAnalyzed > 0) {
                const avgChurnProb = savedInsights.reduce((sum, insight) => sum + insight.churnProbability, 0) / totalAnalyzed;
                trendData.push({
                    month: monthNames[currentMonthIdx],
                    rate: Number((avgChurnProb * 100).toFixed(1)),
                });
                for (let i = 1; i <= 3; i++) {
                    const targetMonthIdx = (currentMonthIdx + i) % 12;
                    let projectedRate = avgChurnProb * 100 * (1 + i * 0.25);
                    if (projectedRate > 95) {
                        projectedRate = 95 - Math.random() * 2;
                    }
                    trendData.push({
                        month: monthNames[targetMonthIdx],
                        rate: Number(projectedRate.toFixed(1)),
                    });
                }
            }
            else {
                trendData.push({ month: 'Bulan 1', rate: 0 }, { month: 'Bulan 2', rate: 0 });
            }
            return {
                totalAnalyzed: totalAnalyzed,
                churnTrend: trendData,
                riskTable: savedInsights.map((insight) => ({
                    CustomerID: insight.customerId,
                    Name: insight.name || `Pelanggan #${insight.customerId.substring(0, 5)}`,
                    Recency: insight.recency,
                    Frequency: insight.frequency,
                    Monetary: insight.monetary,
                    Churn: insight.churnProbability,
                })),
            };
        }
        catch (error) {
            console.error('Gagal mengambil data wawasan pelanggan:', error);
            return { totalAnalyzed: 0, riskTable: [], churnTrend: [] };
        }
    }
    async calculateAndSaveCustomerInsights() {
        var _a, _b, _c;
        console.log('🔄 Memulai kalkulasi RFM Pelanggan (MongoDB)...');
        const transactions = await this.prisma.transaction.findMany({
            where: { status: 'Completed' },
            orderBy: { invoiceDate: 'desc' },
        });
        if (transactions.length === 0)
            return;
        const customerMap = new Map();
        const today = new Date();
        transactions.forEach((tx) => {
            const custId = tx.customerId;
            const txDate = new Date(tx.invoiceDate);
            const diffTime = Math.abs(today.getTime() - txDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (!customerMap.has(custId)) {
                customerMap.set(custId, {
                    customerId: custId,
                    name: `Pelanggan #${custId.substring(0, 5)}`,
                    recency: diffDays,
                    frequency: 1,
                    monetary: tx.totalSales,
                });
            }
            else {
                const existing = customerMap.get(custId);
                existing.frequency += 1;
                existing.monetary += tx.totalSales;
                if (diffDays < existing.recency)
                    existing.recency = diffDays;
                customerMap.set(custId, existing);
            }
        });
        const activeCustomers = Array.from(customerMap.values());
        let aiPredictions = [];
        try {
            console.log(`Mengirim ${activeCustomers.length} data pelanggan ke Python ML...`);
            const aiResponse = await this.mlIntegrationService.getChurnPredictions(activeCustomers);
            if (aiResponse && aiResponse.predictions) {
                aiPredictions = aiResponse.predictions;
                console.log(`✅ Berhasil mendapat balasan dari ML Engine: ${aiResponse.engine}`);
            }
        }
        catch (error) {
            console.error('⚠️ Gagal menghubungi Python ML API, probabilitas diset 0.', error.message);
        }
        for (const data of activeCustomers) {
            const predictionData = aiPredictions.find((p) => p.customerId === data.customerId);
            const churnProb = predictionData
                ? ((_c = (_b = (_a = predictionData.Churn_Probability) !== null && _a !== void 0 ? _a : predictionData.churn_probability) !== null && _b !== void 0 ? _b : predictionData.churn) !== null && _c !== void 0 ? _c : 0)
                : 0;
            await this.prisma.customerInsight.upsert({
                where: { customerId: data.customerId },
                update: {
                    recency: data.recency,
                    frequency: data.frequency,
                    monetary: data.monetary,
                    churnProbability: churnProb,
                    lastUpdated: new Date(),
                },
                create: {
                    customerId: data.customerId,
                    name: data.name,
                    recency: data.recency,
                    frequency: data.frequency,
                    monetary: data.monetary,
                    churnProbability: churnProb,
                },
            });
        }
        console.log('✅ Kalkulasi RFM & Churn berhasil disimpan ke MongoDB!');
    }
    async retrainChurnModel(dataPelanggan = []) {
        console.log('⏰ [CRON JOB / MANUAL] Memulai proses pelatihan ulang model AI...');
        try {
            if (dataPelanggan.length === 0) {
                const customersFromDb = await this.prisma.customerInsight.findMany();
                if (customersFromDb.length === 0) {
                    return {
                        status: 'error',
                        message: 'Database wawasan pelanggan masih kosong. Belum ada data untuk dilatih.',
                    };
                }
                dataPelanggan = customersFromDb;
            }
            const payload = {
                customers: dataPelanggan,
            };
            const response = await axios_1.default.post('http://localhost:8000/retrain-churn', payload);
            return response.data;
        }
        catch (error) {
            console.error('❌ Error: Gagal melatih AI:', error.message);
            throw new common_1.InternalServerErrorException('Gagal melatih AI', error.message);
        }
    }
    async getSalesNarrative(category) {
        const response = await axios_1.default.post('http://localhost:8000/generate-insight-narrative', {});
        return response.data;
    }
    async triggerRetentionPromo(customerId) {
        console.log(`Sending 20% Discount Voucher to Customer: ${customerId}`);
        return {
            success: true,
            message: 'Voucher promo berhasil dikirim ke pelanggan!',
        };
    }
    async handleChatbotMessage(message) {
        try {
            const pythonResponse = await axios_1.default.post('http://localhost:8000/chat', {
                message: message,
            });
            if (pythonResponse.data && pythonResponse.data.status === 'success') {
                return {
                    status: 'success',
                    reply: pythonResponse.data.reply,
                };
            }
            throw new Error('Respon Python tidak sesuai format');
        }
        catch (error) {
            console.error('❌ Gagal meneruskan chat ke Python AI:', error.message);
            throw new common_1.InternalServerErrorException('Gagal terhubung dengan server kecerdasan AI.');
        }
    }
};
exports.DashboardService = DashboardService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardService.prototype, "handleAutomatedRetrain", null);
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ml_integration_service_1.MlIntegrationService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map