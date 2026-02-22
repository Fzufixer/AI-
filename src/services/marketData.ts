import axios from 'axios';

export async function getMarketOverview() {
  try {
    const response = await axios.get('/api/market-overview');
    return response.data;
  } catch (error) {
    console.error("Error fetching market overview from API:", error);
    throw error;
  }
}

export async function getBatchQuotes(symbols: string[]) {
  try {
    const response = await axios.post('/api/quotes', { symbols });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch quotes:", error);
    return [];
  }
}

export async function getStockQuote(symbol: string) {
  // 暂时复用概况接口，或者后续增加特定代码查询接口
  try {
    const response = await axios.get('/api/market-overview');
    return response.data.find((item: any) => item.symbol === symbol);
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}
