interface ExchangeRateApiResponse {
    base: string;
    target: string;
    rate: number;
    date: string;
}

interface ApiConfig {
    baseUrl: string;
    rateLimitPerMinute: number;
    timeout: number;
}

class RateLimitTracker {
    private requests: Map<string, number[]> = new Map();

    canMakeRequest(apiKey: string, limit: number): boolean {
        const now = Date.now();
        const requests = this.requests.get(apiKey) || [];

        // Remove requests older than 1 minute
        const recentRequests = requests.filter((time) => now - time < 60000);
        this.requests.set(apiKey, recentRequests);

        return recentRequests.length < limit;
    }

    recordRequest(apiKey: string): void {
        const now = Date.now();
        const requests = this.requests.get(apiKey) || [];
        requests.push(now);
        this.requests.set(apiKey, requests);
    }
}

class UniRateApiClient {
    private config: ApiConfig = {
        baseUrl: 'https://api.unirate.com/v1',
        rateLimitPerMinute: 30,
        timeout: 5000,
    };
    private rateLimiter = new RateLimitTracker();

    async getExchangeRate(
        baseCurrency: string,
        targetCurrency: string,
        date: string
    ): Promise<ExchangeRateApiResponse> {
        if (!this.rateLimiter.canMakeRequest('unirate', this.config.rateLimitPerMinute)) {
            throw new Error('UniRateAPI rate limit exceeded');
        }

        const url = `${this.config.baseUrl}/rates/${baseCurrency}/${targetCurrency}/${date}`;

        try {
            this.rateLimiter.recordRequest('unirate');

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'Accntu/1.0',
                },
                signal: AbortSignal.timeout(this.config.timeout),
            });

            if (!response.ok) {
                throw new Error(`UniRateAPI HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                base: baseCurrency,
                target: targetCurrency,
                rate: data.rate || data.value,
                date,
            };
        } catch (error: any) {
            throw new Error(`UniRateAPI request failed: ${error.message}`);
        }
    }

    async getBatchExchangeRates(
        baseCurrency: string,
        targetCurrencies: string[],
        date: string
    ): Promise<ExchangeRateApiResponse[]> {
        // UniRateAPI doesn't support batch requests, so we'll make individual requests
        // with proper rate limiting
        const results: ExchangeRateApiResponse[] = [];

        for (const targetCurrency of targetCurrencies) {
            if (baseCurrency === targetCurrency) {
                results.push({
                    base: baseCurrency,
                    target: targetCurrency,
                    rate: 1,
                    date,
                });
                continue;
            }

            try {
                const result = await this.getExchangeRate(baseCurrency, targetCurrency, date);
                results.push(result);

                // Small delay to avoid overwhelming the API
                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error: any) {
                console.warn(
                    `Failed to fetch ${baseCurrency}/${targetCurrency} from UniRateAPI:`,
                    error.message
                );
                throw error; // Let the fallback API handle it
            }
        }

        return results;
    }
}

class FawazahmedApiClient {
    private config: ApiConfig = {
        baseUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1',
        rateLimitPerMinute: 1000, // Generous limit for CDN
        timeout: 10000,
    };

    async getExchangeRate(
        baseCurrency: string,
        targetCurrency: string,
        date: string
    ): Promise<ExchangeRateApiResponse> {
        // This API uses different date format and endpoints
        const url = `${this.config.baseUrl}/${date}/currencies/${baseCurrency.toLowerCase()}.json`;

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
                signal: AbortSignal.timeout(this.config.timeout),
            });

            if (!response.ok) {
                throw new Error(`Fawazahmed API HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const rate = data[targetCurrency.toLowerCase()];

            if (!rate) {
                throw new Error(`Rate not found for ${baseCurrency}/${targetCurrency}`);
            }

            return {
                base: baseCurrency,
                target: targetCurrency,
                rate: parseFloat(rate),
                date,
            };
        } catch (error: any) {
            throw new Error(`Fawazahmed API request failed: ${error.message}`);
        }
    }

    async getBatchExchangeRates(
        baseCurrency: string,
        targetCurrencies: string[],
        date: string
    ): Promise<ExchangeRateApiResponse[]> {
        // Fawazahmed API supports getting all rates for a base currency
        const url = `${this.config.baseUrl}/${date}/currencies/${baseCurrency.toLowerCase()}.json`;

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
                signal: AbortSignal.timeout(this.config.timeout),
            });

            if (!response.ok) {
                throw new Error(`Fawazahmed API HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const rates = data[baseCurrency.toLowerCase()];

            const results: ExchangeRateApiResponse[] = [];

            for (const targetCurrency of targetCurrencies) {
                if (baseCurrency === targetCurrency) {
                    results.push({
                        base: baseCurrency,
                        target: targetCurrency,
                        rate: 1,
                        date,
                    });
                    continue;
                }

                const rate = rates[targetCurrency.toLowerCase()];
                if (rate) {
                    results.push({
                        base: baseCurrency,
                        target: targetCurrency,
                        rate: parseFloat(rate),
                        date,
                    });
                }
            }

            return results;
        } catch (error: any) {
            throw new Error(`Fawazahmed batch API request failed: ${error.message}`);
        }
    }
}

export class CurrencyApiClient {
    private primaryApi = new UniRateApiClient();
    private fallbackApi = new FawazahmedApiClient();
    private circuitBreaker = {
        unirate: { failures: 0, lastFailure: 0, threshold: 5, cooldown: 300000 }, // 5 min cooldown
        fawazahmed: { failures: 0, lastFailure: 0, threshold: 10, cooldown: 600000 }, // 10 min cooldown
    };

    private isCircuitOpen(apiKey: keyof typeof this.circuitBreaker): boolean {
        const breaker = this.circuitBreaker[apiKey];
        const now = Date.now();

        if (breaker.failures >= breaker.threshold) {
            if (now - breaker.lastFailure < breaker.cooldown) {
                return true; // Circuit is open
            } else {
                // Reset circuit breaker after cooldown
                breaker.failures = 0;
                return false;
            }
        }

        return false;
    }

    private recordFailure(apiKey: keyof typeof this.circuitBreaker): void {
        const breaker = this.circuitBreaker[apiKey];
        breaker.failures++;
        breaker.lastFailure = Date.now();
    }

    private recordSuccess(apiKey: keyof typeof this.circuitBreaker): void {
        const breaker = this.circuitBreaker[apiKey];
        breaker.failures = 0;
    }

    async getExchangeRate(
        baseCurrency: string,
        targetCurrency: string,
        date: string
    ): Promise<ExchangeRateApiResponse> {
        if (baseCurrency === targetCurrency) {
            return {
                base: baseCurrency,
                target: targetCurrency,
                rate: 1,
                date,
            };
        }

        // Try primary API first
        if (!this.isCircuitOpen('unirate')) {
            try {
                const result = await this.primaryApi.getExchangeRate(
                    baseCurrency,
                    targetCurrency,
                    date
                );
                this.recordSuccess('unirate');
                return result;
            } catch (error: any) {
                console.warn(`Primary API (UniRate) failed: ${error.message}`);
                this.recordFailure('unirate');
            }
        }

        // Try fallback API
        if (!this.isCircuitOpen('fawazahmed')) {
            try {
                const result = await this.fallbackApi.getExchangeRate(
                    baseCurrency,
                    targetCurrency,
                    date
                );
                this.recordSuccess('fawazahmed');
                return result;
            } catch (error: any) {
                console.warn(`Fallback API (Fawazahmed) failed: ${error.message}`);
                this.recordFailure('fawazahmed');
                throw new Error(`All currency APIs failed. Last error: ${error.message}`);
            }
        }

        throw new Error('All currency APIs are currently unavailable due to circuit breaker');
    }

    async getBatchExchangeRates(
        baseCurrency: string,
        targetCurrencies: string[],
        date: string
    ): Promise<ExchangeRateApiResponse[]> {
        // Try primary API first
        if (!this.isCircuitOpen('unirate')) {
            try {
                const result = await this.primaryApi.getBatchExchangeRates(
                    baseCurrency,
                    targetCurrencies,
                    date
                );
                this.recordSuccess('unirate');
                return result;
            } catch (error: any) {
                console.warn(`Primary API batch request failed: ${error.message}`);
                this.recordFailure('unirate');
            }
        }

        // Try fallback API
        if (!this.isCircuitOpen('fawazahmed')) {
            try {
                const result = await this.fallbackApi.getBatchExchangeRates(
                    baseCurrency,
                    targetCurrencies,
                    date
                );
                this.recordSuccess('fawazahmed');
                return result;
            } catch (error: any) {
                console.warn(`Fallback API batch request failed: ${error.message}`);
                this.recordFailure('fawazahmed');
                throw new Error(
                    `All currency APIs failed for batch request. Last error: ${error.message}`
                );
            }
        }

        throw new Error('All currency APIs are currently unavailable for batch requests');
    }
}

// Singleton instance
export const currencyApiClient = new CurrencyApiClient();
