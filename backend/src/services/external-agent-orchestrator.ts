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
  "IMPORTANT: Most customer questions should route to FAQ first — it covers services, policies, and company info.\n\n" +
  "Routing rules (in priority order):\n" +
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
  private sessionClientId: string // Session-bound customer identity

  constructor(sessionClientId: string) {
    this.openrouterService = new OpenRouterService()
    this.sessionClientId = sessionClientId
  }

  addEventListener(listener: TaskEventListener): void {
    this.eventListeners.push(listener)
  }

  private emitEvent(event: TaskEvent): void {
    console.log("[EXTERNAL-ORCHESTRATOR] Emitting event:", event.type, event.taskId || "")
    this.eventListeners.forEach((listener) => listener(event))
  }

  async processQuestion(userQuestion: string): Promise<string> {
    console.log(
      "[EXTERNAL-ORCHESTRATOR] === START processQuestion ===",
      "SessionClientId:",
      this.sessionClientId
    )
    console.log("[EXTERNAL-ORCHESTRATOR] User question:", userQuestion)

    // STEP 1: Decompose the question
    console.log("[EXTERNAL-ORCHESTRATOR] === STEP 1: DECOMPOSITION ===")
    const decomposition = await this.decomposeQuestion(userQuestion)
    console.log("[EXTERNAL-ORCHESTRATOR] Decomposition complete, tasks:", decomposition.tasks.length)

    this.emitEvent({
      type: "decomposition_complete",
      data: JSON.stringify(decomposition.tasks.map((t) => ({ id: t.id, description: t.description, type: t.type }))),
    })

    // STEP 2: Execute each task
    console.log("[EXTERNAL-ORCHESTRATOR] === STEP 2: TASK EXECUTION ===")
    const taskResults: TaskResult[] = []
    for (const task of decomposition.tasks) {
      if (task.type === "synthesis") {
        console.log("[EXTERNAL-ORCHESTRATOR] Skipping synthesis task for now, will run last")
        continue
      }
      console.log(`[EXTERNAL-ORCHESTRATOR] Executing task: ${task.id} (${task.type})`)

      this.emitEvent({
        type: "task_started",
        taskId: task.id,
        taskDescription: task.description,
        taskType: task.type,
      })

      const result = await this.executeTask(task, userQuestion)
      taskResults.push(result)

      this.emitEvent({
        type: "task_complete",
        taskId: task.id,
        data: result.result.substring(0, 200),
      })

      console.log(`[EXTERNAL-ORCHESTRATOR] Task ${task.id} complete, result length: ${result.result.length}`)
    }

    // STEP 3: Synthesize results
    console.log("[EXTERNAL-ORCHESTRATOR] === STEP 3: SYNTHESIS ===")
    const finalAnswer = await this.synthesizeResults(userQuestion, taskResults)
    console.log("[EXTERNAL-ORCHESTRATOR] === END processQuestion ===")

    this.emitEvent({
      type: "final_answer",
      data: finalAnswer,
    })

    return finalAnswer
  }

  private async decomposeQuestion(userQuestion: string): Promise<TaskDecomposition> {
    const prompt = DECOMPOSITION_PROMPT(userQuestion)
    console.log("[EXTERNAL-ORCHESTRATOR] Sending decomposition prompt")

    const response = await this.openrouterService.sendMessage(prompt, false)
    console.log("[EXTERNAL-ORCHESTRATOR] Decomposition response length:", response.length)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse decomposition JSON: " + response.substring(0, 200))
    }

    const decomposition: TaskDecomposition = JSON.parse(jsonMatch[0])
    return decomposition
  }

  private async executeTask(task: Task, originalQuestion: string): Promise<TaskResult> {
    let prompt: string

    // Add session context for database queries
    const sessionContext =
      task.type === "database" ? `\nSession customer ID: ${this.sessionClientId}\n` : ""

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

    console.log(
      `[EXTERNAL-ORCHESTRATOR] Executing task ${task.id} with focused prompt (${prompt.length} chars)`
    )
    // INCLUDE system prompt for task execution to enable tool calling
    const result = await this.openrouterService.sendMessage(prompt, true)

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

    console.log("[EXTERNAL-ORCHESTRATOR] Sending synthesis prompt")
    const finalAnswer = await this.openrouterService.sendMessage(prompt, false)

    return finalAnswer
  }
}
