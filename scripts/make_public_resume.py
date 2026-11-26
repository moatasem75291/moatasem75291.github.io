"""Generate the public, searchable, two-page CV from verified experience."""
import json
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

import reportlab
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate

INK = HexColor("#172722")
TEAL = HexColor("#08685D")
MUTED = HexColor("#465C55")
RULE = HexColor("#C5D8D0")
LEFT = 42
SITE = "https://moatasem75291.github.io"
PAGE_WIDTH, PAGE_HEIGHT = A4


def build_resume(root: Path) -> None:
    fonts = Path(reportlab.__file__).parent / "fonts"
    pdfmetrics.registerFont(TTFont("Resume", str(fonts / "Vera.ttf")))
    pdfmetrics.registerFont(TTFont("Resume-Bold", str(fonts / "VeraBd.ttf")))
    pdfmetrics.registerFontFamily("Resume", normal="Resume", bold="Resume-Bold")

    profile = json.loads((root / "content/profile.json").read_text(encoding="utf-8"))
    cases = json.loads((root / "content/projects.json").read_text(encoding="utf-8"))
    government = next(project for project in cases if project["id"] == "mof-rag")
    benchmark = next(metric for metric in government["metrics"] if metric["name"] == "Set B")
    name = profile["name"]
    styles = {
        "title": ParagraphStyle("CV title", fontName="Resume-Bold", fontSize=29, leading=33, textColor=INK),
        "role": ParagraphStyle("CV role", fontName="Resume-Bold", fontSize=12, leading=16, textColor=TEAL, spaceAfter=6),
        "links": ParagraphStyle("CV links", fontName="Resume", fontSize=9.7, leading=13.5, textColor=MUTED),
        "section": ParagraphStyle("CV section", fontName="Resume-Bold", fontSize=10.5, leading=14, textColor=TEAL, spaceBefore=14, spaceAfter=5, keepWithNext=True),
        "entry": ParagraphStyle("CV entry", fontName="Resume-Bold", fontSize=11, leading=14.5, textColor=INK, spaceBefore=6, spaceAfter=2, keepWithNext=True),
        "body": ParagraphStyle("CV body", fontName="Resume", fontSize=10, leading=13.9, textColor=INK, spaceAfter=3.5),
        "bullet": ParagraphStyle("CV bullet", fontName="Resume", fontSize=10, leading=13.9, textColor=INK, leftIndent=11, bulletIndent=1, spaceAfter=2.5),
    }
    story = []

    def paragraph(text, style="body"):
        return Paragraph(text, styles[style])

    def link(label, target):
        return f'<link href={quoteattr(target)} color="#08685D"><u>{escape(label)}</u></link>'

    def section(title):
        story.append(paragraph(title.upper(), "section"))

    def entry(title, *bullets, context="", case=None):
        heading = escape(title)
        if context:
            heading += ' <font name="Resume" color="#465C55"> | ' + escape(context) + '</font>'
        if case:
            heading += ' <font size="9"> | ' + link("Case study", SITE + "/work/" + case + "/") + '</font>'
        story.append(KeepTogether([paragraph(heading, "entry"), *[
            Paragraph(text, styles["bullet"], bulletText="•") for text in bullets
        ]]))

    story.extend([
        paragraph(escape(name), "title"),
        paragraph("Data Scientist / AI Engineer / Systems Builder", "role"),
        paragraph("Egypt" + (" &nbsp;|&nbsp; " + link(profile["email"], "mailto:" + profile["email"]) if profile["email"] else ""), "links"),
        paragraph(" &nbsp;|&nbsp; ".join([
            link("Portfolio", SITE),
            link("linkedin.com/in/mo3tsm2212", profile["linkedin"]),
            link("github.com/moatasem75291", profile["github"]),
        ]), "links"),
    ])

    section("Profile")
    story.append(paragraph(
        "Data Scientist at Tazkarti with full-stack AI engineering experience in Arabic and English NLP, "
        "document retrieval, identity verification, and asynchronous inference. I work across the system "
        "lifecycle, including data ingestion, model evaluation, API design, deployment, and observability."
    ))

    section("Professional experience")
    entry(
        "Data Scientist / Tazkarti",
        "Research and prototype analytics platforms, comparing warehouse and lakehouse designs and defining how raw, cleaned, and business-ready data move through Medallion layers.",
        "Develop batch and change data capture (CDC) prototypes with PostgreSQL, Airflow, Debezium, Kafka, and S3-compatible SeaweedFS. Build dbt transformation models and validation checks and document orchestration and replay considerations.",
        context="Nov 2026 - Present",
    )
    entry(
        "Full-Stack Data Scientist / Fixed Solutions",
        "Developed services for bilingual question answering, Arabic document analysis, healthcare information extraction, and digital identity verification.",
        "Implemented model adapters, FastAPI services, and structured output validation. Connected inference to databases, object storage, queues, and review interfaces.",
        "Hardened RAG ingestion with PDF quality checks, serialized concurrent updates, and deferred index replacement so a failed update preserves previously indexed documents. Added service metrics, logs, and dashboards.",
        context="Jan 2025 - Nov 2026",
    )
    entry(
        "Data Science Mentor / Mentors of Data Science",
        "Mentored more than 20 aspiring data scientists through practical machine learning, NLP, and computer vision sessions and projects.",
        context="Apr 2024 - Jan 2025",
    )

    section("Selected projects")
    entry(
        "Ministry of Finance Intelligent RAG",
        "Worked on Arabic document ingestion across scanned and digital PDFs. Routed low-quality text to OCR, preserved source and page metadata, and evaluated an embedding retrieval and cross-encoder reranking pipeline.",
        "Prototyped graph extraction and entity resolution with Neo4j and reviewed whether generated answers cited the required evidence and handled out-of-corpus questions.",
        f"One {benchmark['sample']}-question benchmark measured {benchmark['recall']:.1%} mean Recall@K, "
        f"{benchmark['mrr']:.3f} mean reciprocal rank, and {benchmark['hit']:.1%} full evidence hits. "
        "Multi-source questions were evaluated separately.",
        case="mof-rag",
    )
    entry(
        "Modern Data Platform & Lakehouse Research",
        "Prototyped Airflow batch ingestion and a Debezium/Kafka change stream, with SeaweedFS storage, dbt transformations, and validation across Bronze, Silver, and Gold layers.",
        "Evaluated warehouse and lakehouse trade-offs and researched Apache Iceberg catalog options. Investigated orchestration and data quality failures during testing.",
        case="lakehouse",
    )

    story.append(PageBreak())
    story.append(paragraph(escape(name), "title"))
    story.append(paragraph("AI systems, platform work &amp; technical skills", "role"))

    section("Selected projects continued")
    entry(
        "Electronic Know Your Customer Platform",
        "Implemented customer and session validation, face cropping and object storage integration, and React/Next.js interfaces for capture and case review. Worked across OCR, face matching, and liveness stages.",
        "Supported asynchronous job workflows using FastAPI, RabbitMQ, and Redis. Instrumented HTTP, database, gRPC, storage, and queue operations with Prometheus and built Grafana dashboards with correlated, PII-masked audit logs.",
        case="ekyc",
    )
    entry(
        "Electricity Customer Support Chatbot",
        "Worked on FastAPI and Rasa services deployed on Kubernetes through Rancher. Investigated deployment failures, analyzed exported MongoDB conversation histories, and worked on per-user session context and live-agent escalation.",
        case="eehc-chatbot",
    )
    entry(
        "Bilingual Retrieval and GraphRAG",
        "Built a retrieve-rerank-generate workflow for Arabic and English FAQs using embedding retrieval, a local BGE cross-encoder, and grounded answers. Added resumable evaluation and human-audit sampling to inspect false matches.",
        "Prototyped PDF-to-graph ingestion with GLiNER, relation extraction, and Neo4j. Applied bilingual normalization, entity deduplication, embedding-based resolution, and ingestion checkpoints.",
        case="research",
    )
    entry(
        "Medical LLM Platform & OpenEMR Integration",
        "Built a FastAPI backend with interchangeable Gemini, Hugging Face MedGemma, and Ollama adapters. Validated structured extraction for five medical data domains with Pydantic and integrated OpenEMR using OAuth2/JWT and FHIR resource builders.",
    )

    section("Technical skills")
    skills = [
        ("Languages &amp; interfaces", "Python, SQL, TypeScript, JavaScript, React, Next.js, Streamlit"),
        ("Applied AI &amp; NLP", "RAG, GraphRAG, Arabic NLP, OCR, embeddings, cross-encoder reranking, GLiNER, PyTorch, Hugging Face, evaluation"),
        ("Data engineering &amp; storage", "Airflow, Kafka, Debezium, dbt, PostgreSQL, MongoDB, Neo4j, Qdrant, MinIO, SeaweedFS"),
        ("Backend &amp; operations", "FastAPI, Pydantic, asyncio, OAuth2/JWT, RabbitMQ, Redis, Docker, Kubernetes, Rancher, Prometheus, Grafana"),
    ]
    for category, values in skills:
        story.append(paragraph(f"<b>{category}</b> &nbsp; {escape(values)}"))

    section("Education & languages")
    story.append(paragraph("<b>BSc Computer Science</b> | Helwan University, Cairo | 2020 - 2024"))
    story.append(paragraph("<b>Languages</b> | Arabic and English"))

    def page_frame(canvas, document):
        canvas.setStrokeColor(RULE)
        canvas.line(LEFT, 40, PAGE_WIDTH - LEFT, 40)
        canvas.setFillColor(MUTED)
        canvas.setFont("Resume", 9)
        canvas.drawString(LEFT, 25, "Moatasem Mohammed | Curriculum Vitae")
        canvas.drawRightString(PAGE_WIDTH - LEFT, 25, str(document.page))
        canvas.setStrokeColor(TEAL)
        canvas.setLineWidth(2.3)
        canvas.line(LEFT, PAGE_HEIGHT - 28, LEFT + 27, PAGE_HEIGHT - 28)

    document = SimpleDocTemplate(
        str(root / "public/resume.pdf"), pagesize=A4, leftMargin=LEFT, rightMargin=LEFT,
        topMargin=37, bottomMargin=50, title=name + " | Curriculum Vitae",
        author=name, subject="Experience, engineering projects, skills, and education", invariant=True,
    )
    document.build(story, onFirstPage=page_frame, onLaterPages=page_frame)


if __name__ == "__main__":
    build_resume(Path(__file__).resolve().parents[1])
