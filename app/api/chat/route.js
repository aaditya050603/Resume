import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req) {
  const { messages } = await req.json();

  // Define the system prompt for the resume-building assistant
  const systemPrompt = {
    role: 'system',
    content: `You are an expert resume-building assistant. Your goal is to help the user create a professional and effective resume.
    Start by greeting the user and asking for their full name. Then, ask for their contact information (email, phone, LinkedIn profile).
    After that, guide them through the following sections one by one:
    1.  Professional Summary/Objective
    2.  Work Experience (Job Title, Company, Dates, Responsibilities/Achievements)
    3.  Education (Degree, University, Graduation Date)
    4.  Skills (Technical and Soft skills)
    5.  Projects (if applicable)
    Ask clear, one-at-a-time questions. Be friendly, encouraging, and professional.
    Once you have gathered all the information, offer to format it into a clean, text-based resume layout.
    IMPORTANT: When you provide the final formatted resume, you MUST wrap the entire resume text within [RESUME_START] and [RESUME_END] tags.`,
  };

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [systemPrompt, ...messages],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
