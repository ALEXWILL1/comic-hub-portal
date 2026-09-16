import os
import io
import asyncio
import logging
import aiohttp
import boto3
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from openai import AsyncOpenAI
import psycopg2
from psycopg2.extras import RealDictCursor
from paddleocr import PaddleOCR
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ComicPipeline")

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT_URL"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
)
ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)

async def translate_text(raw_text: str) -> str:
    if not raw_text.strip():
        return ""
    try:
        response = await openai_client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert comic/webtoon localizer. Translate the foreign dialogue into natural, "
                        "expressive Bahasa Indonesia. Keep sound effects concise. Return ONLY the translated Indonesian string."
                    )
                },
                {"role": "user", "content": raw_text}
            ],
            temperature=0.3,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI Translation error: {e}")
        return raw_text

def get_dominant_bg_color(img_cv, box):
    pts = np.array(box, dtype=np.int32)
    x_min, y_min = np.min(pts, axis=0)
    x_max, y_max = np.max(pts, axis=0)
    h, w = img_cv.shape[:2]
    
    x1, y1 = max(0, x_min - 4), max(0, y_min - 4)
    x2, y2 = min(w, x_max + 4), min(h, y_max + 4)
    roi = img_cv[y1:y2, x1:x2]
    
    if roi.size == 0:
        return (255, 255, 255)
    border_pixels = np.concatenate([roi[0, :], roi[-1, :], roi[:, 0], roi[:, -1]], axis=0)
    mean_bgr = np.median(border_pixels, axis=0)
    return (int(mean_bgr[2]), int(mean_bgr[1]), int(mean_bgr[0]))

def render_typeset(image_pil: Image.Image, box, text: str, bg_color: tuple) -> Image.Image:
    draw = ImageDraw.Draw(image_pil)
    pts = [tuple(p) for p in box]
    
    # Inpainting: hapus teks asli menggunakan background dominan
    draw.polygon(pts, fill=bg_color)
    
    xs = [p[0] for p in box]
    ys = [p[1] for p in box]
    box_w = max(xs) - min(xs)
    box_h = max(ys) - min(ys)
    box_cx = min(xs) + box_w / 2
    box_cy = min(ys) + box_h / 2
    
    font_size = max(11, int(box_h * 0.22))
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    words = text.split()
    lines = []
    curr = []
    for w in words:
        test_line = " ".join(curr + [w])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if (bbox[2] - bbox[0]) <= max(box_w * 0.9, 40):
            curr.append(w)
        else:
            if curr:
                lines.append(" ".join(curr))
            curr = [w]
    if curr:
        lines.append(" ".join(curr))
        
    line_spacing = 4
    total_text_h = sum([draw.textbbox((0, 0), l, font=font)[3] - draw.textbbox((0, 0), l, font=font)[1] for l in lines]) + (len(lines) - 1) * line_spacing
    cur_y = box_cy - (total_text_h / 2)
    
    text_color = (0, 0, 0) if sum(bg_color) / 3 > 128 else (255, 255, 255)
    for l in lines:
        tb = draw.textbbox((0, 0), l, font=font)
        lw = tb[2] - tb[0]
        lh = tb[3] - tb[1]
        draw.text((box_cx - (lw / 2), cur_y), l, fill=text_color, font=font)
        cur_y += lh + line_spacing

    return image_pil

async def process_single_page(session: aiohttp.ClientSession, page_url: str, comic_slug: str, ch_num: float, page_idx: int) -> dict:
    try:
        async with session.get(page_url) as resp:
            if resp.status != 200:
                raise Exception(f"Failed to download image {page_url}, status: {resp.status}")
            raw_bytes = await resp.read()

        img_np = np.frombuffer(raw_bytes, np.uint8)
        img_cv = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        img_pil = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        
        result = ocr_engine.ocr(img_cv, cls=True)
        if result and result[0]:
            for line in result[0]:
                box = line[0]
                text = line[1][0]
                translated = await translate_text(text)
                bg_color = get_dominant_bg_color(img_cv, box)
                img_pil = render_typeset(img_pil, box, translated, bg_color)

        output_buffer = io.BytesIO()
        img_pil.save(output_buffer, format="WEBP", quality=85)
        output_buffer.seek(0)
        
        r2_key = f"comics/{comic_slug}/ch_{ch_num}/page_{page_idx}.webp"
        s3_client.put_object(
            Bucket=os.getenv("R2_BUCKET_NAME"),
            Key=r2_key,
            Body=output_buffer,
            ContentType="image/webp"
        )
        
        public_url = f"{os.getenv('R2_PUBLIC_DOMAIN')}/{r2_key}"
        return {"page_number": page_idx, "image_url": public_url, "width": img_pil.width, "height": img_pil.height}
    except Exception as e:
        logger.error(f"Error processing page {page_idx} ({page_url}): {e}")
        return None

async def run_pipeline_for_chapter(comic_slug: str, comic_title: str, ch_num: float, ch_title: str, raw_page_urls: list):
    logger.info(f"Starting Chapter {ch_num} for {comic_title} with {len(raw_page_urls)} pages...")
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO comics (title, slug, cover_url, description)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
        RETURNING id;
    """, (comic_title, comic_slug, raw_page_urls[0], f"Baca komik {comic_title} Bahasa Indonesia."))
    comic_id = cur.fetchone()["id"]

    cur.execute("""
        INSERT INTO chapters (comic_id, chapter_number, title)
        VALUES (%s, %s, %s)
        ON CONFLICT (comic_id, chapter_number) DO UPDATE SET title = EXCLUDED.title
        RETURNING id;
    """, (comic_id, ch_num, ch_title))
    chapter_id = cur.fetchone()["id"]
    conn.commit()

    async with aiohttp.ClientSession() as session:
        tasks = [
            process_single_page(session, url, comic_slug, ch_num, idx + 1)
            for idx, url in enumerate(raw_page_urls)
        ]
        pages_result = await asyncio.gather(*tasks)

    for p in pages_result:
        if p:
            cur.execute("""
                INSERT INTO pages (chapter_id, page_number, image_url, width, height)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (chapter_id, page_number) DO UPDATE 
                SET image_url = EXCLUDED.image_url, width = EXCLUDED.width, height = EXCLUDED.height;
            """, (chapter_id, p["page_number"], p["image_url"], p["width"], p["height"]))

    conn.commit()
    cur.close()
    conn.close()
    logger.info(f"Successfully processed & synced Chapter {ch_num} ({comic_title})")
