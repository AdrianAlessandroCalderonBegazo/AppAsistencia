#!/usr/bin/env python3
"""Genera los íconos de Android/iOS/web a partir del logo fuente (ICO ICR_Mesa de trabajo 1.png).
Uso: python3 scripts/generate_icons.py
Se ejecuta una sola vez al cambiar el logo; no forma parte del build.
"""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(BASE, "assets/branding/logo_source.png")

src = Image.open(SOURCE).convert("RGBA")

# Aplana sobre blanco (los íconos de iOS no pueden llevar canal alfa) y recorta el
# espacio en blanco alrededor del wordmark para que se vea grande y legible en el
# ícono — el archivo original tiene mucho margen porque está pensado como logo, no
# como ícono cuadrado.
flat = Image.new("RGB", src.size, "white")
flat.paste(src, mask=src.split()[-1])

gray = flat.convert("L")
# Umbral generoso: cualquier pixel notablemente distinto de blanco puro cuenta como arte.
bbox = gray.point(lambda p: 255 if p < 250 else 0).getbbox()
content = flat.crop(bbox)

# Cuadra el recorte (con margen de respiro) sobre un lienzo blanco cuadrado, centrado.
w, h = content.size
side = int(max(w, h) * 1.18)
canvas = Image.new("RGB", (side, side), "white")
canvas.paste(content, ((side - w) // 2, (side - h) // 2))


def save(im, path, size):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    resized = im.resize((size, size), Image.LANCZOS)
    resized.save(path, "PNG")
    print(f"  {path}  ({size}x{size})")


print("Android (mipmap):")
android_res = os.path.join(BASE, "android/app/src/main/res")
for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
    save(canvas, os.path.join(android_res, f"mipmap-{density}/ic_launcher.png"), size)

print("iOS (AppIcon.appiconset):")
ios_set = os.path.join(BASE, "ios/Runner/Assets.xcassets/AppIcon.appiconset")
ios_sizes = {
    "Icon-App-20x20@1x.png": 20,
    "Icon-App-20x20@2x.png": 40,
    "Icon-App-20x20@3x.png": 60,
    "Icon-App-29x29@1x.png": 29,
    "Icon-App-29x29@2x.png": 58,
    "Icon-App-29x29@3x.png": 87,
    "Icon-App-40x40@1x.png": 40,
    "Icon-App-40x40@2x.png": 80,
    "Icon-App-40x40@3x.png": 120,
    "Icon-App-60x60@2x.png": 120,
    "Icon-App-60x60@3x.png": 180,
    "Icon-App-76x76@1x.png": 76,
    "Icon-App-76x76@2x.png": 152,
    "Icon-App-83.5x83.5@2x.png": 167,
    "Icon-App-1024x1024@1x.png": 1024,
}
for filename, size in ios_sizes.items():
    save(canvas, os.path.join(ios_set, filename), size)

print("Web (PWA):")
web_dir = os.path.join(BASE, "web")
save(canvas, os.path.join(web_dir, "favicon.png"), 32)
save(canvas, os.path.join(web_dir, "icons/Icon-192.png"), 192)
save(canvas, os.path.join(web_dir, "icons/Icon-512.png"), 512)

# Los "maskable" necesitan más respiro (zona segura circular del ~80%): se arma un
# lienzo aparte con más margen en vez de reusar el recorte "canvas" ajustado.
maskable_side = int(max(w, h) * 1.6)
maskable = Image.new("RGB", (maskable_side, maskable_side), "white")
maskable.paste(content, ((maskable_side - w) // 2, (maskable_side - h) // 2))
save(maskable, os.path.join(web_dir, "icons/Icon-maskable-192.png"), 192)
save(maskable, os.path.join(web_dir, "icons/Icon-maskable-512.png"), 512)

print("Listo.")
