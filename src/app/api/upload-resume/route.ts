export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"
import pdfParse from "pdf-parse"

// Simple PDF text extraction using basic PDF structure parsing
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text.trim()
}

// Generate insights using AI or fallback to word frequency
async function generateInsights(
  text: string,
  filename = "",
): Promise<{
  summary?: string
  topWords?: string[]
  type: "ai_summary" | "word_frequency"
}> {
  try {
    const apiKey = process.env.SARVAM_API_KEY

    if (apiKey && text.trim().length > 0) {
      // Extract name from filename if possible
      const nameFromFile = filename
        .replace(/[_-]/g, " ")
        .replace(/\.pdf$/i, "")
        .replace(/resume/i, "")
        .trim()

      const enhancedPrompt = `
You are a professional resume analyzer. Please analyze the following resume and provide a clean, well-structured summary without using markdown formatting, asterisks, or bullet points.

${nameFromFile ? `Note: The candidate's name appears to be: ${nameFromFile}` : ""}

Format your response as follows:

PROFESSIONAL SUMMARY:
[Write a 2-3 sentence overview of the candidate]

KEY SKILLS:
[List the main technical and soft skills in a flowing paragraph]

EXPERIENCE HIGHLIGHTS:
[Summarize the work experience in 2-3 sentences, mentioning key roles and achievements]

EDUCATION:
[Mention the educational background briefly]

CAREER LEVEL:
[Indicate if they are entry-level, mid-level, senior, or expert based on experience]

Please write in a professional, clean format without any special characters, markdown, or formatting symbols.

Resume to analyze:
${text}
`

      const requestBody = {
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        model: "sarvam-m",
      }

      const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const data = await response.json()
        let summary = data.choices?.[0]?.message?.content

        if (summary && summary.trim().length > 0) {
          // Clean up the summary by removing markdown formatting
          summary = summary
            .replace(/\*\*/g, "") // Remove bold markdown
            .replace(/\*/g, "") // Remove italic markdown
            .replace(/#{1,6}\s/g, "") // Remove headers
            .replace(/`{1,3}/g, "") // Remove code blocks
            .replace(/^\s*[-•]\s*/gm, "") // Remove bullet points at start of lines
            .trim()

          return {
            summary: summary,
            type: "ai_summary",
          }
        }
      }
    }

    throw new Error("AI processing failed")
  } catch (error) {
    console.error(error)
    // Fallback: Get top 5 most frequent words
    const topWords = getTopFrequentWords(text, 5)
    return {
      topWords,
      type: "word_frequency",
    }
  }
}

function getTopFrequentWords(text: string, count: number): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter((word) => !isCommonWord(word))

  const wordCount: { [key: string]: number } = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word)
}

function isCommonWord(word: string): boolean {
  const commonWords = [
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "had",
    "her",
    "was",
    "one",
    "our",
    "out",
    "day",
    "get",
    "has",
    "him",
    "his",
    "how",
    "its",
    "may",
    "new",
    "now",
    "old",
    "see",
    "two",
    "who",
    "boy",
    "did",
    "she",
    "use",
    "way",
    "will",
    "with",
    "have",
    "this",
    "that",
    "from",
    "they",
    "know",
    "want",
    "been",
    "good",
    "much",
    "some",
    "time",
    "very",
    "when",
    "come",
    "here",
    "just",
    "like",
    "long",
    "make",
    "many",
    "over",
    "such",
    "take",
    "than",
    "them",
    "well",
    "were",
  ]
  return commonWords.includes(word)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveInsight(insight: any): Promise<void> {
  const dataDir = path.join(process.cwd(), "data")
  const dbPath = path.join(dataDir, "insights.json")

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let insights: any[] = []

  if (existsSync(dbPath)) {
    try {
      const data = await readFile(dbPath, "utf-8")
      insights = JSON.parse(data)
    } catch (error) {
      console.error("Error reading insights database:", error)
    }
  }

  insights.push(insight)
  await writeFile(dbPath, JSON.stringify(insights, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("resume") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF buffer using custom parser
    const extractedText = await extractTextFromPDFBuffer(buffer)

    // Create uploads directory and save file for record keeping
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileId = crypto.randomUUID()
    const fileName = `${fileId}-${file.name}`
    const filePath = path.join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Generate insights with filename context
    const insights = await generateInsights(extractedText, file.name)

    // Save insight
    const insightData = {
      id: fileId,
      filename: file.name,
      uploadDate: new Date().toISOString(),
      ...insights,
    }

    await saveInsight(insightData)

    return NextResponse.json(insightData)
  } catch (error) {
    console.error("Upload route error:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
