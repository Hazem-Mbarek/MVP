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
  type: "incoterms" | "incoterms_comparison" | "cmr" | "database" | "faq" | "transport_check" | "synthesis"
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
  "Each task: id, description, type (one of: incoterms, incoterms_comparison, cmr, database, faq, transport_check, reports, synthesis), toolsNeeded array.\n\n" +
  "User question: " + q

// For large Excel/report queries, split into focused sub-questions to avoid token limits
const REPORT_QUERY_SPLITTER_PROMPT = (originalQ: string, reportNames: string[]) =>
  "Break this report query into 2-3 focused sub-questions, each retrieving ONE specific report.\n\n" +
  "Available reports:\n" + reportNames.map(r => `- ${r}`).join("\n") + "\n\n" +
  "Original question: " + originalQ + "\n\n" +
  "Return ONLY a JSON object with 'subQuestions' array (each with 'question' and 'targetReports' array).\n" +
  "Keep each question focused and under 200 tokens worth of text."

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
    
    // Check if this is a large report/excel query that needs splitting
    let questionsToProcess = [userQuestion]
    if (this.isLargeReportQuery(userQuestion)) {
      console.log("[ORCHESTRATOR] Detected large report query, splitting into sub-questions")
      questionsToProcess = await this.splitReportQuery(userQuestion)
      console.log("[ORCHESTRATOR] Split into", questionsToProcess.length, "sub-questions")
    }

    // Process each question and collect results
    let allResults: string[] = []
    for (const q of questionsToProcess) {
      console.log("[ORCHESTRATOR] Processing question:", q.substring(0, 80) + "...")
      
      // STEP 1: Decompose the question
      console.log("[ORCHESTRATOR] === STEP 1: DECOMPOSITION ===")
      const decomposition = await this.decomposeQuestion(q)
      console.log("[ORCHESTRATOR] Decomposition complete, tasks:", decomposition.tasks.length)

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

        const result = await this.executeTask(task, q)
        taskResults.push(result)

        // Emit task complete event
        this.emitEvent({
          type: "task_complete",
          taskId: task.id,
          data: result.result.substring(0, 200),
        })

        console.log(`[ORCHESTRATOR] Task ${task.id} complete, result length: ${result.result.length}`)
      }

      // STEP 3: Synthesize results for this question
      console.log("[ORCHESTRATOR] === STEP 3: SYNTHESIS ===")
      const answer = await this.synthesizeResults(q, taskResults)
      allResults.push(answer)
    }

    // Combine all results if multiple questions
    let finalAnswer = allResults.length === 1 ? allResults[0] : this.combineResults(userQuestion, allResults)
    console.log("[ORCHESTRATOR] === END processQuestion ===")

    // Emit final answer event
    this.emitEvent({
      type: "final_answer",
      data: finalAnswer,
    })

    return finalAnswer
  }
  
  private isLargeReportQuery(question: string): boolean {
    const reportKeywords = ["excel", "report", "csv", "sales", "inventory", "shipment", "fleet", "financial", "data"]
    const hasReportKeyword = reportKeywords.some(kw => question.toLowerCase().includes(kw))
    const isComplex = question.length > 200 || question.split(",").length > 2
    return hasReportKeyword && isComplex
  }
  
  private async splitReportQuery(userQuestion: string): Promise<string[]> {
    const reports = [
      "Sales Report Q3 2026",
      "Inventory Snapshot",
      "Shipment Performance",
      "Fleet Utilization",
      "Financial Summary"
    ]
    
    const prompt = REPORT_QUERY_SPLITTER_PROMPT(userQuestion, reports)
    console.log("[ORCHESTRATOR] Splitting large report query")
    
    const response = await this.openrouterService.sendMessage(prompt, false)
    console.log("[ORCHESTRATOR] Split response:", response.substring(0, 200))
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn("[ORCHESTRATOR] Failed to parse split response, using original question")
        return [userQuestion]
      }
      
      const split = JSON.parse(jsonMatch[0])
      const subQuestions = split.subQuestions?.map((sq: any) => sq.question) || [userQuestion]
      return subQuestions.slice(0, 3) // Limit to 3 sub-questions
    } catch (e) {
      console.warn("[ORCHESTRATOR] Error parsing split response:", e)
      return [userQuestion]
    }
  }
  
  private combineResults(originalQuestion: string, results: string[]): string {
    return `Based on the analysis of multiple data sources:\n\n${results.map((r, i) => `**Part ${i + 1}:**\n${r}`).join("\n\n")}`
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
      case "incoterms_comparison":
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
    // Format task results with context about what each task was attempting
    const taskResultsFormatted = taskResults
      .map((tr) => {
        // Include task type context so synthesis understands what data source this came from
        return `[${tr.taskId} - ${tr.taskDescription}]\n${tr.result}`
      })
      .join("\n\n---\n\n")

    const synthesisRules = getRulesForTask("synthesis")

    const prompt =
      synthesisRules +
      "\n\nOriginal user question: " +
      originalQuestion +
      "\n\nInformation retrieved from knowledge sources:\n" +
      taskResultsFormatted +
      "\n\nSynthesized Answer Instructions:\n" +
      "1. Combine the above information into a coherent answer directly addressing the original question.\n" +
      "2. DO NOT output task labels or IDs in the final answer.\n" +
      "3. DO NOT list information as separate sections for each task.\n" +
      "4. Weave information together naturally, ordered by relevance to the question.\n" +
      "5. If a task returned 'not found' or partial data, acknowledge what WAS found rather than dwelling on gaps.\n" +
      "6. Prioritize answering the core question even if some supporting information is incomplete.\n" +
      "7. Use all citations provided by the tasks.\n" +
      "8. Output ONLY the final synthesized answer — no task metadata, no explanations of process."

    console.log("[ORCHESTRATOR] Sending synthesis prompt")
    // Don't include system prompt - synthesis has its own focused rules
    const finalAnswer = await this.openrouterService.sendMessage(prompt, false)

    return finalAnswer
  }
}
