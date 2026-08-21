"""Build FitTrack's two-frame exercise GIFs from the checked-in sprite sheets.

Requires Pillow. The source sheets are 2 columns (start/end) by 3 rows.
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "source-assets" / "exercise-sprites"
OUTPUT = ROOT / "www" / "assets" / "gifs"
SIZE = (480, 480)

SHEETS = {
    "exec-769474ae-f7fb-4d00-bf75-096b3f5adcd7.png": [
        "incline-db-press", "pec-deck", "cable-crossover"
    ],
    "exec-2a0a4d5a-da6c-4c7d-81c0-e1aa84003731.png": [
        "overhead-press", "lateral-raise", "face-pull"
    ],
    "exec-4f81284c-fa76-4cf9-9edc-b9bc0f60d87d.png": [
        "triceps-pushdown", "dips", "barbell-row"
    ],
    "exec-55509100-cbc7-49d9-880a-5395c12bd045.png": [
        "one-arm-row", "pull-up", "biceps-curl"
    ],
    "exec-3a5b1975-2dba-48f0-862f-55e0a417b362.png": [
        "hammer-curl", "back-squat", "leg-press"
    ],
    "exec-318c2595-fd96-4cfc-a623-9dd3ba8ae6aa.png": [
        "romanian-deadlift", "leg-curl", "leg-extension"
    ],
    "exec-b6e8279e-fcc8-4f80-90d4-7a66e9a49a6f.png": [
        "calf-raise", "hip-thrust", "walking-lunge"
    ],
    "exec-35098b23-4d5f-4c5e-95a1-767b0726b48b.png": [
        "deadlift", "glute-bridge", "plank"
    ],
    "exec-40088d36-613b-4ee4-a20c-06d482c14c7d.png": [
        "crunch", "hanging-leg-raise", "russian-twist"
    ],
    "exec-ae584624-06da-4ee8-8dcc-23d211f5fa16.png": [
        "mountain-climber", "kettlebell-swing", "burpee"
    ],
}


def square_frame(cell: Image.Image) -> Image.Image:
    """Contain a cell in a square without cropping equipment or limbs."""
    cell = cell.convert("RGB")
    cell.thumbnail(SIZE, Image.Resampling.LANCZOS)
    return ImageOps.pad(
        cell,
        SIZE,
        method=Image.Resampling.LANCZOS,
        color=(3, 10, 17),
        centering=(0.5, 0.5),
    )


def build_sheet(source_name: str, exercise_ids: list[str]) -> None:
    source = Image.open(SPRITES / source_name).convert("RGB")
    width, height = source.size
    cell_width = width / 2
    cell_height = height / 3
    for row, exercise_id in enumerate(exercise_ids):
        frames = []
        for column in range(2):
            left = round(column * cell_width) + 2
            top = round(row * cell_height) + 2
            right = round((column + 1) * cell_width) - 2
            bottom = round((row + 1) * cell_height) - 2
            frames.append(square_frame(source.crop((left, top, right, bottom))))
        target = OUTPUT / f"{exercise_id}.gif"
        frames[0].save(
            target,
            save_all=True,
            append_images=[frames[1]],
            duration=[850, 850],
            loop=0,
            optimize=True,
            disposal=2,
        )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, exercise_ids in SHEETS.items():
        build_sheet(source_name, exercise_ids)
    print(f"Built {sum(map(len, SHEETS.values()))} exercise GIFs in {OUTPUT}")


if __name__ == "__main__":
    main()
