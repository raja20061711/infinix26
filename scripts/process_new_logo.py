import cv2
import numpy as np

def process_event_logo_v2():
    # Load 2nd uploaded high-res event emblem logo
    img = cv2.imread(r'C:\Users\rajak\.gemini\antigravity-ide\brain\fe2d7306-7061-4805-8807-7144165fc8a1\media__1785479022331.png', cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Image not found!")
        return

    h, w, c = img.shape
    if c == 3:
        b, g, r = cv2.split(img)
        a = np.ones((h, w), dtype=np.uint8) * 255
    else:
        b, g, r, a = cv2.split(img)

    # The background is white/light grey (r > 230, g > 230, b > 230)
    white_mask = (r > 230) & (g > 230) & (b > 230)
    
    # Smooth alpha feathering around the metallic emblem edges
    a[white_mask] = 0
    a_blurred = cv2.GaussianBlur(a, (3, 3), 0)

    clean_bgra = cv2.merge((b, g, r, a_blurred))
    cv2.imwrite(r'public\infinix-event-logo-v2-clean.png', clean_bgra)
    print("Successfully created public/infinix-event-logo-v2-clean.png with 100% transparent background!")

if __name__ == '__main__':
    process_event_logo_v2()
