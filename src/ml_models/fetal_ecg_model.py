import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np

# Simple 1D CNN for detecting fQRS peaks from 4 abdominal channels
class FetalECGModel(nn.Module):
    def __init__(self, in_channels=4, out_channels=1):
        super(FetalECGModel, self).__init__()
        
        # Encoder
        self.conv1 = nn.Conv1d(in_channels, 16, kernel_size=15, padding=7)
        self.relu1 = nn.ReLU()
        self.pool1 = nn.MaxPool1d(2)
        
        self.conv2 = nn.Conv1d(16, 32, kernel_size=15, padding=7)
        self.relu2 = nn.ReLU()
        self.pool2 = nn.MaxPool1d(2)
        
        # Decoder (Using transposed convolutions to upsample back to original sequence length)
        self.upconv1 = nn.ConvTranspose1d(32, 16, kernel_size=2, stride=2)
        self.relu3 = nn.ReLU()
        
        self.upconv2 = nn.ConvTranspose1d(16, 8, kernel_size=2, stride=2)
        self.relu4 = nn.ReLU()
        
        # Final output layer
        self.final_conv = nn.Conv1d(8, out_channels, kernel_size=1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # x shape: (batch_size, in_channels, seq_len)
        x = self.conv1(x)
        x = self.relu1(x)
        x = self.pool1(x)
        
        x = self.conv2(x)
        x = self.relu2(x)
        x = self.pool2(x)
        
        x = self.upconv1(x)
        x = self.relu3(x)
        
        x = self.upconv2(x)
        x = self.relu4(x)
        
        x = self.final_conv(x)
        x = self.sigmoid(x)
        
        # Output shape should match original seq_len if input seq_len is a multiple of 4
        return x

class FetalECGDataset(Dataset):
    def __init__(self, X, y, segment_length=1000):
        """
        X: list of numpy arrays, each of shape (4, num_samples)
        y: list of numpy arrays, each of shape (num_samples,)
        """
        self.X_segments = []
        self.y_segments = []
        
        # Segment data into fixed-length windows
        for i in range(len(X)):
            x_rec = X[i]
            y_rec = y[i]
            
            num_samples = x_rec.shape[1]
            num_segments = num_samples // segment_length
            
            for j in range(num_segments):
                start = j * segment_length
                end = start + segment_length
                self.X_segments.append(x_rec[:, start:end])
                self.y_segments.append(y_rec[start:end])
                
        self.X_segments = np.array(self.X_segments, dtype=np.float32)
        self.y_segments = np.array(self.y_segments, dtype=np.float32)

    def __len__(self):
        return len(self.X_segments)

    def __getitem__(self, idx):
        # Return x as (4, seq_len) and y as (1, seq_len)
        return torch.tensor(self.X_segments[idx]), torch.tensor(self.y_segments[idx]).unsqueeze(0)

def train_model(model, dataloader, epochs=5, lr=0.001):
    criterion = nn.BCELoss() # Binary Cross Entropy for peak mask
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(batch_x)
            
            # Compute Loss
            loss = criterion(outputs, batch_y)
            
            # Backward pass and optimize
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        print(f"Epoch [{epoch+1}/{epochs}], Loss: {epoch_loss/len(dataloader):.4f}")
        
    return model

if __name__ == "__main__":
    from fetal_ecg_pipeline import load_data
    
    # 1. Load Data
    db_path = r"C:\Users\SAMSUNG\Downloads\abdominal-and-direct-fetal-ecg-database-1.0.0\abdominal-and-direct-fetal-ecg-database-1.0.0"
    print("Loading datasets...")
    X, y = load_data(db_path)
    
    if len(X) > 0:
        # Segment length needs to be divisible by 4 (e.g., 1000) due to 2 max pools
        dataset = FetalECGDataset(X, y, segment_length=1000)
        dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
        
        print(f"Total training segments: {len(dataset)}")
        
        # 2. Build Model
        model = FetalECGModel()
        
        # 3. Train Model
        print("Starting training...")
        # Reduce epochs for quick demonstration
        model = train_model(model, dataloader, epochs=2)
        
        # 4. Save Model
        torch.save(model.state_dict(), "fetal_ecg_model.pth")
        print("Model saved to fetal_ecg_model.pth")
    else:
        print("No data found to train.")
