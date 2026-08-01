import os
import cv2
import numpy as np

def remove_watermarks():
    output_dir = os.path.join('public', 'frames')
    if not os.path.exists(output_dir):
        print("Frames directory not found!")
        return

    frame_files = [f for f in os.listdir(output_dir) if f.startswith('frame_') and f.endswith('.webp')]
    frame_files.sort()

    print(f"Processing {len(frame_files)} frame files to remove watermarks/logos...")

    processed_count = 0
    for filename in frame_files:
        filepath = os.path.join(output_dir, filename)
        img = cv2.imread(filepath)
        if img is None:
            continue

        h, w, _ = img.shape

        # Create mask for top-right corner watermark region
        mask = np.zeros((h, w), dtype=np.uint8)
        
        # Top-right watermark box: top 90px, right 220px
        mask[0:90, w-220:w] = 255
        
        # Apply Telea inpainting to seamlessly fill watermark region with surrounding ocean texture
        clean_img = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)

        # Also blend top-right corner smoothly with surrounding pixel color
        cv2.imwrite(filepath, clean_img, [cv2.IMWRITE_WEBP_QUALITY, 85])
        processed_count += 1

    print(f"Successfully cleaned watermarks/logos from {processed_count} WebP frame images!")

if __name__ == '__main__':
    remove_watermarks()
