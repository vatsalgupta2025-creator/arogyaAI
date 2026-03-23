import os
import glob
import numpy as np
import wfdb
import edfio
from scipy.signal import butter, filtfilt

# Dataset specific
# In the abdominal-and-direct-fetal-ecg-database there are usually 4 abdominal channels and 1 direct fetal ECG channel.
# Fetal QRS complex locations are stored in .qrs files.

def butter_bandpass(lowcut, highcut, fs, order=3):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return b, a

def butter_bandpass_filter(data, lowcut, highcut, fs, order=3):
    b, a = butter_bandpass(lowcut, highcut, fs, order=order)
    y = filtfilt(b, a, data)
    return y

def load_data(data_dir):
    """
    Loads all .edf files and their corresponding .qrs annotations from the dataset directory.
    Returns:
        X: List of numpy arrays (abdominal channels shape: [4, num_samples])
        y: List of numpy arrays (binary mask of fetal QRS peaks, shape: [num_samples])
    """
    edf_files = glob.glob(os.path.join(data_dir, "*.edf"))
    X = []
    y = []
    
    for file in edf_files:
        record_name = file
        
        # Read EDF file using edfio
        print(f"Reading {file}...")
        try:
            edf = edfio.read_edf(file)
        except Exception as e:
            print(f"Failed to read {file}: {e}")
            continue
            
        fs = edf.signals[0].sampling_frequency
        
        # We assume the first 4 channels are abdominal ECG
        signals = np.zeros((4, len(edf.signals[0].data)))
        for i in range(4):
            signals[i, :] = edf.signals[i].data
        
        # Read QRS annotations
        # wfdb rdann expects the record name without extension, e.g., 'r01' and extension 'edf.qrs' maybe?
        # Actually physionet annotations are usually just name, e.g., 'r01' with extension '.qrs'
        base_record = file.replace('.edf', '')
        try:
            # Physionet format uses .edf.qrs in this specific DB
            ann = wfdb.rdann(file, 'qrs')
            peaks = ann.sample
        except Exception as e:
            try:
                # Fallback if wfdb fails: parse binary or just use raw rdann on .edf
                ann = wfdb.rdann(file + '.edf', 'qrs')
                peaks = ann.sample
            except:
                print(f"Skipping {file} - could not read annotations. Error: {e}")
                continue

        # Create binary mask for targets
        seq_len = signals.shape[1]
        target = np.zeros(seq_len)
        # Expand peak to a small window (e.g., +/- 2 samples) to make training easier
        for p in peaks:
            if p < seq_len:
                p_start = max(0, p - 2)
                p_end = min(seq_len, p + 3)
                target[p_start:p_end] = 1.0
                
        # Preprocessing: Bandpass filter abdominal channels (1Hz - 100Hz)
        filtered_signals = np.zeros_like(signals)
        for i in range(4):
            # 1Hz removes baseline wander, 100Hz removes high frequency noise
            filtered_signals[i] = butter_bandpass_filter(signals[i], 1.0, 100.0, fs)
            # Normalize
            filtered_signals[i] = (filtered_signals[i] - np.mean(filtered_signals[i])) / (np.std(filtered_signals[i]) + 1e-8)
            
        X.append(filtered_signals)
        y.append(target)
        
    return X, y

if __name__ == "__main__":
    db_path = r"C:\Users\SAMSUNG\Downloads\abdominal-and-direct-fetal-ecg-database-1.0.0\abdominal-and-direct-fetal-ecg-database-1.0.0"
    print(f"Loading data from {db_path}...")
    X, y = load_data(db_path)
    print(f"Loaded {len(X)} records.")
    if len(X) > 0:
        print(f"Sample features shape: {X[0].shape}")
        print(f"Sample target shape: {y[0].shape}")
        print(f"Total QRS peaks in first record: {np.sum(y[0] > 0) / 5.0}") # Divided by window size=5
