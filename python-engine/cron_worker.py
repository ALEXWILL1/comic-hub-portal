import time
import asyncio
import logging
from pipeline import run_pipeline_for_chapter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [CronWorker] %(message)s")
logger = logging.getLogger("CronWorker")

CHECK_INTERVAL_HOURS = 3

async def check_and_execute():
    logger.info("Scanning target comic source for newly released chapters...")
    mock_new_chapter = {
        "slug": "solo-leveling-ragnarok",
        "title": "Solo Leveling: Ragnarok",
        "ch_num": 14.0,
        "ch_title": "Pertarungan di Dungeon Bayangan",
        "pages": [
            "https://picsum.photos/800/1200",
            "https://picsum.photos/800/1200"
        ]
    }
    
    await run_pipeline_for_chapter(
        mock_new_chapter["slug"],
        mock_new_chapter["title"],
        mock_new_chapter["ch_num"],
        mock_new_chapter["ch_title"],
        mock_new_chapter["pages"]
    )

def main():
    logger.info(f"Cron Worker started. Running interval: every {CHECK_INTERVAL_HOURS} hours.")
    while True:
        try:
            asyncio.run(check_and_execute())
        except Exception as e:
            logger.error(f"Error executing scheduled pipeline: {e}")
        time.sleep(CHECK_INTERVAL_HOURS * 3600)

if __name__ == "__main__":
    main()
