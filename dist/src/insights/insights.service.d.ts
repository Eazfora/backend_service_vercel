import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class InsightsService {
    private readonly httpService;
    private readonly configService;
    private readonly pythonApiBaseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getChurnPrediction(recency: number, frequency: number, monetary: number): Promise<any>;
    getSalesForecast(bulanKedepan: number): Promise<any>;
}
