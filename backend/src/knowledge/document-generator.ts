import PDFDocument from "pdfkit"
import { Writable } from "stream"

export interface DocumentOptions {
  clientId: string
  clientName: string
  company: string
  title: string
  content: string
  generatedDate?: Date
}

export async function generateStatementPDF(options: DocumentOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      const stream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk)
          callback()
        },
      })

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      })

      doc.pipe(stream)

      doc.fontSize(24).font("Helvetica-Bold").text(options.title, { align: "center" })
      doc.moveDown(0.5)

      const dateStr = options.generatedDate
        ? options.generatedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })

      doc.fontSize(10).font("Helvetica").text(`Generated: ${dateStr}`, { align: "right" })
      doc.moveDown(0.5)

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(1)

      doc.fontSize(12).font("Helvetica-Bold").text("ACCOUNT HOLDER", { underline: true })
      doc.fontSize(10).font("Helvetica")
      doc.text(`${options.company}`, { indent: 20 })
      doc.moveDown(1)

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(1)

      doc.fontSize(12).font("Helvetica-Bold").text("STATEMENT DETAILS", { underline: true })
      doc.fontSize(10).font("Helvetica")
      doc.moveDown(0.5)

      const cleanedContent = extractStructuredData(options.content)
      const lines = cleanedContent.split("\n")
      let inTable = false
      let tableData: string[][] = []

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed) {
          if (inTable && tableData.length > 0) {
            renderTable(doc, tableData)
            tableData = []
            inTable = false
          }
          doc.moveDown(0.3)
          continue
        }

        if (trimmed.includes("|") || trimmed.includes("---")) {
          inTable = true
          const cells = trimmed
            .split("|")
            .map((cell) => {
              let cleaned = cell.trim().replace(/^-+$/, "")
              cleaned = cleanCellData(cleaned)
              return cleaned
            })
            .filter((cell) => cell && !cell.startsWith("-"))
          if (cells.length > 0) {
            tableData.push(cells)
          }
        } else {
          if (inTable && tableData.length > 0) {
            renderTable(doc, tableData)
            tableData = []
            inTable = false
          }

          if (trimmed.endsWith(":") || /^[A-Z\s]+$/.test(trimmed)) {
            doc.fontSize(11).font("Helvetica-Bold").text(trimmed, { indent: 20 })
          } else {
            doc.fontSize(10).font("Helvetica").text(trimmed, { indent: 20 })
          }
        }
      }

      if (inTable && tableData.length > 0) {
        renderTable(doc, tableData)
      }

      doc.moveDown(2)

      doc.fontSize(9).font("Helvetica").text(
        "This document is a statement of account generated from LogHub systems. For questions, contact support.",
        { align: "center" }
      )

      doc.end()

      stream.on("finish", () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(pdfBuffer)
      })

      stream.on("error", (err) => {
        reject(err)
      })

      doc.on("error", (err) => {
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })
}

function extractStructuredData(content: string): string {
  const lines = content.split("\n")
  const structuredLines: string[] = []
  let captureMode = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes("|") && trimmed.includes("---")) {
      captureMode = true
      structuredLines.push(line)
      continue
    }

    if (captureMode) {
      if (trimmed.includes("|")) {
        structuredLines.push(line)
      } else if (trimmed === "") {
        structuredLines.push("")
      } else {
        captureMode = false
      }
    }
  }

  return structuredLines.join("\n")
}

function cleanCellData(cell: string): string {
  let cleaned = cell

  cleaned = cleaned.replace(/EUR|€/g, "").trim()

  cleaned = cleaned.replace(/ \//g, ",")

  if (/\d+,\d+/.test(cleaned) && !cleaned.match(/\d+\.\d{2}/)) {
    if (/\d+,\d{3,}/.test(cleaned)) {
      cleaned = cleaned.replace(/,(\d{3})([^0-9]|$)/, ",$1") 
    }
  }

  if (/\d+\.\d{2}/.test(cleaned)) {
    if (!cleaned.includes("EUR") && !cleaned.includes("€")) {
      cleaned = cleaned.trim() + " EUR"
    }
  }

  return cleaned
}

function renderTable(doc: any, rows: string[][]): void {
  if (rows.length === 0) return

  const pageWidth = 545
  const margin = 20
  const colWidth = (pageWidth - margin * 2) / Math.max(...rows.map((r) => r.length))

  const headerRow = rows[0]
  let x = margin + 50
  let y = doc.y

  headerRow.forEach((cell) => {
    doc.fontSize(9).font("Helvetica-Bold").text(cell, x, y, {
      width: colWidth - 5,
      ellipsis: true,
    })
    x += colWidth
  })

  doc.moveDown(0.8)

  rows.slice(1).forEach((row) => {
    x = margin + 50
    y = doc.y

    row.forEach((cell) => {
      doc.fontSize(9).font("Helvetica").text(cell, x, y, {
        width: colWidth - 5,
        ellipsis: true,
      })
      x += colWidth
    })

    doc.moveDown(0.6)
  })

  doc.moveDown(0.3)
}

export function generateFilename(companyName: string, title: string): string {
  const sanitized = `${companyName}_${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")

  const timestamp = new Date().toISOString().slice(0, 10)
  return `${sanitized}_${timestamp}.pdf`
}
