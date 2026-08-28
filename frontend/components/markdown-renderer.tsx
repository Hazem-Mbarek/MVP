"use client"

import { useMemo } from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const elements = useMemo(() => {
    const parts: React.ReactNode[] = []
    const lines = content.split("\n")
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Check if this is a markdown table
      if (line.includes("|") && i + 1 < lines.length && lines[i + 1].includes("|")) {
        // Look for separator line
        const nextLine = lines[i + 1]
        if (nextLine.match(/^\s*\|\s*(-+\s*\|)+\s*$/)) {
          // Parse table
          const headerLine = line.split("|").map((cell) => cell.trim()).filter((cell) => cell)
          const rows: string[][] = []

          i += 2 // Skip header and separator
          while (i < lines.length && lines[i].includes("|")) {
            const cells = lines[i]
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell)
            if (cells.length === headerLine.length) {
              rows.push(cells)
            }
            i++
          }

          // Add table element
          parts.push(
            <div key={`table-${parts.length}`} className="my-4 overflow-x-auto rounded border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {headerLine.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left font-semibold text-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-2 text-muted-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          continue
        }
      }

      // Check if it's a bold heading (markdown style)
      if (line.includes("**") || line.startsWith("##")) {
        const cleanLine = line
          .replace(/^#+\s*/, "")
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
        if (cleanLine.trim()) {
          parts.push(
            <p key={`heading-${parts.length}`} className="my-3 font-semibold text-foreground">
              {cleanLine}
            </p>
          )
        }
        i++
        continue
      }

      // Regular paragraph
      if (line.trim()) {
        // Parse inline formatting
        const formattedLine = parseInlineFormatting(line)
        parts.push(
          <p key={`text-${parts.length}`} className="leading-relaxed text-muted-foreground">
            {formattedLine}
          </p>
        )
      }

      i++
    }

    return parts
  }, [content])

  return <div className="space-y-2">{elements}</div>
}

function parseInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Match bold (**text**), italic (*text*), and codes
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|【([^】]+)】/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      )
    } else if (match[2]) {
      // Italic
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-foreground">
          {match[2]}
        </em>
      )
    } else if (match[3]) {
      // Code
      parts.push(
        <code
          key={`code-${match.index}`}
          className="rounded bg-muted/50 px-1 py-0.5 font-mono text-xs text-muted-foreground"
        >
          {match[3]}
        </code>
      )
    } else if (match[4]) {
      // Citation (【text】)
      parts.push(
        <span
          key={`citation-${match.index}`}
          className="rounded border border-blue-500/30 bg-blue-500/10 px-1 py-0.5 font-mono text-xs text-blue-600"
        >
          {match[4]}
        </span>
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
