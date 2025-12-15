import re
import os
import torch
import numpy as np
import pandas as pd
from tqdm.auto import tqdm
from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, get_scheduler
import emoji
import spacy
from imblearn.over_sampling import RandomOverSampler

# Configuration
BATCH_SIZE = 32
EPOCH = 20
WARMUP_PROPORTION = 0.1
LR = 2e-5
MODEL = 'vinai/bertweet-base'  # BERTweet is optimized for Twitter data
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
os.environ["TOKENIZERS_PARALLELISM"] = "false"
nlp = spacy.load("en_core_web_sm")

# Text Preprocessing Function
def preprocessing(text):
    text = re.sub(r'[\n]', '', text)
    text = re.sub(r'@[A-Za-z0-9]+', '', text)  # Remove mentions
    text = re.sub(r'#', '', text)              # Remove hashtags (keep the text)
    text = re.sub(r'RT[\s]', '', text)         # Remove retweet markers
    text = re.sub(r'https?:\/\/\S+', '', text) # Remove URLs
    text = emoji.demojize(text)                # Convert emojis to text
    text = re.sub(r'[^\w\s]', ' ', text)       # Remove punctuation
    text = re.sub(r'[ ]+', ' ', text)          # Normalize spaces
    text = ' '.join([token.lemma_ for token in nlp(text)])  # Lemmatize
    return text.strip().lower()

# Data Loading Class
class LoadData:
    def __init__(self, path):
        self.data = pd.read_csv(path)

    def load(self):
        # Include all three sentiments: positive, negative, neutral
        self.data = self.data[self.data['airline_sentiment'].isin(['positive', 'negative', 'neutral'])]
        self.data['text'] = self.data['text'].apply(preprocessing)
        self.data = self.data[self.data['text'] != '']
        # Map labels: negative -> 0, neutral -> 1, positive -> 2
        self.data['label'] = self.data['airline_sentiment'].map({'negative': 0, 'neutral': 1, 'positive': 2})
        
        # Oversample minority classes (neutral and positive)
        X = self.data['text'].values.reshape(-1, 1)
        y = self.data['label'].values
        ros = RandomOverSampler(random_state=24)
        X_resampled, y_resampled = ros.fit_resample(X, y)
        self.data = pd.DataFrame({'text': X_resampled.flatten(), 'label': y_resampled})
        
        # Split with stratification to maintain class distribution
        X_train_val, X_test, y_train_val, y_test = train_test_split(
            self.data['text'], self.data['label'], test_size=0.2, random_state=24, stratify=self.data['label']
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_train_val, y_train_val, test_size=0.1, random_state=24, stratify=y_train_val  # 10% validation
        )
        return X_train, X_val, X_test, y_train, y_val, y_test

# Dataset Class for PyTorch
class TweetDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

# Training Class
class TrainModel:
    def __init__(self, model, tokenizer, X_train, X_val, y_train, y_val):
        self.X_train = X_train
        self.X_val = X_val
        self.y_train = y_train
        self.y_val = y_val
        self.model = model
        self.tokenizer = tokenizer
        self.model.to(DEVICE)
        self.train_data = self.create_train_dataset()
        self.val_data = self.create_val_dataset()
        print("Unique labels in y_train:", np.unique(self.y_train))

    def create_train_dataset(self):
        train_encodings = self.tokenizer(self.X_train.tolist(), truncation=True, padding=True, max_length=128)
        return TweetDataset(train_encodings, self.y_train.tolist())

    def create_val_dataset(self):
        val_encodings = self.tokenizer(self.X_val.tolist(), truncation=True, padding=True, max_length=128)
        return TweetDataset(val_encodings, self.y_val.tolist())

    def train(self):
        self.model.train()
        train_loader = DataLoader(self.train_data, batch_size=BATCH_SIZE, shuffle=True)
        val_loader = DataLoader(self.val_data, batch_size=BATCH_SIZE, shuffle=False)
        optimizer = AdamW(self.model.parameters(), lr=LR)
        class_weights = compute_class_weight('balanced', classes=np.array([0, 1, 2]), y=self.y_train)
        class_weights = torch.tensor(class_weights, dtype=torch.float).to(DEVICE)
        loss_fn = torch.nn.CrossEntropyLoss(weight=class_weights)

        num_training_steps = EPOCH * len(train_loader)
        warmup_steps = int(WARMUP_PROPORTION * num_training_steps)
        lr_scheduler = get_scheduler(
            name="cosine",
            optimizer=optimizer,
            num_warmup_steps=warmup_steps,
            num_training_steps=num_training_steps
        )

        best_val_loss = float('inf')
        progress_bar = tqdm(range(num_training_steps))

        for epoch in range(EPOCH):
            self.model.train()
            total_loss = 0
            for batch in train_loader:
                batch = {k: v.to(DEVICE) for k, v in batch.items()}
                outputs = self.model(**batch)
                loss = loss_fn(outputs.logits, batch['labels'])
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)  # Gradient clipping
                optimizer.step()
                lr_scheduler.step()
                optimizer.zero_grad()
                total_loss += loss.item()
                progress_bar.update(1)

            # Validation
            self.model.eval()
            val_loss = 0
            with torch.no_grad():
                for batch in val_loader:
                    batch = {k: v.to(DEVICE) for k, v in batch.items()}
                    outputs = self.model(**batch)
                    val_loss += loss_fn(outputs.logits, batch['labels']).item()
            val_loss /= len(val_loader)

            print(f"Epoch {epoch+1}/{EPOCH}, Train Loss: {total_loss/len(train_loader):.4f}, Val Loss: {val_loss:.4f}")
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                self.model.save_pretrained(f"best_model_epoch_{epoch+1}")

        return self.model, self.tokenizer

