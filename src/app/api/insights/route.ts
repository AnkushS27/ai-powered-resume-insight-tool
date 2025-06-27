export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInsights(): Promise<any[]> {
  const dbPath = path.join("/tmp", "data", "insights.json")

  if (!existsSync(dbPath)) {
    return []
  }

  try {
    const { readFile } = await import("fs/promises")
    const data = await readFile(dbPath, "utf-8")
    const insights = JSON.parse(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return insights.sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
  } catch (error) {
    console.error("Error reading insights database:", error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInsightById(id: string): Promise<any | null> {
  const insights = await getInsights()
  return insights.find((insight) => insight.id === id) || null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const insight = await getInsightById(id)
      if (!insight) {
        return NextResponse.json({ error: "Insight not found" }, { status: 404 })
      }
      return NextResponse.json(insight)
    } else {
      const insights = await getInsights()
      return NextResponse.json(insights)
    }
  } catch (error) {
    console.error("Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}
