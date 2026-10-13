---
book_reference: true
canonical_url: /blog/2026-02-19-building-knowledge-chatbot
date: 02-19-2026
description: How to build a chatbot that captures your knowledge, answers questions
  about your expertise, and helps anyone learn from your experience - all running
  locally with zero API costs.
image: /images/1021019.png
layout: post
og:description: Turn your expertise into an AI chatbot that anyone can query. Learn
  to build a local-first knowledge capture system with Ollama, Chroma, and semantic
  search.
og:image: https://danielkliewer.com/images/1021019.png
og:title: Building a Knowledge-Sharing Chatbot
og:type: article
og:url: https://danielkliewer.com/blog/building-knowledge-chatbot
tags:
- ai
- ollama
- knowledge-transfer
- chatbot
- rag
- python
- local-llm
- vector-database
- expertise-capture
title: 'Building a Knowledge-Sharing Chatbot: Turn Expertise Into an AI That Anyone
  Can Query'
twitter:card: summary_large_image
twitter:description: Capture your expertise and turn it into a queryable AI - no cloud,
  no API costs, complete privacy.
twitter:image: https://danielkliewer.com/images/1021019.png
twitter:title: Build a Chatbot That Knows What You Know
wiki_references: ["embeddings", "knowledge-graphs", "llama3", "local-first-ai", "local-inference", "ollama", "python", "rag", "rlhf", "sentence-transformers"]
---



# Building a Knowledge-Sharing Chatbot: Turn Expertise Into an AI That Anyone Can Query

We all carry knowledge that others need. Whether you're a seasoned manager with institutional history, a technician with troubleshooting tricks learned over decades, or a founder with lessons from a hundred decisions—the problem is the same: **your knowledge is trapped in your head, and it scales poorly.**

You could write documentation, but documentation is static. It doesn't answer follow-up questions. It doesn't adapt to what someone actually needs in the moment. And most people don't read it anyway—they ask you.

What if you could clone the part of yourself that answers questions? Not a generic AI, but one trained on *your* knowledge, *your* processes, *your* edge cases?

That's what I built: a system that captures expertise through guided interviews, transforms it into structured documentation, and delivers a chatbot that anyone can query. The key constraint? Everything runs locally—no cloud APIs, no monthly fees, complete privacy.

## The Real Problem: Knowledge Bottlenecks

Every expert becomes a bottleneck. Here's how it manifests:

**For individuals:**
- You answer the same questions repeatedly
- Your time gets consumed by knowledge transfer instead of high-value work
- When you're unavailable, decisions wait or go wrong

**For organizations:**
- Key person dependency creates risk
- Onboarding takes months instead of weeks
- Hard-won lessons get lost when people leave

**For communities:**
- Expertise remains siloed with a few individuals
- Newcomers struggle to get up to speed
- Knowledge fragments across chat logs, emails, and documents

Traditional solutions don't work well. Wikis go stale. Training videos are passive. Documentation requires people to know what to look for. What people actually want is **conversation**—the ability to ask questions and get answers tailored to their context.

## The Solution: A Knowledge-Capture-to-Chatbot Pipeline

The system I built follows a simple but powerful pipeline:

```
Expert Interview → LLM Structuring → Vector Embeddings → Queryable Chatbot
                                          ↓
                               Unknown Questions → Expert Review
                                          ↓
                               New Knowledge Integrated ←
```

This creates a **learning loop**: the chatbot answers what it knows, flags what it doesn't, and gets smarter over time.

### Why This Approach Works

1. **Interview-based capture**: Experts don't have to write documentation—they just answer questions they already know
2. **LLM structuring**: Raw responses get transformed into organized, readable documentation automatically
3. **Semantic search**: Users ask questions naturally, not with exact keywords
4. **Dynamic learning**: The system improves without manual updates

## The Architecture in Practice

Let me show you how each component works, using real code from the implementation.

### Phase 1: Capturing Expert Knowledge

The first challenge is getting knowledge out of people's heads. Most experts are too busy to write comprehensive documentation, but they'll answer focused questions.

The interview module uses a structured approach:

