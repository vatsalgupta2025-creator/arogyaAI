import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import pickle
import os

class VitalsLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=64, num_layers=2, output_size=6):
        super(VitalsLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layer
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        # Fully connected layer
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # Take the output of the last time step for sequence-to-one forecasting
        out = self.fc(out[:, -1, :]) 
        return out

def create_sequences(df, features, seq_len=12, pred_horizon=6):
    """
    Creates sequences of seq_len to predict the vital signs at pred_horizon ahead.
    """
    X, y = [], []
    patient_ids = df['patient_id'].unique()
    
    for pid in patient_ids:
        p_data = df[df['patient_id'] == pid][features].values
        
        if len(p_data) < seq_len + pred_horizon:
            continue
            
        for i in range(len(p_data) - seq_len - pred_horizon + 1):
            X.append(p_data[i : i + seq_len])
            # We predict the vitals at horizon (e.g., 6 hours ahead)
            y.append(p_data[i + seq_len + pred_horizon - 1])
            
    return np.array(X), np.array(y)

def train_lstm_model():
    print("Loading synthetic EHR dataset...")
    data_path = 'data/synthetic_vitals_sepsis.csv'
    if not os.path.exists(data_path):
        print("Dataset not found!")
        return
        
    df = pd.read_csv(data_path)
    features = ['hr', 'spo2', 'temp', 'rr', 'sbp', 'dbp']
    
    print("Normalizing features...")
    # Normalizing data to zero-mean and unit variance
    mean = df[features].mean().values
    std = df[features].std().values
    df[features] = (df[features] - mean) / std
    
    print("Creating sequences (Input=12h, Predict=6h ahead)...")
    X, y = create_sequences(df, features, seq_len=12, pred_horizon=6)
    print(f"Total sequences generated: {len(X)}")
    
    # Train-test split (80/20) - simple split for temporal synthetic data
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    # Convert to PyTorch tensors
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on device: {device}")
    
    X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).to(device)
    X_test_t = torch.tensor(X_test, dtype=torch.float32).to(device)
    y_test_t = torch.tensor(y_test, dtype=torch.float32).to(device)
    
    from torch.utils.data import TensorDataset, DataLoader
    train_data = TensorDataset(X_train_t, y_train_t)
    train_loader = DataLoader(train_data, batch_size=256, shuffle=True)
    
    model = VitalsLSTM(input_size=6, hidden_size=64, num_layers=2, output_size=6).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    epochs = 15
    print("Starting LSTM training...")
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        model.eval()
        with torch.no_grad():
            test_outputs = model(X_test_t)
            test_loss = criterion(test_outputs, y_test_t).item()
            
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {total_loss/len(train_loader):.4f} - Test Loss: {test_loss:.4f}")
        
    # Save the model and scaler
    print("Saving model and scaler metrics...")
    torch.save(model.state_dict(), 'vitals_lstm_model.pth')
    with open('lstm_scaler.pkl', 'wb') as f:
        pickle.dump({'mean': mean, 'std': std}, f)
        
    print("LSTM training successful! Model saved as 'vitals_lstm_model.pth'.")

if __name__ == "__main__":
    train_lstm_model()
