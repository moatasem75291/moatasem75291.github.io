"""Rebuild the public CV and typographic social preview."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from make_public_resume import build_resume

root = Path(__file__).resolve().parents[1]
public = root / "public"
build_resume(root)

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
