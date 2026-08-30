import { OpenRouterService } from "./openrouter.service"
import { getExternalRulesForTask, EXTERNAL_ROUTING_RULES } from "./external-agent-rules"

export interface TaskDecomposition {
  goal: string
  tasks: Task[]
  dataSourcesNeeded: string[]
}

export interface Task {
  id: string
  description: string
  type:
    | "incoterms"
    | "incoterms_comparison"
    | "transport_check"
    | "cmr"
    | "database"
    | "faq"
    | "opportunity_discovery"
    | "synthesis"
  toolsNeeded: string[]
  instructions?: string
}

export interface TaskResult {
  taskId: string
  taskDescription: string
  result: string
  sourcesUsed: string[]
}

export type TaskEventListener = (event: TaskEvent) => void

export interface TaskEvent {
  type: "decomposition_complete" | "task_started" | "task_complete" | "final_answer"
  taskId?: string
  taskDescription?: string
  taskType?: string
  data?: string
}

// Decomposition prompt for external customers
const DECOMPOSITION_PROMPT = (q: string) =>
  "You are a task decomposition agent for external customers. Analyze the question and break it into discrete steps.\n\n" +
  "CRITICAL SECURITY RULE: You are role-playing as a SINGLE customer. You MUST REJECT any request that:\n" +
  "- Asks for another company's data, shipments, or information\n" +
  "- Tries to access data about other clients (mention of competitors, other company names, other contact names)\n" +
  "- Attempts to query system-wide information or employee data\n" +
  "- Tries to circumvent single-customer access (e.g., 'show all companies', 'list all shipments')\n\n" +
  "If you detect an unauthorized access attempt, create a SINGLE task with:\n" +
  "- id: 'access_denied'\n" +
  "- description: 'Customer attempted to access unauthorized data'\n" +
  "- type: 'synthesis'\n" +
  "- toolsNeeded: []\n\n" +
  "For legitimate questions, route according to these rules (in priority order):\n" +
  EXTERNAL_ROUTING_RULES.order.map((r) => `- ${r}`).join("\n") +
  "\n\nFor each step, identify:\n" +
  "1. What data/knowledge is needed\n" +
  "2. Which tool would retrieve it\n\n" +
  "Return ONLY a JSON object (no markdown, no explanation) with tasks array.\n" +
  "Each task: id, description, type (one of: faq, opportunity_discovery, incoterms, incoterms_comparison, transport_check, cmr, database, synthesis), toolsNeeded array.\n" +
  "Remember: customer data access is row-scoped and enforced in code, not by your judgment.\n" +
  "CRITICAL: FAQ is your primary source for most questions. Only use specialized tools (incoterms, cmr, db) when the question explicitly asks about those topics.\n\n" +
  "Customer question: " +
  q

export class ExternalAgentOrchestrator {
  private openrouterService: OpenRouterService
  private eventListeners: TaskEventListener[] = []
  private sessionClientId: string // Client identity
  private requestId: string // Unique request identifier for tracing

