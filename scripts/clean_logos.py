import cv2
import numpy as np

def process_event_logo():
    # Load 3rd event logo
    img = cv2.imread('public/infinix-event-logo.png', cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Event logo not found!")
        return

    h, w, c = img.shape
    if c == 3:
        b, g, r = cv2.split(img)
        a = np.ones((h, w), dtype=np.uint8) * 255
    else:
        b, g, r, a = cv2.split(img)

    # Calculate brightness / darkness to remove dark background box
    # The background is dark navy/black (r < 35, g < 40, b < 50)
    dark_mask = (r < 35) & (g < 45) & (b < 60)
    
    # Smooth alpha transition around emblem edges
    alpha = np.ones((h, w), dtype=np.uint8) * 255
    alpha[dark_mask] = 0
    
    # Feather / anti-alias mask edges using Gaussian Blur on alpha
    alpha_blurred = cv2.GaussianBlur(alpha, (5, 5), 0)

    clean_bgra = cv2.merge((b, g, r, alpha_blurred))
    cv2.imwrite('public/infinix-event-logo-clean.png', clean_bgra)
    print("Successfully created transparent event logo public/infinix-event-logo-clean.png!")

def process_institutional_logos():
    # Process RIT Logo
    rit = cv2.imread('public/rit-logo.png', cv2.IMREAD_UNCHANGED)
    if rit is not None:
        h, w, _ = rit.shape
        b, g, r = cv2.split(rit[:h, :w, :3])
        # White background mask
        white_mask = (r > 235) & (g > 235) & (b > 235)
        a = np.ones((h, w), dtype=np.uint8) * 255
        a[white_mask] = 0
        a_blurred = cv2.GaussianBlur(a, (3, 3), 0)
        cv2.imwrite('public/rit-logo-clean.png', cv2.merge((b, g, r, a_blurred)))

    # Process IEI Logo
    iei = cv2.imread('public/iei-logo.png', cv2.IMREAD_UNCHANGED)
    if iei is not None:
        h, w, _ = iei.shape
        b, g, r = cv2.split(iei[:h, :w, :3])
        # White background mask
        white_mask = (r > 235) & (g > 235) & (b > 235)
        a = np.ones((h, w), dtype=np.uint8) * 255
        a[white_mask] = 0
        a_blurred = cv2.GaussianBlur(a, (3, 3), 0)
        cv2.imwrite('public/iei-logo-clean.png', cv2.merge((b, g, r, a_blurred)))

    print("Processed RIT and IEI institutional logos cleanly!")

if __name__ == '__main__':
    process_event_logo()
    process_institutional_logos()
