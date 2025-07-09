import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

app = FastAPI()

class CompanyRequest(BaseModel):
    company: str

# For resume evaluation
class ResumeRequest(BaseModel):
    company: str
    resume: dict

# Define the state schema as a Pydantic model
class StateSchema(BaseModel):
    company: str
    result: str = ""

def call_perplexity(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "search_mode": "academic",
        "web_search_options": {"search_context_size": "low"}
    }
    response = requests.post(PERPLEXITY_API_URL, json=data, headers=headers)
    if not response.ok:
        print("Perplexity API error:", response.status_code, response.text)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"].get("content", "")
    print("Perplexity content:", content)
    return content or ""

# Use Perplexity to get company qualifications

def fetch_company_qualifications(company: str) -> str:
    prompt = (
        f"List the typical job qualification requirements for a software engineer at {company}. "
        "Format the requirements as Markdown. For each section, start the header with an icon (e.g., 📝 **Education**), "
        "and list each requirement under it as a Markdown bullet (using -). Do NOT use plain text or paragraphs for the requirements—use only Markdown bullets for each item. "
        "Do NOT include any reference citations like [1], [2], etc. at the end of sentences or paragraphs."
    )
    return call_perplexity(prompt)

# LangGraph agent for sources (now: Basic Info)
sources_graph = StateGraph(state_schema=StateSchema)
def sources_node(state):
    company = state.company
    prompt = (
        f"Provide the most important and basic factual information about the company: {company}. "
        "Include details such as headquarters location, founding year, founders, industry, number of employees, website, and a brief description. "
        "Format the response as clear, concise bullet points or short paragraphs. Do not include technology or jobs information here. "
        "Do NOT include any reference citations like [1], [2], etc. at the end of sentences or paragraphs."
    )
    return {"result": call_perplexity(prompt)}
sources_graph.add_node("sources", RunnableLambda(sources_node))
sources_graph.set_entry_point("sources")
sources_agent = sources_graph.compile()

# LangGraph agent for important info (now: Technology & Jobs Info)
info_graph = StateGraph(state_schema=StateSchema)
def info_node(state):
    company = state.company
    prompt = (
        f"Describe the technology stack, digital transformation initiatives, and job opportunities at {company}. "
        "Include information about major software, platforms, cloud services, and any notable tech projects or digital strategies. "
        "Also summarize the types of jobs and roles the company hires for, and any unique aspects of their work culture or hiring process. "
        "Structure the response into the following Markdown sections:\n\n"
        "## 🖥️ Technology Stack\n"
        "- List the main programming languages, frameworks, databases, tools, and platforms the company uses.\n"
        "- Mention any notable cloud service providers (e.g., AWS, Azure, GCP).\n"
        "- Highlight major digital transformation projects or tech innovations (AI, IoT, DevOps, etc.).\n\n"
        "## 💼 Job Opportunities\n"
        "- List the typical roles the company hires for (e.g., software engineer, data scientist, DevOps, etc.).\n"
        "- Mention common job functions or departments.\n"
        "- Note any unique aspects of their hiring process or candidate expectations (e.g., coding assessments, emphasis on culture fit).\n"
        "- Describe the work culture briefly if relevant.\n\n"
        "Use bullet points within each section where appropriate. Do not include unrelated company background—focus only on tech and hiring-related info. "
        "Do not summarize the company, just provide the information. "
        "Do NOT include any reference citations like [1], [2], etc. at the end of sentences or paragraphs."
    )
    return {"result": call_perplexity(prompt)}
info_graph.add_node("info", RunnableLambda(info_node))
info_graph.set_entry_point("info")
info_agent = info_graph.compile()
    
# LangGraph agent for summary (now: Summary at the end)
summary_graph = StateGraph(state_schema=StateSchema)
def summary_node(state):
    company = state.company
    prompt = (
        f"Write a concise summary (3–5 sentences) about {company}. "
        "The summary should:\n"
        "- Highlight what makes the company stand out in its industry (e.g., innovation, market leadership, unique value proposition).\n"
        "- Mention recent achievements, growth milestones, or major strategic shifts.\n"
        "- Include any notable partnerships, product innovations, or global expansions.\n"
        "- Conclude with key takeaways for someone researching the company (e.g., strengths, reputation, or direction).\n"
        "Write in a professional yet readable tone suitable for an investor or job candidate. "
        "Do NOT include any reference citations like [1], [2], etc. at the end of sentences or paragraphs."
    )
    return {"result": call_perplexity(prompt)}