```python
# Structured interview questions for staff
INTERVIEW_QUESTIONS = [
    "What are the main tasks you do daily?",
    "What mistakes do new hires often make?",
    "Which documents or forms are essential for your role?",
    "Are there any edge cases you frequently encounter?",
    "What advice would you give to someone just starting in this role?"
]

# Keywords that indicate potential edge cases
EDGE_CASE_KEYWORDS = [
    "sometimes", "rarely", "depends", "if", "occasionally",
    "usually", "typically", "in rare cases", "edge case"
]


def detect_edge_cases(response_text: str) -> list:
    """
    Detect potential edge cases based on keywords in the response.
    """
    edge_cases = []
    sentences = response_text.split('. ')
    
    for sentence in sentences:
        sentence_lower = sentence.lower()
        for keyword in EDGE_CASE_KEYWORDS:
            if keyword in sentence_lower:
                edge_cases.append(sentence.strip())
                break
    
    return edge_cases
```

The interview process is deliberately conversational:

```python
def run_staff_interview(staff_name: str, role: str) -> StaffResponse:
    """
    Run an interactive staff interview via console input.
    """
    print(f"\n{'='*50}")
    print(f"Expert Interview: {staff_name} - {role}")
    print(f"{'='*50}\n")
    
    responses = []
    all_edge_cases = []
    
    for question in INTERVIEW_QUESTIONS:
        print(f"Question: {question}")
        answer = input("Answer: ").strip()
        
        if not answer:
            print("  (Skipped - no answer provided)")
            continue
            
        responses.append(f"Q: {question}\nA: {answer}")
        
        # Check for edge cases in the answer
        detected = detect_edge_cases(answer)
        all_edge_cases.extend(detected)
        
        print(f"  ✓ Recorded ({len(detected)} potential edge cases detected)\n")
    
    # Combine all responses into single text
    response_text = "\n\n".join(responses)
    
    # Create and save staff response
    session = get_session()
    staff_response = StaffResponse(
        staff_name=staff_name,
        role=role,
        response_text=response_text,
        edge_cases=all_edge_cases
    )
    session.add(staff_response)
    session.commit()
    
    print(f"\n{'='*50}")
    print(f"Interview complete! {len(all_edge_cases)} edge cases detected.")
    print(f"Responses saved for {staff_name} ({role})")
    print(f"{'='*50}\n")
    
    session.close()
    return staff_response
```

**Key insight**: The questions are designed to surface not just what to do, but *what goes wrong*. Questions about mistakes and edge cases capture the tacit knowledge that never makes it into formal documentation.

### Phase 2: Structuring Knowledge with LLMs

Raw interview responses are valuable but unstructured. The LLM transforms them into coherent documentation:

```python
from db import StaffResponse, SOPDraft, get_session
from llm import generate_text, SOP_GENERATION_PROMPT


def generate_sop(staff_response_id: int) -> SOPDraft:
    """
    Generate an SOP draft from staff responses.
    """
    session = get_session()
    
    # Get staff response
    sr = session.query(StaffResponse).filter_by(id=staff_response_id).first()
    if not sr:
        print(f"Staff response with ID {staff_response_id} not found")
        session.close()
        return None
    
    print(f"Generating SOP for {sr.staff_name} ({sr.role})...")
    
    # Build prompt for SOP generation
    prompt = f"""Create a detailed Standard Operating Procedure (SOP) based on the following staff responses:

{sr.response_text}

Please organize this into a clear, professional SOP with:
1. Role Overview
2. Daily Tasks (step-by-step)
3. Common Mistakes to Avoid
4. Essential Forms/Documents
5. Edge Cases / Special Circumstances
"""
    
    # Generate SOP using Ollama
    sop_text = generate_text(
        prompt=prompt,
        system_prompt=SOP_GENERATION_PROMPT,
        temperature=0.3,
        max_tokens=1500
    )
    
    # Create SOP draft
    sop = SOPDraft(
        role=sr.role,
        sop_text=sop_text,
        metadata={
            "staff_name": sr.staff_name,
            "staff_response_id": sr.id
        }
    )
    
    session.add(sop)
    session.commit()
    
    print(f"SOP generated and saved for role: {sr.role}")
    
    session.close()
    return sop
```

The system prompt guides the LLM to create well-structured output:

```python
SOP_GENERATION_PROMPT = """You are an expert process engineer and technical writer. 
Your task is to create clear, structured Standard Operating Procedures (SOPs) from staff responses.
Create well-organized documents with:
- Clear step-by-step instructions
- Checklists where appropriate
- Common mistakes to avoid
- Essential forms/documents needed
- Any edge cases or special circumstances

Format the output professionally with clear headings."""
```

