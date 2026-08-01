import os
import cv2
import numpy as np

def extract_frames():
    video_path = os.path.join('public', 'ocean.mp4')
    output_dir = os.path.join('public', 'frames')
    
    os.makedirs(output_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total frames in video: {total_frames}")
    
    target_count = 150
    indices = np.linspace(0, total_frames - 1, target_count, dtype=int)
    
    saved_count = 0
    current_idx = 0
    target_set = set(indices)
    
    # We map position to 1-indexed filename: frame_001.webp to frame_150.webp
    index_map = {idx: i + 1 for i, idx in enumerate(indices)}
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if current_idx in target_set:
            frame_num = index_map[current_idx]
            filename = f"frame_{frame_num:03d}.webp"
            filepath = os.path.join(output_dir, filename)
            
            # Save frame as optimized WebP with quality 82
            cv2.imwrite(filepath, frame, [cv2.IMWRITE_WEBP_QUALITY, 82])
            saved_count += 1
            
        current_idx += 1
        
    cap.release()
    print(f"Successfully extracted and saved {saved_count} frames to {output_dir}")

if __name__ == '__main__':
    extract_frames()