summary_graph.add_node("summary", RunnableLambda(summary_node))
summary_graph.set_entry_point("summary")
summary_agent = summary_graph.compile()

@app.post("/ai-company-sources")
async def ai_company_sources(req: CompanyRequest):
    if not req.company:
        raise HTTPException(status_code=400, detail="Company name is required")
    try:
        result = sources_agent.invoke({"company": req.company})
        print("Returning sources:", result["result"])
        return {"company": req.company, "sources": result["result"] or ""}
    except Exception as e:
        print("ERROR in /ai-company-sources:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai-company-info")
async def ai_company_info(req: CompanyRequest):
    if not req.company:
        raise HTTPException(status_code=400, detail="Company name is required")
    try:
        result = info_agent.invoke({"company": req.company})
        info_text = result["result"] or ""
        print("Returning info:", info_text)
        return {"company": req.company, "info": info_text}
    except Exception as e:
        print("ERROR in /ai-company-info:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai-company-summary")
async def ai_company_summary(req: CompanyRequest):
    if not req.company:
        raise HTTPException(status_code=400, detail="Company name is required")
    try:
        result = summary_agent.invoke({"company": req.company})
        print("Returning summary:", result["result"])
        return {"company": req.company, "summary": result["result"] or ""}
    except Exception as e:
        print("ERROR in /ai-company-summary:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai-resume-evaluate")
async def ai_resume_evaluate(req: ResumeRequest):
    if not req.company or not req.resume:
        raise HTTPException(status_code=400, detail="Company and resume are required")
    try:
        # 1. Get company requirements using Perplexity
        qualifications = fetch_company_qualifications(req.company)
        # 2. Ask AI to rate the resume
        resume_text = str(req.resume)
        rating_prompt = (
            f"Given the following job requirements for {req.company}:\n{qualifications}\n"
            f"And this candidate's resume: {resume_text}\n"
            "What is the percentage chance (0-100%) that this candidate would pass the CV screening round? "
            "Just return a number and a short explanation. "
            "Do NOT include any reference citations like [1], [2], etc. at the end of sentences or paragraphs."
        )
        rating_result = call_perplexity(rating_prompt)
        # 3. Ask AI for suggestions
        advice_prompt = (
            f"Given the following job requirements for {req.company}:\n{qualifications}\n"
            f"And this candidate's resume: {resume_text}\n"
            "Write the top 3 improvements or revisions the candidate should make to increase their chances "
            f"of passing the CV round for a role at {req.company}, using the following format:\n\n"

            "## 💡 Tips: Top 3 Improvements for the Resume\n\n"

            "### 1. [Title of Improvement]\n"
            "**Why:** Explain why this change is critical for the target role.\n"
            "**How to Improve:**\n"
            "- Break down the improvement into clear, actionable bullet points.\n"
            "- Include a realistic example using bullet points only (no paragraphs, no tables, no code blocks).\n"
            "- Every example item must be its own bullet point.\n\n"

            "### 2. [Title of Improvement]\n"
            "**Why:** Explain the relevance to the company’s expectations.\n"
            "**How to Improve:**\n"
            "- Use concise and specific improvement actions.\n"
            "- Add a bullet-point example showing how to implement the change.\n\n"

            "### 3. [Title of Improvement]\n"
            "**Why:** Explain what’s currently missing and how it impacts CV screening.\n"
            "**How to Improve:**\n"
            "- Describe measurable or structural additions.\n"
            "- Provide an example with bullet points.\n\n"

            "### Summary of Suggested Revisions\n"
            "- **Improvement:** [Summarized Title]\n"
            "  - **What to Add or Change:** [Concise guidance]\n"
            "  - **Example:** [One or more bullet points only]\n\n"

            "Use Markdown headings, bold text, and bullet points for structure. "
            "Do NOT use tables, HTML tags, code blocks, or paragraph-based examples."
        )

        advice_result = call_perplexity(advice_prompt)
        return {
            "company": req.company,
            "qualifications": qualifications,
            "rating": rating_result,
            "advice": advice_result
        }
    except Exception as e:
        print("ERROR in /ai-resume-evaluate:", e)
        raise HTTPException(status_code=500, detail=str(e))

# To run: uvicorn backend.ai_agents:app --reload --port 8000
