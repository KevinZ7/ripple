import pandas as pd
import numpy as np
import nltk
from sklearn.metrics.pairwise import cosine_similarity
from scipy import sparse
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer

# install nltk packages
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def formatData():
    df = pd.read_csv('raw_data.tsv', sep='\t')

    # remove puntuation
    df['content'] = df['content'].str.replace('[^\w\s]','')

    # tokenization of paragraphs
    df['tokens'] = df['content'].apply(nltk.word_tokenize)

    # lowercase all words
    df['tokens'] = df['tokens'].apply(lambda lst: [word.lower() for word in lst])

    # remove stopwords
    df['tokens'] = df['tokens'].apply(lambda lst: [word for word in lst if not word in stopwords.words()])

    # apply lemmenization
    stemmer = SnowballStemmer('english')
    df['tokens'] = df['tokens'].apply(lambda lst: ' '.join([stemmer.stem(word) for word in lst]))

    # tf-idf vectorizer
    vectorizer = TfidfVectorizer()
    featureVectors = vectorizer.fit_transform(df.tokens)

    # compute cosine similarity
    similarities = cosine_similarity(featureVectors)
    print(similarities)

    threshold = 0.18
    similarPairs = []

    matrixLen = len(similarities)
    if (matrixLen > 0):
        for i in range(matrixLen):
            for j in range(matrixLen):
                if i < j and similarities[i][j] > threshold:
                    similarPairs.append((i, j))

    groups = make_equiv_classes(similarPairs)
    print(groups)

    # output data
    df.to_csv('output.tsv', sep='\t')

def make_equiv_classes(pairs):
    groups = {}
    for (x, y) in pairs:
        xset = groups.get(x, set([x]))
        yset = groups.get(y, set([y]))
        jset = xset | yset
        for z in jset:
            groups[z] = jset
    return set(map(tuple, groups.values()))