**Key insight**: Using a low temperature (0.3) for SOP generation keeps the output factual and grounded in the actual expert responses, rather than letting the LLM "creatively" embellish.

### Phase 3: Making Knowledge Searchable

Structured documentation is great, but only if people can find what they need. This is where vector embeddings transform static text into queryable knowledge.

The embedding module handles chunking and storage:

```python
import chromadb
from chromadb.config import Settings
from db import SOPDraft, get_session
from llm import get_embedding


# Chroma client setup
CHROMA_PERSIST_DIR = "./chroma_db"
client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

# Get or create collection
collection = client.get_or_create_collection(
    name="sop_collection",
    metadata={"description": "SOP embeddings for onboarding chatbot"}
)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split text into chunks for embedding.
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            break_point = max(last_period, last_newline)
            if break_point > start:
                chunk = text[start:break_point + 1]
                start = break_point + 1
            else:
                start = end - overlap
        else:
            start = end
        
        chunks.append(chunk.strip())
    
    return chunks
```

**Key insight**: The chunking algorithm tries to break at sentence boundaries. Arbitrary cuts in the middle of sentences create embeddings that lose semantic coherence—breaking at natural boundaries preserves meaning.

The embedding function itself is straightforward:

```python
def embed_sop(sop_id: int) -> bool:
    """
    Embed an SOP into the vector database.
    """
    session = get_session()
    
    sop = session.query(SOPDraft).filter_by(id=sop_id).first()
    if not sop:
        print(f"SOP with ID {sop_id} not found")
        session.close()
        return False
    
    print(f"Embedding SOP for role: {sop.role}")
    
    # Chunk the SOP text
    chunks = chunk_text(sop.sop_text)
    print(f"  Split into {len(chunks)} chunks")
    
    # Get existing IDs to avoid duplicates
    existing_ids = collection.get()["ids"]
    
    # Add each chunk to the collection
    for i, chunk in enumerate(chunks):
        chunk_id = f"{sop_id}_{i}"
        
        if chunk_id in existing_ids:
            continue
        
        embedding = get_embedding(chunk)
        if not embedding:
            print(f"  Warning: Failed to get embedding for chunk {i}")
            continue
        
        collection.add(
            documents=[chunk],
            metadatas=[{
                "sop_id": sop_id,
                "role": sop.role,
                "chunk_index": i,
                "source": "sop"
            }],
            ids=[chunk_id],
            embeddings=[embedding]
        )
    
    print(f"  Embedded {len(chunks)} chunks for role: {sop.role}")
    session.close()
    return True
```

Retrieval is where semantic search shines:

```python
def retrieve_sop_chunks(query: str, n_results: int = 3, role: str = None) -> dict:
    """
    Retrieve relevant SOP chunks for a query.
    """
    query_embedding = get_embedding(query)
    if not query_embedding:
        return {"documents": [], "metadatas": [], "distances": []}
    
    # Build where filter if role specified
    where = {"role": role} if role else None
    
    # Query collection
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where
    )
    
    return results
```

**Key insight**: The `role` parameter enables knowledge domain filtering. If someone is asking about front desk procedures, they shouldn't get maintenance procedures mixed in—even if the topics happen to share keywords.

### Phase 4: The Chatbot Interface

All of this infrastructure culminates in the chatbot—the interface where people actually interact with your knowledge.

