import { InsightsService } from './insights.service';
import { PredictChurnDto } from './dto/predict-churn.dto';
import { PredictForecastDto } from './dto/predict-forecast.dto';
export declare class InsightsController {
    private readonly insightsService;
    constructor(insightsService: InsightsService);
    predictChurn(body: PredictChurnDto): Promise<{
        message: string;
        data: any;
    }>;
    predictForecast(body: PredictForecastDto): Promise<{
        message: string;
        data: any;
    }>;
}
