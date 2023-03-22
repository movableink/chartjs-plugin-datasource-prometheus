
import { ChartDataset } from "chart.js";
import { Metric, PrometheusConnectionOptions, QueryResult } from "prometheus-query";

// Mixin for TimeRange field
export class PrometheusTimeRange {
    step?: number | null = null;
    minStep?: number | null = null;

    msUpdateInterval?: number | null = null;
};
export interface PrometheusTimeRangeRelative {
    type: 'relative';

    start: number;
    end: number;
}
export interface PrometheusTimeRangeAbsolute {
    type: 'absolute';

    start: Date;
    end: Date;
}
export type ChartDatasourcePrometheusPluginOptionsTimeRange = PrometheusTimeRange & (PrometheusTimeRangeRelative | PrometheusTimeRangeAbsolute);

export type PrometheusQuery = string | ((start: Date, end: Date, step: number) => Promise<any>);
export type PrometheusQueries = PrometheusQuery | PrometheusQuery[];

export type PrometheusSerieHook = (serie: Metric) => string | null;
export type DataSetHook = (datasets: ChartDataset[]) => ChartDataset[];

export class ChartDatasourcePrometheusPluginNoDataMsg {
    message?: string = 'No data to display';
    font?: string = '16px normal \'Helvetica Nueue\'';
    textAlign?: CanvasTextAlign = 'center';
    textBaseline?: CanvasTextBaseline = 'middle';
    direction?: CanvasDirection = 'ltr';
}
export class ChartDatasourcePrometheusPluginErrorMsg {
    message?: string | null = null;
    font?: string = '16px normal \'Helvetica Nueue\'';
    textAlign?: CanvasTextAlign = 'center';
    textBaseline?: CanvasTextBaseline = 'middle';
    direction?: CanvasDirection = 'ltr';
}
export class ChartDatasourcePrometheusPluginLoadingMsg {
    message?: string = 'Loading data...';
    font?: string = '16px normal \'Helvetica Nueue\'';
    textAlign?: CanvasTextAlign = 'center';
    textBaseline?: CanvasTextBaseline = 'middle';
    direction?: CanvasDirection = 'ltr';
}

const colorList = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
];

export class ChartDatasourcePrometheusPluginOptions {

    /**
     * Options for Prometheus requests
     */
    prometheus: PrometheusConnectionOptions | null = null; // can be null when the provided query is just an async function
    query: PrometheusQueries;   // @TODO: rename this field to "queries"
    timeRange: ChartDatasourcePrometheusPluginOptionsTimeRange;

    /**
     * Options for designing Charts
     * See https://learnui.design/tools/data-color-picker.html#palette
     */
    fillGaps?: boolean = false;
    tension?: number = 0.4;
    cubicInterpolationMode?: 'default' | 'monotone' = 'default';
    stepped?: boolean = false;
    fill?: boolean = false;
    stacked?: boolean = false;
    borderWidth?: number = 3;
    borderColor?: string[] = colorList;
    backgroundColor?: string[] = colorList;
    noDataMsg?: ChartDatasourcePrometheusPluginNoDataMsg = new ChartDatasourcePrometheusPluginNoDataMsg();
    errorMsg?: ChartDatasourcePrometheusPluginErrorMsg = new ChartDatasourcePrometheusPluginErrorMsg();
    loadingMsg?: ChartDatasourcePrometheusPluginLoadingMsg = new ChartDatasourcePrometheusPluginLoadingMsg();

    findInLabelMap?: PrometheusSerieHook | null = null;
    findInBorderColorMap?: PrometheusSerieHook | null = null;
    findInBackgroundColorMap?: PrometheusSerieHook | null = null;
    dataSetHook?: DataSetHook | null = null;

    /**
     * Compute a step for range_query (interval between 2 points in second)
     */
    public assertPluginOptions() {
        if (!this.query)
            throw new Error('options.query is undefined');

        if (!this.timeRange)
            throw new Error('options.timeRange is undefined');
        if (this.timeRange.start == null)
            throw new Error('options.timeRange.start is undefined');
        if (this.timeRange.end == null)
            throw new Error('options.timeRange.end is undefined');

        if (typeof (this.timeRange) != 'object')
            throw new Error('options.timeRange must be a object');
        if (typeof (this.timeRange.type) != 'string')
            throw new Error('options.timeRange.type must be a string');
        if (this.timeRange.type != 'relative' && this.timeRange.type != 'absolute')
            throw new Error('options.timeRange.type must be either "relative" or "absolute"');
        if (!(typeof (this.timeRange.start) == 'number' || (typeof (this.timeRange.start) == 'object' && this.timeRange.start.constructor.name == 'Date')))
            throw new Error('options.timeRange.start must be a Date object (absolute) or integer (relative)');
        if (!(typeof (this.timeRange.end) == 'number' || (typeof (this.timeRange.end) == 'object' && this.timeRange.end.constructor.name == 'Date')))
            throw new Error('options.timeRange.end must be a Date object (absolute) or integer (relative)');
        if (this.timeRange['msUpdateInterval'] != null && typeof (this.timeRange['msUpdateInterval']) != 'number')
            throw new Error('options.timeRange.msUpdateInterval must be a integer');
        if (this.timeRange['msUpdateInterval'] != null && this.timeRange['msUpdateInterval'] < 1000)
            throw new Error('options.timeRange.msUpdateInterval must be greater than 1s.');
    }

    public getQueries(): PrometheusQuery[] {
        if (this.query?.constructor?.name != 'Array')
            return [this.query] as PrometheusQuery[];
        return this.query as PrometheusQuery[];
    }

};