```python
import os
import logging
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)

from llm import generate_text, CHATBOT_PROMPT
from embedding import retrieve_sop_chunks
from edge_cases import detect_edge_case, get_simulated_staff_answer

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot configuration
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
DEFAULT_ROLE = "Front Desk"


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    await update.message.reply_text(
        "Welcome to the Knowledge Assistant! 🤖\n\n"
        "I'm here to help you learn about procedures and best practices. "
        "You can ask me questions about:\n"
        "- Daily tasks and procedures\n"
        "- Forms and documents\n"
        "- Common mistakes to avoid\n"
        "- Edge cases and special situations\n\n"
        "Just type your question and I'll do my best to help!"
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages."""
    user_message = update.message.text
    user_id = update.effective_user.id
    
    logger.info(f"Message from {user_id}: {user_message}")
    
    # Get user's role context
    role = context.user_data.get("role", DEFAULT_ROLE)
    
    # Check for edge cases first
    is_edge_case, confidence, chunks = detect_edge_case(user_message, role)
    
    if is_edge_case:
        # Handle as edge case
        await update.message.reply_text(
            "🤔 This is an interesting question that I don't have complete information about. "
            "I've flagged it for expert review."
        )
        
        # Get simulated expert answer for demo
        expert_answer = get_simulated_staff_answer(user_message, role)
        await update.message.reply_text(
            f"💡 Here's what an expert says: {expert_answer}"
        )
        
        logger.info(f"Edge case handled for user {user_id}")
    else:
        # Normal retrieval + generation
        if chunks:
            context_text = "\n\n".join(chunks)
            
            prompt = f"""Based on the following information, answer the user's question:

Reference Information:
{context_text}

User Question: {user_message}

Provide a clear, helpful answer. If the information doesn't fully answer the question, acknowledge that and provide what's available."""
            
            response = generate_text(
                prompt=prompt,
                system_prompt=CHATBOT_PROMPT,
                temperature=0.5,
                max_tokens=500
            )
        else:
            response = (
                "I don't have specific information about that yet. "
                "Would you like me to flag this question for an expert to review?"
            )
        
        await update.message.reply_text(response)
        logger.info(f"Response sent to user {user_id}")
```

**Key insight**: The chatbot uses a higher temperature (0.5) for responses than for SOP generation (0.3). This allows for slightly more conversational responses while still being grounded in the source material.

### Phase 5: The Learning Loop

The most powerful feature is the system's ability to learn from questions it can't answer:

```python
# Similarity threshold for edge case detection
EDGE_CASE_THRESHOLD = 0.7


def detect_edge_case(user_question: str, role: str = None) -> tuple:
    """
    Detect if a question is an edge case (not well answered by existing knowledge).
    """
    from embedding import retrieve_sop_chunks
    
    results = retrieve_sop_chunks(user_question, n_results=3, role=role)
    
    if not results or not results.get("documents"):
        return True, 0.0, []
    
    distances = results.get("distances", [[]])[0]
    
    if not distances:
        return True, 0.0, []
    
    best_distance = min(distances)
    confidence = 1.0 - best_distance
    
    is_edge_case = confidence < EDGE_CASE_THRESHOLD
    
    return is_edge_case, confidence, results.get("documents", [])
```

When an edge case is identified, expert answers get integrated back:

```python
def integrate_edge_case_answer(
    user_question: str,
    expert_answer: str,
    role: str
) -> bool:
    """
    Integrate an expert answer into the knowledge base.
    
    This is the "learning" part of the system - new knowledge gets
    added and becomes available for future queries.
    """
    session = get_session()
    
    # Find existing SOP for this role
    sop = session.query(SOPDraft).filter_by(role=role).first()
    
    if sop:
        # Append new Q&A to existing SOP
        edge_case_text = f"\n\n---\n\nQ: {user_question}\nA: {expert_answer}"
        sop.sop_text += edge_case_text
        session.commit()
        print(f"Updated SOP for role {role} with new knowledge")
    else:
        # Create new SOP if none exists
        sop = SOPDraft(
            role=role,
            sop_text=f"Q: {user_question}\nA: {expert_answer}",
            metadata={"source": "edge_case_integration"}
        )
        session.add(sop)
        session.commit()
        print(f"Created new knowledge base for role {role}")
    
    session.close()
    
    # Add to vector database
    existing = collection.get()
    new_chunk_id = f"edge_case_{len(existing['ids'])}"
    
    combined_text = f"Q: {user_question}\nA: {expert_answer}"
    embedding = get_embedding(combined_text)
    
    if embedding:
        collection.add(
            documents=[combined_text],
            metadatas=[{
                "role": role,
                "source": "edge_case",
                "question": user_question
            }],
            ids=[new_chunk_id],
            embeddings=[embedding]
        )
        print(f"Added knowledge to vector database")
        return True
    
    return False
```

**Key insight**: This creates a self-improving system. Every question that stumps the chatbot becomes a training opportunity. Over time, the system converges toward comprehensive coverage of what people actually ask about.

## The Complete Data Flow

Here's the full lifecycle from interview to query:

### 1. Knowledge Capture
```
Expert answers guided questions
→ System detects potential edge cases automatically
→ Responses stored in database
```

### 2. Knowledge Structuring
```
Raw responses fed to LLM
→ Structured documentation generated
→ Human can review and edit
```

### 3. Knowledge Embedding
```
Documentation split into chunks
→ Each chunk embedded using local model
→ Stored in Chroma vector database
```