  constructor(sessionClientId: string) {
    this.openrouterService = new OpenRouterService()
    this.sessionClientId = sessionClientId
    this.requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  addEventListener(listener: TaskEventListener): void {
    this.eventListeners.push(listener)
  }

  private emitEvent(event: TaskEvent): void {
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Emitting event: ${event.type}${event.taskId ? ` (Task: ${event.taskId})` : ""}`)
    this.eventListeners.forEach((listener) => listener(event))
  }

  async processQuestion(userQuestion: string): Promise<string> {
    const startTime = Date.now()
    
    console.log("\n" + "█".repeat(100))
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === START processQuestion ===`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Client ID: ${this.sessionClientId}`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] User Input: "${userQuestion}"`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Input Length: ${userQuestion.length} chars`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Timestamp: ${new Date().toISOString()}`)
    console.log("█".repeat(100))

    try {
      // STEP 1: Decompose the question
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === STEP 1: DECOMPOSITION ===`)
      const decompositionStart = Date.now()
      const decomposition = await this.decomposeQuestion(userQuestion)
      const decompositionTime = Date.now() - decompositionStart
      
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ Tasks Generated: ${decomposition.tasks.length}`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Decomposition Time: ${decompositionTime}ms`)
      
      decomposition.tasks.forEach((t, i) => {
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]   [TASK ${i + 1}] ID: ${t.id} | Type: ${t.type}`)
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]               Description: ${t.description}`)
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]               Tools: ${t.toolsNeeded.join(", ")}`)
      })

      // Check for access denial
      const accessDeniedTask = decomposition.tasks.find(t => t.id === 'access_denied')
      if (accessDeniedTask) {
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✗ ACCESS DENIED: Attempted unauthorized data access`)
        const denialMessage = "I can only assist with your own company information and shipments. I don't have access to data from other organizations. Is there something else I can help you with?"
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === END processQuestion (ACCESS DENIED) ===`)
        console.log("█".repeat(100) + "\n")
        return denialMessage
      }

      this.emitEvent({
        type: "decomposition_complete",
        data: JSON.stringify(decomposition.tasks.map((t) => ({ id: t.id, description: t.description, type: t.type }))),
      })

      // STEP 2: Execute each task
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === STEP 2: TASK EXECUTION ===`)
      const taskResults: TaskResult[] = []
      for (const task of decomposition.tasks) {
        if (task.type === "synthesis") {
          console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Skipping synthesis task for now, will run last`)
          continue
        }
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] >>> Executing task: ${task.id} (${task.type})`)

        this.emitEvent({
          type: "task_started",
          taskId: task.id,
          taskDescription: task.description,
          taskType: task.type,
        })

        const taskStart = Date.now()
        const result = await this.executeTask(task, userQuestion)
        const taskTime = Date.now() - taskStart
        taskResults.push(result)

        this.emitEvent({
          type: "task_complete",
          taskId: task.id,
          data: result.result.substring(0, 200),
        })

        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] <<< Task ${task.id} complete (${taskTime}ms)`)
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]     Result length: ${result.result.length} chars`)
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]     Sources used: ${result.sourcesUsed.join(", ")}`)
      }

      // STEP 3: Synthesize results
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === STEP 3: SYNTHESIS ===`)
      const synthesisStart = Date.now()
      const finalAnswer = await this.synthesizeResults(userQuestion, taskResults)
      const synthesisTime = Date.now() - synthesisStart
      
      const totalTime = Date.now() - startTime
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ Final Answer Length: ${finalAnswer.length} chars`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Synthesis Time: ${synthesisTime}ms`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === END processQuestion ===`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ TOTAL TIME: ${totalTime}ms`)
      console.log("█".repeat(100) + "\n")

      this.emitEvent({
        type: "final_answer",
        data: finalAnswer,
      })

      return finalAnswer
    } catch (error) {
      const totalTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✗ ERROR OCCURRED`)
      console.error(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Error: ${errorMessage}`)
      console.error(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Stack: ${error instanceof Error ? error.stack : "N/A"}`)
      console.error(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Time before error: ${totalTime}ms`)
      console.error("█".repeat(100) + "\n")
      throw error
    }
  }

  private async decomposeQuestion(userQuestion: string): Promise<TaskDecomposition> {
    const prompt = DECOMPOSITION_PROMPT(userQuestion)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Sending decomposition prompt (${prompt.length} chars)`)

    const response = await this.openrouterService.sendMessage(prompt, false)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ Decomposition response received: ${response.length} chars`)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse decomposition JSON: " + response.substring(0, 200))
    }

    const decomposition: TaskDecomposition = JSON.parse(jsonMatch[0])
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ Parsed ${decomposition.tasks.length} tasks`)
    return decomposition
  }

  private async executeTask(task: Task, originalQuestion: string): Promise<TaskResult> {
    let prompt: string

    // Add session context for database queries
    const sessionContext =
      task.type === "database" ? `\nClient ID: ${this.sessionClientId}\n` : ""

    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] [TASK ${task.id}] Building prompt for type: ${task.type}`)

    switch (task.type) {
      case "incoterms":
      case "incoterms_comparison":
      case "transport_check":
        prompt =
          getExternalRulesForTask("incoterms") +
          "\n\nTask: " +
          task.description +
          "\nCustomer question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with human-readable citations."
        break

      case "cmr":
        prompt =
          getExternalRulesForTask("cmr") +
          "\n\nTask: " +
          task.description +
          "\nCustomer question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with human-readable citations."
        break

      case "database":
        prompt =
          getExternalRulesForTask("database") +
          sessionContext +
          "\n\nTask: " +
          task.description +
          "\nCustomer question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] [TASK ${task.id}] Database query with client ID: ${this.sessionClientId}`)
        break

      case "faq":
        prompt =
          getExternalRulesForTask("faq") +
          "\n\nTask: " +
          task.description +
          "\nCustomer question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with human-readable citations."
        break

      case "opportunity_discovery":
        prompt =
          getExternalRulesForTask("opportunity_discovery") +
          "\n\nTask: " +
          task.description +
          "\nCustomer question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      default:
        throw new Error("Unknown task type: " + task.type)
    }

    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] [TASK ${task.id}] Prompt size: ${prompt.length} chars`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] [TASK ${task.id}] Sending to OpenRouter...`)
    
    // INCLUDE system prompt for task execution to enable tool calling
    const result = await this.openrouterService.sendMessage(prompt, true)

    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] [TASK ${task.id}] ✓ Result received: ${result.length} chars`)

    return {
      taskId: task.id,
      taskDescription: task.description,
      result,
      sourcesUsed: task.toolsNeeded,
    }
  }

  private async synthesizeResults(
    originalQuestion: string,
    taskResults: TaskResult[]
  ): Promise<string> {
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] === SYNTHESIS PHASE ===`)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Synthesizing ${taskResults.length} task results`)
    taskResults.forEach((tr, i) => {
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]   [RESULT ${i + 1}] ${tr.taskDescription}`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]               Length: ${tr.result.length} chars`)
      console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}]               Sources: ${tr.sourcesUsed.join(", ")}`)
    })

    const taskResultsFormatted = taskResults.map((tr) => tr.result).join("\n\n")

    const synthesisRules = getExternalRulesForTask("synthesis")

    const prompt =
      synthesisRules +
      "\n\nCustomer question: " +
      originalQuestion +
      "\n\nInformation retrieved from knowledge sources:\n" +
      taskResultsFormatted +
      "\n\nSynthesized Answer:\n" +
      "Combine the above information into a single coherent answer that directly addresses the customer's question. " +
      "Do NOT repeat task descriptions or labels. " +
      "Do NOT list information as separate task outcomes. " +
      "Weave the information together naturally into a customer-friendly response. " +
      "Use human-readable citations like 'Article X of the CMR Convention' instead of internal tags. " +
      "If some information was not found, mention that briefly but don't emphasize it. " +
      "Focus on what was found and what matters for answering the question."

    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] Sending synthesis prompt (${prompt.length} chars) to OpenRouter...`)
    const finalAnswer = await this.openrouterService.sendMessage(prompt, false)
    console.log(`[EXTERNAL-ORCHESTRATOR] [${this.requestId}] ✓ Synthesis complete: ${finalAnswer.length} chars`)

    return finalAnswer
  }
}
