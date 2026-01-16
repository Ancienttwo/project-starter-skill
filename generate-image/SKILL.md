---
name: generate-image
description: Generate images using ModelScope Z-Image-Turbo. Use for general-purpose image generation including photos, illustrations, artwork, visual assets, concept art, and any image that isn't a technical diagram or schematic. For flowcharts, circuits, pathways, and technical diagrams, use the scientific-schematics skill instead.
---

# Generate Image

Generate high-quality images using ModelScope's Z-Image-Turbo model.

## When to Use This Skill

**Use generate-image for:**
- Photos and photorealistic images
- Artistic illustrations and artwork
- Concept art and visual concepts
- Visual assets for presentations or documents
- Any general-purpose image generation needs

**Use scientific-schematics instead for:**
- Flowcharts and process diagrams
- Circuit diagrams and electrical schematics
- Biological pathways and signaling cascades
- System architecture diagrams
- CONSORT diagrams and methodology flowcharts
- Any technical/schematic diagrams

## Quick Start

Use the `scripts/generate_image.py` script to generate images:

```bash
# Generate a new image
python scripts/generate_image.py "A beautiful sunset over mountains"

# Custom output path
python scripts/generate_image.py "Abstract art" --output artwork.png

# Custom size
python scripts/generate_image.py "A cat in space" --width 1280 --height 720
```

This generates an image and saves it as `generated_image.png` in the current directory.

## API Key Setup

**CRITICAL**: The script requires a ModelScope API key. Before running, check if the user has configured their API key:

1. Look for a `.env` file in the project directory or parent directories
2. Check for `MODELSCOPE_API_KEY=<key>` in the `.env` file
3. If not found, inform the user they need to:
   - Create a `.env` file with `MODELSCOPE_API_KEY=your-api-key-here`
   - Or set the environment variable: `export MODELSCOPE_API_KEY=your-api-key-here`
   - Get an API key from: https://modelscope.cn/my/myaccesstoken

The script will automatically detect the `.env` file and provide clear error messages if the API key is missing.

## Model

**Default model**: `Tongyi-MAI/Z-Image-Turbo`

Z-Image-Turbo is fast and produces high-quality images. It's the recommended model for most use cases.

## Common Usage Patterns

### Basic generation
```bash
python scripts/generate_image.py "Your prompt here"
```

### Custom output path
```bash
python scripts/generate_image.py "Abstract art" --output artwork.png
```

### Custom dimensions
```bash
python scripts/generate_image.py "A landscape scene" --width 1920 --height 1080
```

### With negative prompt
```bash
python scripts/generate_image.py "A serene forest" --negative "people, text, watermark, blurry"
```

### Multiple images
Run the script multiple times with different prompts or output paths:
```bash
python scripts/generate_image.py "Image 1 description" --output image1.png
python scripts/generate_image.py "Image 2 description" --output image2.png
```

## Script Parameters

- `prompt` (required): Text description of the image to generate
- `--model` or `-m`: ModelScope model ID (default: Tongyi-MAI/Z-Image-Turbo)
- `--output` or `-o`: Output file path (default: generated_image.png)
- `--width` or `-W`: Image width in pixels (default: 1024)
- `--height` or `-H`: Image height in pixels (default: 1024)
- `--negative` or `-n`: Negative prompt (things to avoid in the image)
- `--api-key`: ModelScope API key (overrides .env file)

## Example Use Cases

### For Scientific Documents
```bash
# Generate a conceptual illustration for a paper
python scripts/generate_image.py "Microscopic view of cancer cells being attacked by immunotherapy agents, scientific illustration style" --output figures/immunotherapy_concept.png

# Create a visual for a presentation
python scripts/generate_image.py "DNA double helix structure with highlighted mutation site, modern scientific visualization" --output slides/dna_mutation.png
```

### For Presentations and Posters
```bash
# Title slide background
python scripts/generate_image.py "Abstract blue and white background with subtle molecular patterns, professional presentation style" --output slides/background.png

# Poster hero image
python scripts/generate_image.py "Laboratory setting with modern equipment, photorealistic, well-lit" --output poster/hero.png
```

### For General Visual Content
```bash
# Website or documentation images
python scripts/generate_image.py "Professional team collaboration around a digital whiteboard, modern office" --output docs/team_collaboration.png

# Marketing materials
python scripts/generate_image.py "Futuristic AI brain concept with glowing neural networks" --output marketing/ai_concept.png
```

## Error Handling

The script provides clear error messages for:
- Missing API key (with setup instructions)
- API errors (with status codes)
- Task failures (with error messages)
- Timeouts (after 60 polling attempts)
- Missing dependencies (requests library)

If the script fails, read the error message and address the issue before retrying.

## Notes

- The ModelScope API is async: tasks are submitted and then polled for completion
- Generation typically takes 5-30 seconds depending on complexity
- Images are downloaded from URLs and saved as PNG files
- The script supports custom dimensions via --width and --height flags
- Use negative prompts to avoid unwanted elements in the generated image

## Integration with Other Skills

- **scientific-schematics**: Use for technical diagrams, flowcharts, circuits, pathways
- **generate-image**: Use for photos, illustrations, artwork, visual concepts
- **scientific-slides**: Combine with generate-image for visually rich presentations
- **latex-posters**: Use generate-image for poster visuals and hero images
