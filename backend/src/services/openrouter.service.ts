import axios, { AxiosError } from "axios"
import { config } from "../config"
import { toolSchemas, handleSearchKnowledge, handleCheckTransportCompatibility, handleCompareIncoterms } from "../knowledge/tools"

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    if (!config.openrouter.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured")
    }
    this.apiKey = config.openrouter.apiKey
    this.baseUrl = config.openrouter.baseUrl
    this.model = config.openrouter.model
  }

  async sendMessage(userMessage: string): Promise<string> {
    console.log("[OPENROUTER] Sending message:", userMessage.substring(0, 50) + "...")
    
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `<role>You are a staff-facing knowledge assistant for a logistics company. You answer questions using five data sources, each backed by a specific tool. You never answer from memory. You always route to the correct tool before answering, and you always cite what you used.</role>

<data_sources>
<source id="incoterms_comparison_yaml">
<type>deterministic_lookup</type>
<tool>compare_incoterms(codes: string[])</tool>
<trigger>question compares 2+ Incoterms, OR asks about a specific obligation/attribute of one Incoterm: who arranges carriage, who insures, who clears customs, who pays duties, who unloads, where risk transfers</trigger>
<constraint>sole source of truth for these facts; never answer this trigger type from search_knowledge, even if a retrieved chunk mentions the attribute</constraint>
</source>

<source id="transport_compatibility_yaml">
<type>deterministic_lookup</type>
<tool>check_transport_compatibility(mode: string, incoterm: string)</tool>
<trigger>question asks whether an Incoterm is valid/typical for a transport mode: road, rail, air, sea, inland_waterway, multimodal</trigger>
<constraint>sole source of truth; never answer this trigger type from search_knowledge</constraint>
</source>

<source id="incoterms_jsonl">
<type>semantic_search</type>
<tool>search_knowledge(query: string, source_filter: "incoterms", top_k: 5)</tool>
<trigger>question asks for definition, explanation, or general context of an Incoterm, not a specific attribute or comparison</trigger>
<constraint>fields mode_scope, road_compatible, category on these records are metadata only; never use them to answer a compatibility or attribute question — defer to the YAML tools for those</constraint>
</source>

<source id="cmr_jsonl">
<type>semantic_search</type>
<tool>search_knowledge(query: string, source_filter: "cmr", top_k: 5)</tool>
<trigger>question references CMR, road carriage law, carrier liability, claims procedure, documentation requirements, or an article number</trigger>
<constraint>if user states an article number, include it verbatim in query string</constraint>
</source>

<source id="faq_jsonl">
<type>semantic_search</type>
<tool>search_knowledge(query: string, source_filter: "faq", top_k: 5)</tool>
<trigger>question is about company policy, services offered, pricing structure, or operational practice</trigger>
</source>
</data_sources>

<routing_procedure>
Evaluate in this exact order. Stop at first match. Do not evaluate further rules once matched.
1. matches incoterms_comparison_yaml trigger -> call compare_incoterms, skip all else
2. matches transport_compatibility_yaml trigger -> call check_transport_compatibility, skip all else
3. matches incoterms_jsonl trigger -> call search_knowledge(source_filter="incoterms")
4. matches cmr_jsonl trigger -> call search_knowledge(source_filter="cmr")
5. matches faq_jsonl trigger -> call search_knowledge(source_filter="faq")
6. matches 2+ triggers -> decompose into sub-questions, apply rules 1-5 to each independently, do not reuse one sub-question's result for another
7. matches no trigger, or tool returns no usable result -> state coverage gap explicitly, do not answer
</routing_procedure>

<result_handling>
<rule>MANDATORY_CITATION -> EVERY fact in your response MUST cite its source. No exceptions. Format: {id, source} for jsonl records, {filename} for yaml lookups, or "not found in knowledge base" if no source exists</rule>
<rule>yaml_tool_result -> state as fact, no hedge, cite source_file</rule>
<rule>search_knowledge_result_low_confidence -> do not state as answer; state gap; may offer closest hit labeled "possibly related" with citation</rule>
<rule>mixed_result -> order output: deterministic fact first, semantic context second; cite each independently</rule>
<rule>every_fact -> cite individually: {id, source} for jsonl-derived, {filename} for yaml-derived; no single blanket citation for multiple facts</rule>
<rule>incoterms_jsonl_field_conflicts_with_yaml -> yaml value wins silently; cite yaml source</rule>
<rule>if_no_tool_found_data -> state explicitly that this question cannot be answered from available knowledge sources; do not attempt to answer from model memory</rule>
</result_handling>

<anti_patterns>
<item>calling search_knowledge when routing_procedure already resolved to a yaml tool</item>
<item>answering a compatibility or attribute question using search_knowledge text alone</item>
<item>single blanket citation covering multiple synthesized facts</item>
<item>treating one moderate-confidence hit from one source_filter as authoritative for a question that belongs to a different source</item>
<item>answering from model memory when no tool was called</item>
<item>CRITICAL: stating any fact without citing its source — every answer must include citations or state "not found in knowledge base"</item>
<item>CRITICAL: answering a question that matches no trigger without explicitly stating the coverage gap and refusing to guess</item>
<item>CRITICAL: any tool call error or empty result must always produce explicit output text stating the gap; blank output is NEVER valid</item>
</anti_patterns>`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]

    try {
      console.log(`[OPENROUTER] Making request to ${this.baseUrl}/chat/completions`)
      console.log(`[OPENROUTER] Model: ${this.model}`)
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          tools: toolSchemas,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://loghub.local",
            "X-Title": "LogHub",
          },
          timeout: 30000,
        }
      )

      console.log("[OPENROUTER] Response received, status:", response.status)
      
      // Handle tool calls if present
      const assistantMessage = response.data.choices?.[0]?.message
      if (!assistantMessage) {
        throw new Error("Empty response from OpenRouter API")
      }

      messages.push({ role: "assistant", content: assistantMessage.content || "", ...assistantMessage })

      // Process tool calls in a loop (max 2 iterations to prevent loops)
      let currentMessage = assistantMessage
      let iterations = 0
      const maxIterations = 2  // Reduced from 5 to prevent excessive tool calls
      
      while (currentMessage.tool_calls && currentMessage.tool_calls.length > 0 && iterations < maxIterations) {
        console.log("[OPENROUTER] Processing tool calls:", currentMessage.tool_calls.length)
        iterations++
        
        for (const toolCall of currentMessage.tool_calls) {
          let toolResult
          const toolArgs = typeof toolCall.function.arguments === "string" 
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments

          console.log(`[OPENROUTER] Calling tool: ${toolCall.function.name}`)
          
          switch (toolCall.function.name) {
            case "search_knowledge":
              toolResult = await handleSearchKnowledge(toolArgs)
              break
            case "check_transport_compatibility":
              toolResult = handleCheckTransportCompatibility(toolArgs)
              break
            case "compare_incoterms":
              toolResult = handleCompareIncoterms(toolArgs)
              break
            default:
              toolResult = { error: `Unknown tool: ${toolCall.function.name}` }
          }

          console.log(`[OPENROUTER] Tool result:`, JSON.stringify(toolResult).substring(0, 200))
          
          messages.push({
            role: "tool",
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          })
        }

        // Get next response from model
        const nextResponse = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            tools: toolSchemas,
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "HTTP-Referer": "https://loghub.local",
              "X-Title": "LogHub",
            },
            timeout: 30000,
          }
        )

        const nextMessage = nextResponse.data.choices?.[0]?.message
        if (!nextMessage) {
          throw new Error("Empty response from OpenRouter API on tool call continuation")
        }
        
        // Add assistant message to conversation
        const assistantContent = nextMessage.content || "(No text response)"
        messages.push({ role: "assistant", content: assistantContent })
        
        // Check if model wants to call more tools
        currentMessage = nextMessage
        if (!currentMessage.tool_calls || currentMessage.tool_calls.length === 0) {
          break
        }
      }

      if (iterations >= maxIterations) {
        console.warn("[OPENROUTER] Reached maximum tool iterations, stopping loop")
      }

      // Return final text response - find the last assistant message with content
      let finalContent = ""
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant" && messages[i].content) {
          finalContent = messages[i].content
          break
        }
      }
      
      if (!finalContent) {
        // If no assistant content, generate a generic response based on tool results
        console.warn("[OPENROUTER] No text response from model, generating fallback")
        finalContent = "I found information related to your query, but the model didn't generate a clear answer. Please try rewording your question."
      }

      console.log("[OPENROUTER] Message generated successfully")
      return finalContent
    } catch (error) {
      console.error("[OPENROUTER] Error:", error)
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>
        console.error("[OPENROUTER] Axios error details:")
        console.error("  - Status:", axiosError.response?.status)
        console.error("  - Data:", axiosError.response?.data)
        console.error("  - Message:", axiosError.message)
        
        const message =
          axiosError.response?.data?.error?.message ||
          axiosError.message ||
          "Failed to get response from OpenRouter"
        throw new Error(message)
      }
      throw error
    }
  }
}
