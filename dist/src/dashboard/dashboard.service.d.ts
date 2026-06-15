import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { MlIntegrationService } from './ml-integration.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly mlIntegrationService;
    constructor(prisma: PrismaService, mlIntegrationService: MlIntegrationService);
    createProduct(data: CreateProductDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        stock: number;
        price: number;
    }>;
    private calculateTrend;
    createTransaction(data: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceDate: Date;
        customerId: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        totalSales: number;
        status: string;
        region: string;
    }>;
    private updateForecastInBackground;
    getAllProducts(): Promise<{
        name: string;
        id: string;
        sku: string;
        stock: number;
        price: number;
    }[]>;
    getAllCustomers(): Promise<{
        name: string;
        id: string;
        email: string;
    }[]>;
    getOverview(forceRefresh?: boolean): Promise<{
        totalRevenue: number;
        activeAlerts: number;
        totalCustomers: number;
        recentTransactions: ({
            product: {
                name: string;
                sku: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            invoiceDate: Date;
            customerId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            totalSales: number;
            status: string;
            region: string;
        })[];
        revenueByMonth: {
            month: string;
            actual: number;
            predicted: any;
        }[];
        predictedGrowth: string;
        predictedTrend: string;
        revenueTrend: string;
        alertsTrend: string;
        customersTrend: string;
        customerEngagement: any[];
    }>;
    getProductCategories(): Promise<{
        message: string;
        data: string[];
    }>;
    updateStock(productId: string, addedQuantity: number): Promise<{
        message: string;
        product: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            category: string;
            stock: number;
            price: number;
        };
    }>;
    getAdvancedForecast(category?: string, startDate?: string, endDate?: string, region?: string): Promise<{
        message: string;
        data: any[];
        insights: any;
    }>;
    retrainForecastModel(): Promise<any>;
    handleAutomatedRetrain(): Promise<void>;
    getInventoryStatus(): Promise<{
        products: {
            id: string;
            sku: string;
            name: string;
            category: string;
            stock: number;
            price: number;
            status: string;
            severity: string;
            recommendation: string;
        }[];
        alerts: any[];
    }>;
    getSingleChurnPrediction(customerId: string): Promise<any>;
    getCustomerInsightsBatch(): Promise<{
        totalAnalyzed: number;
        churnTrend: any[];
        riskTable: {
            CustomerID: string;
            Name: string;
            Recency: number;
            Frequency: number;
            Monetary: number;
            Churn: number;
        }[];
    }>;
    calculateAndSaveCustomerInsights(): Promise<void>;
    retrainChurnModel(dataPelanggan?: any[]): Promise<any>;
    getSalesNarrative(category: string): Promise<any>;
    triggerRetentionPromo(customerId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    handleChatbotMessage(message: string): Promise<{
        status: string;
        reply: any;
    }>;
}
