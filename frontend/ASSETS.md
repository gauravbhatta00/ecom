# Campaign assets

## everyday-editorial.png

Saved project path: public/images/everyday-editorial.png
Generation method: built-in image_gen tool (not CLI fallback).
Dimensions: 1536 × 1024.
Purpose: aspirational lifestyle campaign image for the homepage and navigation. It is not presented as a photograph of a specific live SKU.
Original generation was copied into this workspace; the original file was left in place. Next Image produces responsive optimized deliveries.

Final prompt:

> Use case: photorealistic-natural. Asset type: premium lifestyle ecommerce homepage campaign photography, wide 3:2 landscape photograph. Create an original quiet editorial still life in a sunlit minimalist home. An elegant pale oak bench and woven lounge chair, a slouchy natural canvas tote, a folded ivory linen shirt, matte olive-green over-ear headphones resting on a book, small handmade ceramic cup and a branch of olive foliage. Warm limewashed beige walls, rich tactile linen, beautifully natural angled late-afternoon sunlight and architectural shadows. Sophisticated understated lifestyle magazine photography, realistic material texture, spacious balanced composition, warm neutral palette with forest green accents. Main objects centered and right; no people, no text, no logos, no watermark, no UI. This is aspirational campaign imagery, not a specific product catalog photo.

## Existing sample photography

public/images/canvas-backpack.webp, sage-lamp.webp and forest-headphones.webp are copies of existing src/assets/catalog files. They support the labelled sample catalog and campaign moodboard. They are not substituted for missing live product photos.

Live product and category photography comes from Django. Missing or failed product images use an explicit unavailable state. Remote product URLs use Next Image in unoptimized mode to preserve compatibility with configured Django media hosts without opening a wildcard optimization proxy; local campaign/sample imagery uses Next optimization.
