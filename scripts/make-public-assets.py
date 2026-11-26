"""Rebuild the public résumé and typographic social preview."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

public = Path("public")
dark = "#10201d"
teal = "#08685d"
resume = canvas.Canvas(str(public / "resume.pdf"), pagesize=A4, invariant=True)
resume.setTitle("Moatasem Mohammed | Public résumé")
resume.setAuthor("Moatasem Mohammed")

def line(text, x, y, bold=False, size=10, color=dark):
    resume.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    resume.setFillColor(HexColor(color))
    resume.drawString(x, y, text)

def section(title, y):
    line(title, 43, y, True, 10, teal)
    resume.setStrokeColor(HexColor("#c6d5cd"))
    resume.line(43, y - 7, 550, y - 7)

line("MOATASEM MOHAMMED", 43, 779, True, 26)
line("Data Scientist  /  AI Engineer  /  Systems Builder", 43, 755, True, 12, teal)
line("Egypt  |  linkedin.com/in/mo3tsm2212  |  github.com/moatasem75291", 43, 734)
resume.linkURL("https://www.linkedin.com/in/mo3tsm2212", (81, 730, 214, 745), relative=0)
resume.linkURL("https://github.com/moatasem75291", (222, 730, 396, 745), relative=0)
section("PROFILE", 707)
line("Builds applied AI systems for Arabic and English document intelligence, retrieval, and verification.", 43, 684)
line("Works across model evaluation, data pipelines, API development, and production observability.", 43, 669)
section("EXPERIENCE", 640)
line("Data Scientist  /  Tazkarti", 43, 616, True, 12)
line("Nov 2026 - Present", 43, 600, False, 10, teal)
line("Research and prototype batch and CDC pipelines, dbt transformations, and data validation.", 43, 584)
line("Compare warehouse and lakehouse approaches for analytics workloads.", 43, 569)
line("Full-Stack Data Scientist  /  Fixed Solutions", 43, 543, True, 12)
line("Jan 2025 - Nov 2026", 43, 527, False, 10, teal)
line("Developed AI services for bilingual question answering, Arabic documents and identity verification.", 43, 511)
line("Integrated inference with APIs, databases and storage. Added metrics and operational dashboards.", 43, 496)
line("Data Science Mentor  /  Mentors of Data Science", 43, 470, True, 12)
line("Apr 2024 - Jan 2025", 43, 454, False, 10, teal)
line("Mentored aspiring data scientists through applied machine learning, NLP and vision projects.", 43, 438)
section("SELECTED WORK", 406)
line("Government document RAG", 43, 381, True)
line("Arabic PDF ingestion, OCR, semantic retrieval, reranking, and retrieval and answer evaluation.", 43, 365)
line("Electricity customer support chatbot", 43, 341, True)
line("FastAPI and Rasa, conversation analytics, session context, and Rancher troubleshooting.", 43, 325)
line("Electronic Know Your Customer", 43, 301, True)
line("Identity capture, asynchronous verification, Prometheus instrumentation, and Grafana dashboards.", 43, 285)
section("TECHNICAL TOOLKIT", 255)
line("Python, SQL, TypeScript, FastAPI, React, Next.js, RabbitMQ, Redis, PostgreSQL, MongoDB, Neo4j", 43, 231)
line("Airflow, Kafka, Debezium, dbt, S3-compatible storage, Docker, Kubernetes, Prometheus, Grafana", 43, 216)
section("EDUCATION & LANGUAGES", 185)
line("BSc Computer Science  /  Helwan University, 2020-2024", 43, 161, True)
line("Arabic and English", 43, 145)
resume.showPage()
resume.save()

image = Image.new("RGB", (1200, 630), "#0b0f10")
pen = ImageDraw.Draw(image)
for x in range(680, 1200, 32):
    pen.line((x, 0, x, 630), fill="#172626")
for y in range(0, 630, 32):
    pen.line((680, y, 1200, y), fill="#172626")
for radius in (55, 100, 155, 215):
    pen.ellipse((948-radius, 305-radius, 948+radius, 305+radius), outline="#29514d", width=1)
points = [(991,145),(1088,242),(1102,392),(951,466),(805,383),(814,231)]
for index, (x, y) in enumerate(points):
    pen.line((948,305,x,y), fill="#64aa9c", width=2)
    pen.line((x,y,*points[(index+1)%len(points)]), fill="#335652", width=1)
    pen.ellipse((x-6,y-6,x+6,y+6), fill="#83efdf" if index%2 == 0 else "#c3acff")
pen.polygon([(948,263),(990,305),(948,347),(906,305)], outline="#83efdf", width=2)
def font(size, bold=False):
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans" + ("-Bold" if bold else "") + ".ttf", size)
pen.text((67,94), "THE INTELLIGENCE ARCHITECT", font=font(21), fill="#83efdf")
pen.text((65,177), "From intelligence", font=font(62, True), fill="#edf3ef")
pen.text((65,248), "to infrastructure.", font=font(61, True), fill="#83efdf")
pen.text((69,388), "MOATASEM MOHAMMED", font=font(23, True), fill="#edf3ef")
pen.text((69,433), "Data Scientist · AI Engineer · Systems Builder", font=font(22), fill="#a5b4b2")
image.save(public / "social.png", optimize=True)