# Inference Class
class Inference:
    def __init__(self, model, tokenizer, X_test, y_test):
        self.X_test = X_test
        self.y_test = y_test
        self.model = model
        self.tokenizer = tokenizer
        self.test_data = self.create_test_dataset()

    def create_test_dataset(self):
        test_encodings = self.tokenizer(self.X_test.tolist(), truncation=True, padding=True, max_length=128)
        return TweetDataset(test_encodings, self.y_test.tolist())

    def evaluate(self):
        self.model.eval()
        predictions = np.array([])
        labels = np.array([])
        probs_list = []  # For ROC-AUC
        test_loader = DataLoader(self.test_data, batch_size=BATCH_SIZE*2, shuffle=False)
        for batch in test_loader:
            batch = {k: v.to(DEVICE) for k, v in batch.items()}
            with torch.no_grad():
                outputs = self.model(**batch)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()
            probs_list.append(probs)
            temp_pred = torch.argmax(logits, dim=-1)
            temp_labels = batch["labels"]
            predictions = np.append(predictions, temp_pred.cpu())
            labels = np.append(labels, temp_labels.cpu())
        
        # Stack probabilities for ROC-AUC
        probs = np.vstack(probs_list)
        
        # Classification Report with target names
        print("Classification Report:")
        print(classification_report(labels, predictions, target_names=['negative', 'neutral', 'positive']))
        
        # Confusion Matrix
        print("Confusion Matrix:\n", confusion_matrix(labels, predictions))
        
        # ROC-AUC Score for multi-class (one-vs-rest)
        roc_auc = roc_auc_score(labels, probs, multi_class='ovr', average='macro')
        print("ROC-AUC Score:", roc_auc)
        
        return self.model, self.tokenizer

# Main Execution
if __name__ == "__main__":
    loader = LoadData("/kaggle/input/twitter-airline-sentiment/Tweets.csv")
    X_train, X_val, X_test, y_train, y_val, y_test = loader.load()
    print("Data Loaded!")

    tokenizer = AutoTokenizer.from_pretrained(MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL, num_labels=3, ignore_mismatched_sizes=True  # Now for 3 classes
    )
    print("Fine Tuning Model.....")

    trainer = TrainModel(model, tokenizer, X_train, X_val, y_train, y_val)
    tuned_model, tuned_tokenizer = trainer.train()
    print("Model Trained!")

    evaluator = Inference(tuned_model, tuned_tokenizer, X_test, y_test)
    eval_model, eval_tokenizer = evaluator.evaluate()

    save_folder = '../saved_models'
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)
        print(f"{save_folder} folder created")
    date_time = datetime.now()
    date = date_time.date()
    eval_model.save_pretrained(f"{save_folder}/roberta_senti_tuned_{date}")
    eval_tokenizer.save_pretrained(f"{save_folder}/roberta_senti_tuned_{date}")
    print("Model Saved!")