### 4. Query Time
```
User asks question naturally
→ Question embedded
→ Semantic search finds relevant chunks
→ LLM generates answer grounded in context
```

### 5. Gap Filling
```
Low confidence answer detected
→ Question flagged for expert
→ Expert provides answer
→ Answer integrated into knowledge base
→ Future queries benefit
```

## Why Local-First Matters

This system runs entirely on your machine. Here's why that matters:

**Privacy**: Your knowledge base might contain proprietary processes, institutional details, or sensitive information. With local LLMs, nothing leaves your infrastructure.

**Cost**: No per-token API charges. No monthly subscription. No surprise bills when your chatbot gets popular.

**Control**: You choose which models to use. You can fine-tune on your data. You own everything.

**Reliability**: No API outages. No rate limits. No dependency on external services.

The LLM wrapper makes this simple:

```python
import requests
import os
from typing import Optional

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_GENERATION_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
DEFAULT_EMBEDDING_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")


def generate_text(
    prompt: str,
    model: str = DEFAULT_GENERATION_MODEL,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000
) -> str:
    """Generate text using local Ollama."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens
        }
    }
    
    if system_prompt:
        payload["system"] = system_prompt
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        return response.json().get("response", "")
    except requests.exceptions.ConnectionError:
        return "Error: Cannot connect to Ollama. Make sure 'ollama serve' is running."


def get_embedding(text: str, model: str = DEFAULT_EMBEDDING_MODEL) -> list:
    """Get text embedding using local Ollama."""
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/embeddings",
            json={"model": model, "prompt": text},
            timeout=30
        )
        response.raise_for_status()
        return response.json().get("embedding", [])
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to Ollama. Make sure 'ollama serve' is running.")
        return []
```

## Use Cases Beyond Onboarding

While I built this for knowledge transfer, the pattern applies broadly:

**Consultants**: Package your methodology into a chatbot clients can query between sessions

**Founders**: Capture decision rationale so new team members understand not just what, but why

**Researchers**: Create a queryable knowledge base from your notes and papers

**Support Teams**: Turn ticket history into a chatbot that answers customer questions

**Craftsmen**: Document techniques and troubleshooting so apprentices can learn independently

**Community Leaders**: Capture institutional knowledge so it survives leadership transitions

## Key Learnings

Building this system taught me:

### 1. Capture Must Be Frictionless
Experts won't write documentation, but they'll answer questions. The interview format is familiar and low-effort.

### 2. LLMs Are Great Structurers
The transformation from raw responses to organized documentation is where LLMs genuinely shine. They handle the tedious work of formatting and organizing.

### 3. Chunking Strategy Makes or Breaks Retrieval
Bad chunking = bad search. Breaking at sentence boundaries and including overlap preserves semantic meaning.

### 4. Edge Cases Are Features, Not Bugs
Every question the system can't answer is an opportunity to improve it. The learning loop is the most valuable part of the architecture.

### 5. Local-First Is Now Practical
Ollama has matured to the point where local LLMs are genuinely useful for production workloads. The quality is good enough, and the trade-offs (privacy, cost, control) often favor local.

### 6. Temperature Settings Matter
Different tasks need different creativity levels. SOP generation needs consistency (0.3), conversational responses need warmth (0.5), creative tasks might want more (0.7+).

## What's Next

This MVP proves the concept. The production version could add:

1. **Web Interface**: Replace Telegram with a web chat for broader accessibility
2. **Multi-Expert Knowledge Bases**: Let multiple experts contribute to the same role
3. **Knowledge Graphs**: Visualize how concepts connect across different domains
4. **Version History**: Track how knowledge evolves over time
5. **Export Formats**: Generate PDFs, wikis, or training videos from the knowledge base
6. **Confidence Calibration**: Help users understand when to trust answers

## Conclusion

The knowledge-sharing chatbot addresses a fundamental problem: expertise doesn't scale, but it can be captured.

The architecture is deliberately simple: interview → structure → embed → query → learn. Each step uses mature, well-understood technologies. What makes it work is the **closed loop**—the system gets smarter with every question it can't answer.

For anyone sitting on valuable knowledge that others need, this pattern offers a path forward. Not a generic AI, but one that knows what you know, answers how you would answer, and improves as it goes.

The future of knowledge transfer isn't better documentation—it's conversation.

![Knowledge Architecture](/images/1021018.png)