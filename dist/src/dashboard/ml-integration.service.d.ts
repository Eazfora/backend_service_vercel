import { HttpService } from '@nestjs/axios';
export declare class MlIntegrationService {
    private readonly httpService;
    private readonly logger;
    private readonly ML_ENGINE_URL;
    constructor(httpService: HttpService);
    getSalesForecast(currentQuantity: number, historicalData: any[]): Promise<any>;
    getChurnPredictions(customerData: any[]): Promise<any>;
    retrainChurnModel(dataPelanggan?: any[]): Promise<any>;
}
