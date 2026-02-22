import { GoogleGenAI } from "@google/genai";
import { getMarketOverview } from "./marketData";

const SYSTEM_INSTRUCTION = `你是一位顶级的全球宏观与A股短线情绪分析师，名为 Fixer。你擅长通过全球市场联动洞察情绪周期。
你的任务是根据提供的 Yahoo Finance 实时行情数据，生成一份结构严谨、具有国际视野的《Fixer Studio：全球联动与A股情绪复盘报告》。

报告必须包含以下章节：
1. 全球宏观背景 (美股、日股、大宗商品走势及其对A股的影响)
2. A股大盘总结 (指数走势、量能变化、市场情绪定性)
3. 情绪周期判断 (高标表现、周期定性、资金风险偏好)
4. 主线题材梳理 (核心逻辑、领涨板块、龙头表现)
5. 明日策略与风险提示 (机会方向、全球风险点)

专业术语要求：
- 情绪周期：发酵、分歧、一致、退潮、冰点。
- 宏观视角：流动性溢价、避险情绪、汇率联动、商品驱动。

输出格式：Markdown。
注意：在报告开头注明“注意：只体现AI大脑技术，不构成投资建议”。报告署名为 Fixer Studio。`;

export async function generateMarketReport() {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3.1-pro-preview";

  try {
    // 获取 Yahoo Finance 数据
    const marketData = await getMarketOverview();
    const dataString = JSON.stringify(marketData);

    const response = await genAI.models.generateContent({
      model,
      contents: [{ 
        parts: [{ 
          text: `请基于以下全球市场实时行情数据生成复盘报告：\n\n${dataString}\n\n请重点分析全球市场波动对A股情绪周期的传导影响。` 
        }] 
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

