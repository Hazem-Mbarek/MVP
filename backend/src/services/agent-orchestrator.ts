import { OpenRouterService } from "./openrouter.service"
import { getRulesForTask, ROUTING_RULES } from "./task-rules"

export interface TaskDecomposition {
  goal: string
  tasks: Task[]
  dataSourcesNeeded: string[]
}

export interface Task {
  id: string
  description: string
  type: "incoterms" | "cmr" | "database" | "faq" | "transport_check" | "synthesis"
  toolsNeeded: string[]
  instructions?: string
}

export interface TaskResult {
  taskId: string
  taskDescription: string
  result: string
  sourcesUsed: string[]
}

// Prompts as string concatenation to avoid template literal issues
const DECOMPOSITION_PROMPT = (q: string) =>
  "You are a task decomposition agent. Analyze the user question and break it into discrete steps.\n\n" +
  "Routing rules (in priority order):\n" +
  ROUTING_RULES.order.map((r) => `- ${r}`).join("\n") +
  "\n\nFor each step, identify:\n" +
  "1. What data/knowledge is needed\n" +
  "2. Which tool would retrieve it\n\n" +
  "Return ONLY a JSON object (no markdown, no explanation) with tasks array.\n" +
  "Each task: id, description, type (one of: incoterms, cmr, database, faq, transport_check, synthesis), toolsNeeded array.\n\n" +
  "User question: " + q

export type TaskEventListener = (event: TaskEvent) => void

export interface TaskEvent {
  type: "decomposition_complete" | "task_started" | "task_complete" | "final_answer"
  taskId?: string
  taskDescription?: string
  taskType?: string
  data?: string
}

export class AgentOrchestrator {
  private openrouterService: OpenRouterService
  private eventListeners: TaskEventListener[] = []

  constructor() {
    this.openrouterService = new OpenRouterService()
  }

  addEventListener(listener: TaskEventListener): void {
    this.eventListeners.push(listener)
  }

  private emitEvent(event: TaskEvent): void {
    console.log("[ORCHESTRATOR] Emitting event:", event.type, event.taskId || "")
    this.eventListeners.forEach((listener) => listener(event))
  }

  async processQuestion(userQuestion: string): Promise<string> {
    console.log("[ORCHESTRATOR] === START processQuestion ===")
    console.log("[ORCHESTRATOR] User question:", userQuestion)

    // STEP 1: Decompose the question
    console.log("[ORCHESTRATOR] === STEP 1: DECOMPOSITION ===")
    const decomposition = await this.decomposeQuestion(userQuestion)
    console.log("[ORCHESTRATOR] Decomposition complete, tasks:", decomposition.tasks.length)
    console.log("[ORCHESTRATOR] Tasks:", JSON.stringify(decomposition.tasks, null, 2))

    // Emit decomposition event
    this.emitEvent({
      type: "decomposition_complete",
      data: JSON.stringify(decomposition.tasks.map((t) => ({ id: t.id, description: t.description, type: t.type }))),
    })

    // STEP 2: Execute each task
    console.log("[ORCHESTRATOR] === STEP 2: TASK EXECUTION ===")
    const taskResults: TaskResult[] = []
    for (const task of decomposition.tasks) {
      if (task.type === "synthesis") {
        console.log("[ORCHESTRATOR] Skipping synthesis task for now, will run last")
        continue
      }
      console.log(`[ORCHESTRATOR] Executing task: ${task.id} (${task.type})`)

      // Emit task start event
      this.emitEvent({
        type: "task_started",
        taskId: task.id,
        taskDescription: task.description,
        taskType: task.type,
      })

      const result = await this.executeTask(task, userQuestion)
      taskResults.push(result)

      // Emit task complete event
      this.emitEvent({
        type: "task_complete",
        taskId: task.id,
        data: result.result.substring(0, 200), // Send preview
      })

      console.log(`[ORCHESTRATOR] Task ${task.id} complete, result length: ${result.result.length}`)
    }

    // STEP 3: Synthesize results
    console.log("[ORCHESTRATOR] === STEP 3: SYNTHESIS ===")
    const finalAnswer = await this.synthesizeResults(userQuestion, taskResults)
    console.log("[ORCHESTRATOR] === END processQuestion ===")

    // Emit final answer event
    this.emitEvent({
      type: "final_answer",
      data: finalAnswer,
    })

    return finalAnswer
  }

  private async decomposeQuestion(userQuestion: string): Promise<TaskDecomposition> {
    const prompt = DECOMPOSITION_PROMPT(userQuestion)
    console.log("[ORCHESTRATOR] Sending decomposition prompt")

    // Don't include system prompt - decomposition has its own focused rules
    const response = await this.openrouterService.sendMessage(prompt, false)
    console.log("[ORCHESTRATOR] Decomposition response length:", response.length)

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse decomposition JSON: " + response.substring(0, 200))
    }

    const decomposition: TaskDecomposition = JSON.parse(jsonMatch[0])
    return decomposition
  }

  private async executeTask(task: Task, originalQuestion: string): Promise<TaskResult> {
    let prompt: string

    switch (task.type) {
      case "incoterms":
        prompt =
          getRulesForTask("incoterms") +
          "\n\nTask: " +
          task.description +
          "\nOriginal question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      case "cmr":
        prompt =
          getRulesForTask("cmr") +
          "\n\nTask: " +
          task.description +
          "\nOriginal question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      case "database":
        prompt =
          getRulesForTask("database") +
          "\n\nTask: " +
          task.description +
          "\nOriginal question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      case "faq":
        prompt =
          getRulesForTask("faq") +
          "\n\nTask: " +
          task.description +
          "\nOriginal question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      case "transport_check":
        prompt =
          getRulesForTask("transport_check") +
          "\n\nTask: " +
          task.description +
          "\nOriginal question: " +
          originalQuestion +
          "\n\nExecute the task and provide ONLY the result with citations."
        break

      default:
        throw new Error("Unknown task type: " + task.type)
    }

    console.log(`[ORCHESTRATOR] Executing task ${task.id} with focused prompt (${prompt.length} chars)`)
    // Don't include system prompt - task has its own focused rules
    const result = await this.openrouterService.sendMessage(prompt, false)

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
    // Format task results clearly without task labels in final output
    const taskResultsFormatted = taskResults
      .map((tr) => {
        // Only include result data, not task metadata
        return tr.result
      })
      .join("\n\n")

    const synthesisRules = getRulesForTask("synthesis")

    const prompt =
      synthesisRules +
      "\n\nOriginal user question: " +
      originalQuestion +
      "\n\nInformation retrieved from knowledge sources:\n" +
      taskResultsFormatted +
      "\n\nSynthesized Answer:\n" +
      "Combine the above information into a single coherent answer that directly addresses the original question. " +
      "Do NOT repeat task descriptions or labels like 'Task 1', 'Task 2', etc. " +
      "Do NOT list information as separate bullet points for each task. " +
      "Instead, weave the information together naturally. " +
      "If some information was not found, mention that briefly but don't emphasize it. " +
      "Focus on what was found and what matters for answering the question."

    console.log("[ORCHESTRATOR] Sending synthesis prompt")
    // Don't include system prompt - synthesis has its own focused rules
    const finalAnswer = await this.openrouterService.sendMessage(prompt, false)

    return finalAnswer
  }
}
