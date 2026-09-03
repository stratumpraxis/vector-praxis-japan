from PIL import Image, ImageDraw, ImageFont
import math
import os
import subprocess

W, H = 720, 1280
FPS = 30
SCENE_SECONDS = 5
OUT_DIR = "build/social-video"
MEDIA_DIR = "public/media"
OUT_PATH = f"{MEDIA_DIR}/vector-praxis-completion-layer.mp4"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(MEDIA_DIR, exist_ok=True)

FONT_SANS = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
FONT_SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc"
FONT_SERIF_BOLD = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"


def font(path, size):
    return ImageFont.truetype(path, size)


def fit(draw, text, max_width, size=60, minimum=34, path=FONT_SERIF_BOLD):
    while size >= minimum:
        f = font(path, size)
        box = draw.multiline_textbbox((0, 0), text, font=f, spacing=16)
        if box[2] - box[0] <= max_width:
            return f
        size -= 2
    return font(path, minimum)


def draw_network(draw, seed):
    hub_x, hub_y = int(W * 0.73), int(H * 0.43)
    for i in range(14):
        y0 = int(H * (0.18 + i * 0.038))
        y1 = int(H * (0.22 + ((i * 37 + seed * 19) % 100) / 100 * 0.55))
        pts = [
            (int(W * 0.42), y0),
            (int(W * 0.58), int((y0 + hub_y) / 2)),
            (hub_x, hub_y),
            (int(W * 0.88), int((hub_y + y1) / 2)),
            (W + 20, y1),
        ]
        draw.line(pts, fill=(122, 130, 142), width=1)
    for r in (3, 6, 10):
        shade = 230 if r == 3 else 170
        draw.ellipse((hub_x-r, hub_y-r, hub_x+r, hub_y+r), fill=(shade, shade, shade))
    for i in range(7):
        y = int(H * (0.17 + i * 0.09))
        x = int(W * (0.82 + (i % 2) * 0.04))
        draw.ellipse((x-4, y-4, x+4, y+4), fill=(205, 210, 218))


def make_scene(i, accent, title, subtitle):
    img = Image.new("RGB", (W, H), (5, 6, 8))
    draw = ImageDraw.Draw(img)
    # subtle grid
    for x in range(0, W, 72):
        draw.line((x, 0, x, H), fill=(10, 12, 15), width=1)
    for y in range(0, H, 80):
        draw.line((0, y, W, y), fill=(10, 12, 15), width=1)
    draw_network(draw, i + 1)

    draw.rounded_rectangle((46, 48, 270, 94), radius=14, outline=(156, 163, 173), width=1)
    draw.text((62, 57), "VECTOR PRAXIS", font=font(FONT_SERIF, 20), fill=(222, 226, 232))
    draw.text((46, 150), accent, font=font(FONT_SERIF, 24), fill=(160, 168, 180))
    draw.line((46, 194, W-46, 194), fill=(72, 78, 88), width=1)

    title_font = fit(draw, title, W - 92, 64, 38, FONT_SERIF_BOLD)
    draw.multiline_text((46, 310), title, font=title_font, fill=(242, 244, 247), spacing=16)

    if subtitle:
        sub_font = fit(draw, subtitle, W - 92, 34, 25, FONT_SANS)
        draw.multiline_text((46, 650), subtitle, font=sub_font, fill=(177, 184, 194), spacing=12)

    draw.line((46, H-150, W-46, H-150), fill=(85, 92, 102), width=1)
    progress = int((i + 1) / 8 * (W - 92))
    draw.line((46, H-150, 46+progress, H-150), fill=(228, 232, 238), width=3)
    draw.text((46, H-118), "Completion Layer / Human Gap", font=font(FONT_SERIF, 18), fill=(143, 150, 160))

    path = f"{OUT_DIR}/scene_{i:02d}.png"
    img.save(path)
    return path


scenes = [
    ("HOOK", "AIで作るだけでは、\n足りないかもしれない。", "生成そのものより、その“前後”を見る。"),
    ("01 / OUTPUT", "文章。画像。動画。\n生成は、当たり前へ。", "アウトプットが増えるほど、別の摩擦が見えてきます。"),
    ("02 / QUESTION", "次に価値が生まれる\n可能性があるのは、どこか。", "断定ではなく、観察と検証から考える。"),
    ("03 / HUMAN GAP", "AIの前後に残る\n「人間作業」", "コピー / 確認 / 変換 / 投稿 / 送信 / 判断"),
    ("04 / FLOW", "生成 → 接続 → 完了", "AIの出力を、現実の結果までつなぐ。"),
    ("05 / CONCEPT", "Completion Layer", "“AIそのもの”ではなく、仕事を完了させる層。"),
    ("06 / VALIDATION", "Human Gap を見つけ、\n収益機会として評価する。", "評価シート / Completion Layer Score / 7日検証"),
    ("VECTOR PRAXIS", "続きは note で", "AIの前後に残る人間作業を、どう見るか。\nnote.com/deft_eel6718"),
]

paths = [make_scene(i, *scene) for i, scene in enumerate(scenes)]

concat_path = f"{OUT_DIR}/concat.txt"
with open(concat_path, "w", encoding="utf-8") as f:
    for p in paths:
        f.write(f"file '{os.path.abspath(p)}'\n")
        f.write(f"duration {SCENE_SECONDS}\n")
    f.write(f"file '{os.path.abspath(paths[-1])}'\n")

# 40s vertical MP4. Restrained synthetic BGM is generated locally; no copyrighted audio source.
cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0", "-i", concat_path,
    "-f", "lavfi", "-i", "sine=frequency=55:sample_rate=44100:duration=40",
    "-f", "lavfi", "-i", "sine=frequency=82.5:sample_rate=44100:duration=40",
    "-filter_complex",
    "[1:a]volume=0.035[a1];[2:a]volume=0.018[a2];[a1][a2]amix=inputs=2:duration=longest,afade=t=in:st=0:d=1,afade=t=out:st=39:d=1[a]",
    "-map", "0:v:0", "-map", "[a]",
    "-r", str(FPS),
    "-vf", f"scale={W}:{H},format=yuv420p",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-maxrate", "1100k", "-bufsize", "2200k",
    "-c:a", "aac", "-b:a", "96k",
    "-t", "40",
    "-movflags", "+faststart",
    OUT_PATH,
]
subprocess.run(cmd, check=True)
print(OUT_PATH)
