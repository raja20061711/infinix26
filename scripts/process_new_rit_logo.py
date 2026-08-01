import cv2
import numpy as np

def process_new_rit():
    input_path = 'public/logo new rit.png'
    output_path = 'public/logo-new-rit-clean.png'
    
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Failed to read logo new rit.png")
        return
        
    h, w, c = img.shape
    print(f"Dimensions: {w}x{h}, Channels: {c}")
    
    if c == 3:
        b, g, r = cv2.split(img)
        a = np.ones((h, w), dtype=np.uint8) * 255
    else:
        b, g, r, a = cv2.split(img)
        
    # Mask out pure white background pixels (r > 240, g > 240, b > 240)
    white_mask = (r > 240) & (g > 240) & (b > 240)
    a[white_mask] = 0
    
    # Smooth alpha edges with Gaussian Blur
    a_blurred = cv2.GaussianBlur(a, (3, 3), 0)
    
    clean_bgra = cv2.merge((b, g, r, a_blurred))
    cv2.imwrite(output_path, clean_bgra)
    print("Successfully created public/logo-new-rit-clean.png!")

if __name__ == '__main__':
    process_new_rit()
