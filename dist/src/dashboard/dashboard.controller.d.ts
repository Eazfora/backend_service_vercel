import { DashboardService } from './dashboard.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateProductDto } from './dto/create-product.dto';
export declare class DashboardController {
    private readonly dashboardService;
    prisma: any;
    constructor(dashboardService: DashboardService);
    getOverview(refresh?: string): Promise<{
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
    retrainAi(): Promise<any>;
    getAllProducts(): Promise<{
        message: string;
        data: {
            name: string;
            id: string;
            sku: string;
            stock: number;
            price: number;
        }[];
    }>;
    createTransaction(body: CreateTransactionDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    createProduct(body: CreateProductDto): Promise<{
        message: string;
        data: {
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
    getCustomerInsight(customerId: string): Promise<{
        message: string;
        data: any;
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
    getForecastChart(category?: string, startDate?: string, endDate?: string, region?: string): Promise<{
        message: string;
        data: any[];
        insights: any;
    }>;
    getCategories(): Promise<{
        message: string;
        data: string[];
    }>;
    retrainModel(): Promise<any>;
    getInventoryData(): Promise<{
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
    getCustomerInsights(): Promise<{
        message: string;
        data: {
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
        };
    }>;
    chatWithAI(body: {
        message: string;
    }): Promise<{
        status: string;
        reply: any;
    }>;
}
