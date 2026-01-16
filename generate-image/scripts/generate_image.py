#!/usr/bin/env python3
"""
Generate images using ModelScope API with Z-Image-Turbo model.

This script uses ModelScope's async API to generate high-quality images.
The Z-Image-Turbo model is fast and produces excellent results.
"""

import sys
import time
import argparse
from pathlib import Path
from typing import Optional


MODELSCOPE_BASE_URL = "https://api-inference.modelscope.cn"
CREATE_TASK_ENDPOINT = f"{MODELSCOPE_BASE_URL}/v1/images/generations"
DEFAULT_MODEL = "Tongyi-MAI/Z-Image-Turbo"


def check_env_file() -> Optional[str]:
    """Check if .env file exists and contains MODELSCOPE_API_KEY."""
    current_dir = Path.cwd()
    for parent in [current_dir] + list(current_dir.parents):
        env_file = parent / ".env"
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('MODELSCOPE_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                        if api_key:
                            return api_key
    return None


def create_image_task(
    prompt: str,
    api_key: str,
    model: str = DEFAULT_MODEL,
    width: int = 1024,
    height: int = 1024,
    negative_prompt: str = "",
    count: int = 1
) -> str:
    """Create an async image generation task and return task_id."""
    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not found. Install with: pip install requests")
        sys.exit(1)

    body = {
        "model": model,
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "size": f"{width}x{height}",
        "n": count,
    }

    response = requests.post(
        CREATE_TASK_ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "X-ModelScope-Async-Mode": "true",
        },
        json=body
    )

    if response.status_code != 200:
        print(f"❌ API Error ({response.status_code}): {response.text}")
        sys.exit(1)

    data = response.json()
    return data["task_id"]


def query_task_result(task_id: str, api_key: str) -> dict:
    """Query the status and result of a task."""
    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not found. Install with: pip install requests")
        sys.exit(1)

    response = requests.get(
        f"{MODELSCOPE_BASE_URL}/v1/tasks/{task_id}",
        headers={
            "Authorization": f"Bearer {api_key}",
            "X-ModelScope-Task-Type": "image_generation",
        }
    )

    if response.status_code != 200:
        print(f"❌ Query Error ({response.status_code}): {response.text}")
        sys.exit(1)

    return response.json()


def wait_for_completion(
    task_id: str,
    api_key: str,
    max_attempts: int = 60,
    interval_sec: float = 3.0
) -> dict:
    """Poll until task completes or fails."""
    for attempt in range(max_attempts):
        result = query_task_result(task_id, api_key)
        status = result.get("task_status", "UNKNOWN")

        if status == "SUCCEED":
            return result

        if status == "FAILED":
            error_msg = result.get("error_message", "Unknown error")
            print(f"❌ Task failed: {error_msg}")
            sys.exit(1)

        print(f"⏳ Status: {status} (attempt {attempt + 1}/{max_attempts})")
        time.sleep(interval_sec)

    print(f"❌ Task timed out after {max_attempts} attempts")
    sys.exit(1)


def download_image(url: str, output_path: str) -> None:
    """Download image from URL and save to file."""
    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not found. Install with: pip install requests")
        sys.exit(1)

    response = requests.get(url)
    if response.status_code != 200:
        print(f"❌ Download failed ({response.status_code})")
        sys.exit(1)

    with open(output_path, 'wb') as f:
        f.write(response.content)


def generate_image(
    prompt: str,
    model: str = DEFAULT_MODEL,
    output_path: str = "generated_image.png",
    api_key: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    negative_prompt: str = "",
) -> dict:
    """
    Generate an image using ModelScope API.

    Args:
        prompt: Text description of the image to generate
        model: ModelScope model ID (default: Tongyi-MAI/Z-Image-Turbo)
        output_path: Path to save the generated image
        api_key: ModelScope API key (will check .env if not provided)
        width: Image width (default: 1024)
        height: Image height (default: 1024)
        negative_prompt: Things to avoid in the image

    Returns:
        dict: Task result from ModelScope API
    """
    # Check for API key
    if not api_key:
        api_key = check_env_file()

    if not api_key:
        print("❌ Error: MODELSCOPE_API_KEY not found!")
        print("\nPlease create a .env file in your project directory with:")
        print("MODELSCOPE_API_KEY=your-api-key-here")
        print("\nOr set the environment variable:")
        print("export MODELSCOPE_API_KEY=your-api-key-here")
        print("\nGet your API key from: https://modelscope.cn/my/myaccesstoken")
        sys.exit(1)

    print(f"🎨 Generating image with model: {model}")
    print(f"📝 Prompt: {prompt}")
    if negative_prompt:
        print(f"🚫 Negative: {negative_prompt}")
    print(f"📐 Size: {width}x{height}")

    # Create task
    task_id = create_image_task(
        prompt=prompt,
        api_key=api_key,
        model=model,
        width=width,
        height=height,
        negative_prompt=negative_prompt,
    )
    print(f"📋 Task created: {task_id}")

    # Wait for completion
    result = wait_for_completion(task_id, api_key)

    # Download and save images
    output_images = result.get("output_images", [])
    if not output_images:
        print("⚠️ No images in response")
        return result

    # Save the first image
    image_url = output_images[0]
    download_image(image_url, output_path)
    print(f"✅ Image saved to: {output_path}")

    # If multiple images, save them too
    if len(output_images) > 1:
        base = Path(output_path)
        for i, url in enumerate(output_images[1:], start=2):
            extra_path = base.parent / f"{base.stem}_{i}{base.suffix}"
            download_image(url, str(extra_path))
            print(f"✅ Image saved to: {extra_path}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Generate images using ModelScope API (Z-Image-Turbo)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate with default model (Z-Image-Turbo)
  python generate_image.py "A beautiful sunset over mountains"

  # Specify output path
  python generate_image.py "Abstract art" --output my_image.png

  # Custom size
  python generate_image.py "A cat in space" --width 1280 --height 720

  # With negative prompt
  python generate_image.py "A serene landscape" --negative "people, text, watermark"

Available models:
  - Tongyi-MAI/Z-Image-Turbo (default, fast, high quality)
        """
    )

    parser.add_argument(
        "prompt",
        type=str,
        help="Text description of the image to generate"
    )

    parser.add_argument(
        "--model", "-m",
        type=str,
        default=DEFAULT_MODEL,
        help=f"ModelScope model ID (default: {DEFAULT_MODEL})"
    )

    parser.add_argument(
        "--output", "-o",
        type=str,
        default="generated_image.png",
        help="Output file path (default: generated_image.png)"
    )

    parser.add_argument(
        "--width", "-W",
        type=int,
        default=1024,
        help="Image width (default: 1024)"
    )

    parser.add_argument(
        "--height", "-H",
        type=int,
        default=1024,
        help="Image height (default: 1024)"
    )

    parser.add_argument(
        "--negative", "-n",
        type=str,
        default="",
        help="Negative prompt (things to avoid)"
    )

    parser.add_argument(
        "--api-key",
        type=str,
        help="ModelScope API key (will check .env if not provided)"
    )

    args = parser.parse_args()

    generate_image(
        prompt=args.prompt,
        model=args.model,
        output_path=args.output,
        api_key=args.api_key,
        width=args.width,
        height=args.height,
        negative_prompt=args.negative,
    )


if __name__ == "__main__":
    main()
