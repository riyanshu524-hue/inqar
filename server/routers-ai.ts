import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const aiRouter = router({
  // Chat with INQAR AI
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        context: z
          .object({
            userId: z.number().optional(),
            platform: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build system message with INQAR context
        const systemMessage = {
          role: "system" as const,
          content: `You are INQAR AI, a helpful and friendly assistant for the INQAR social media and marketplace platform. 
          
You help users with:
- Navigating the INQAR platform
- Finding content and users
- Shopping on InQ Bazar marketplace
- Understanding features like VIP subscriptions, stories, and direct messaging
- General questions and recommendations

Be conversational, helpful, and always maintain a friendly tone. Provide concise but informative responses.`,
        };

        // Combine system message with user messages
        const allMessages = [
          systemMessage,
          ...input.messages.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: allMessages,
          model: "gpt-4o-mini", // Using a fast, cost-effective model
        });

        // Extract the response text
        const assistantMessage =
          response.choices[0]?.message?.content || "I'm not sure how to respond.";

        return {
          success: true,
          message: assistantMessage,
          role: "assistant",
        };
      } catch (error) {
        console.error("[INQAR AI] Error:", error);
        return {
          success: false,
          message:
            "I'm having trouble processing your request. Please try again later.",
          role: "assistant",
        };
      }
    }),

  // Get AI recommendations for content
  getRecommendations: publicProcedure
    .input(
      z.object({
        type: z.enum(["posts", "users", "products"]),
        context: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `Based on the INQAR platform, provide ${input.limit || 5} personalized recommendations for ${input.type}${
          input.context ? ` related to: ${input.context}` : ""
        }. 
        
Format your response as a JSON array with objects containing:
- title: string
- description: string
- reason: string

Return only valid JSON, no markdown formatting.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === "string" ? content : "[]";

        try {
          const recommendations = JSON.parse(contentStr);
          return {
            success: true,
            recommendations: Array.isArray(recommendations)
              ? recommendations
              : [],
          };
        } catch {
          return {
            success: false,
            recommendations: [],
            error: "Failed to parse recommendations",
          };
        }
      } catch (error) {
        console.error("[INQAR AI] Recommendations error:", error);
        return {
          success: false,
          recommendations: [],
          error: "Failed to generate recommendations",
        };
      }
    }),

  // Get AI-powered search suggestions
  getSearchSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["users", "posts", "products", "hashtags"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `For the search query "${input.query}" on the INQAR platform${
          input.type ? ` (searching for ${input.type})` : ""
        }, provide 5 relevant search suggestions or related terms.
        
Format as a JSON array of strings. Return only valid JSON.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === "string" ? content : "[]";

        try {
          const suggestions = JSON.parse(contentStr);
          return {
            success: true,
            suggestions: Array.isArray(suggestions) ? suggestions : [],
          };
        } catch {
          return {
            success: false,
            suggestions: [],
          };
        }
      } catch (error) {
        console.error("[INQAR AI] Search suggestions error:", error);
        return {
          success: false,
          suggestions: [],
        };
      }
    }),

  // Analyze content (posts, products) for insights
  analyzeContent: publicProcedure
    .input(
      z.object({
        content: z.string(),
        contentType: z.enum(["post", "product", "profile"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `Analyze this INQAR ${input.contentType} content and provide insights:

Content: "${input.content}"

Provide:
1. Key themes or topics
2. Sentiment (positive/neutral/negative)
3. Engagement potential (high/medium/low)
4. Suggested improvements

Format as JSON with keys: themes, sentiment, engagementPotential, improvements`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === "string" ? content : "{}";

        try {
          const insights = JSON.parse(contentStr);
          return {
            success: true,
            insights,
          };
        } catch {
          return {
            success: false,
            insights: {},
          };
        }
      } catch (error) {
        console.error("[INQAR AI] Content analysis error:", error);
        return {
          success: false,
          insights: {},
        };
      }
    }),
});
